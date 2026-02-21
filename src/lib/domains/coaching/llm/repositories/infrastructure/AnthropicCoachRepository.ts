import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "~/env";
import type { CoachRepository } from "../CoachRepository";
import type { CoachingContext } from "../../../objects";
import type { FeedbackRequest, FeedbackResult, InitiationResult } from "../../objects";

const feedbackToolInputSchema = z.object({
  content: z.string().min(1, "content must be a non-empty string"),
  suggestFormalization: z.boolean(),
  flaggedStall: z.boolean(),
});

function formatInitiatives(context: CoachingContext): string {
  if (context.initiatives.length === 0) {
    return "No active initiatives yet.";
  }

  return context.initiatives
    .map((initiative) => {
      const description = initiative.description
        ? ` - ${initiative.description}`
        : "";
      const bucket = initiative.isDefaultBucket ? " (default exploration bucket)" : "";
      return `- ${initiative.name}${bucket}${description}`;
    })
    .join("\n");
}

function formatRecentActivity(context: CoachingContext): string {
  if (context.recentTimeEntries.length === 0) {
    return "No time logged in the past 4 weeks.";
  }

  return context.recentTimeEntries
    .map((entry) => {
      const note = entry.note ? ` - "${entry.note}"` : "";
      const weekDate = entry.weekOf.toISOString().split("T")[0];
      return `- Week of ${weekDate}: ${entry.personDays} day(s) on ${entry.initiativeName}${note}`;
    })
    .join("\n");
}

function formatPreviousMessages(context: CoachingContext): string {
  if (context.previousMessages.length === 0) {
    return "No previous coaching interactions.";
  }

  return context.previousMessages
    .slice(-6) // Keep last 6 messages for context
    .map((message) => {
      const speaker = message.role === "coach" ? "Coach" : "Member";
      return `${speaker}: ${message.content}`;
    })
    .join("\n\n");
}

function buildInitiationSystemPrompt(context: CoachingContext): string {
  return `You are a supportive AI experimentation coach. Your job is to initiate a weekly check-in with a team member about their AI experimentation work.

## Tone
- Warm but concise (2-3 sentences max)
- Frame as "investing time" and "capturing learnings", not reporting
- Always give something back (encouragement, observation, suggestion)
- Use casual, friendly language appropriate for Slack

## Member: ${context.userName}

## Their Active Initiatives
${formatInitiatives(context)}

## Recent Activity (last 4 weeks)
${formatRecentActivity(context)}

## Previous Coaching Interactions
${formatPreviousMessages(context)}

## Your Task
Write a personalized weekly check-in prompt. Reference what they worked on previously if applicable. If they had no activity last week, acknowledge it with curiosity, not judgment. Keep it to 2-3 sentences.`;
}

function buildInitiationMessages(): Anthropic.MessageParam[] {
  return [
    {
      role: "user",
      content: "Write the weekly check-in message for this team member.",
    },
  ];
}

function formatUserReport(request: FeedbackRequest): string {
  const { userReport } = request;

  if (userReport.entries.length === 0) {
    return "No time logged this week.";
  }

  const entriesText = userReport.entries
    .map((entry) => {
      const note = entry.note ? ` - "${entry.note}"` : "";
      return `- ${entry.initiativeName}: ${entry.personDays} day(s)${note}`;
    })
    .join("\n");

  const freeformText = userReport.freeformNote
    ? `\n\nAdditional note: "${userReport.freeformNote}"`
    : "";

  return entriesText + freeformText;
}

function buildFeedbackSystemPrompt(request: FeedbackRequest): string {
  const { context } = request;

  return `You are a supportive AI experimentation coach responding to a team member's weekly update.

## Coaching Principles
- Always give something back: feedback, encouragement, or a practical suggestion
- Normalize difficulty when someone is stuck
- Build on context from previous weeks
- Keep it to 2-3 sentences max
- Celebrate progress without being over-the-top

## Member: ${context.userName}

## Active Initiatives
${formatInitiatives(context)}

## Previous Weeks Context
${formatRecentActivity(context)}

## Previous Coaching Interactions
${formatPreviousMessages(context)}

## This Week's Report
${formatUserReport(request)}

## Structured Response Required
Use the coaching_feedback tool to provide:
- content: Your coaching message (2-3 sentences)
- suggestFormalization: true if 2+ weeks of concrete progress on something not yet a formal initiative
- flaggedStall: true if an initiative has had no activity for 2+ weeks`;
}

function buildFeedbackMessages(): Anthropic.MessageParam[] {
  return [
    {
      role: "user",
      content: "Provide coaching feedback for this week's report.",
    },
  ];
}

const COACHING_FEEDBACK_TOOL: Anthropic.Tool = {
  name: "coaching_feedback",
  description: "Provide coaching feedback with structured metadata",
  input_schema: {
    type: "object" as const,
    properties: {
      content: {
        type: "string",
        description: "The coaching response (2-3 sentences, Slack-appropriate)",
      },
      suggestFormalization: {
        type: "boolean",
        description: "Whether to suggest creating a formal initiative",
      },
      flaggedStall: {
        type: "boolean",
        description: "Whether a stall was detected on an initiative",
      },
    },
    required: ["content", "suggestFormalization", "flaggedStall"],
  },
};

export class AnthropicCoachRepository implements CoachRepository {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  async generateInitiation(context: CoachingContext): Promise<InitiationResult> {
    const modelId = "claude-sonnet-4-5-20250929";
    const response = await this.client.messages.create({
      model: modelId,
      max_tokens: 512,
      system: buildInitiationSystemPrompt(context),
      messages: buildInitiationMessages(),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return {
      content: textBlock?.text ?? "",
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model: modelId,
      },
    };
  }

  async generateFeedback(request: FeedbackRequest): Promise<FeedbackResult> {
    const modelId = "claude-sonnet-4-5-20250929";
    const response = await this.client.messages.create({
      model: modelId,
      max_tokens: 512,
      system: buildFeedbackSystemPrompt(request),
      messages: buildFeedbackMessages(),
      tools: [COACHING_FEEDBACK_TOOL],
      tool_choice: { type: "tool", name: "coaching_feedback" },
    });

    const toolUseBlock = response.content.find((block) => block.type === "tool_use");
    if (toolUseBlock?.type !== "tool_use") {
      throw new Error("Expected tool_use response from LLM");
    }

    const parseResult = feedbackToolInputSchema.safeParse(toolUseBlock.input);
    if (!parseResult.success) {
      throw new Error(`Invalid LLM response: ${parseResult.error.message}`);
    }
    const toolInput = parseResult.data;

    return {
      content: toolInput.content,
      suggestFormalization: toolInput.suggestFormalization,
      flaggedStall: toolInput.flaggedStall,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model: modelId,
      },
    };
  }
}
