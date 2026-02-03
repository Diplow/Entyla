import { z } from "zod";

import { IamService, getEffectiveToneOfVoice } from "~/lib/domains/iam";
import { withApiLogging } from "~/lib/logging";
import { resolveSessionUserId } from "~/server/better-auth";

const updatePreferencesSchema = z.object({
  companyKnowledge: z.string().optional(),
  toneOfVoice: z.string().optional(),
  exampleMessages: z.array(z.string()).max(10).optional(),
});

async function handleGetPreferences() {
  const currentUser = await IamService.getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await IamService.getAiPreferences(currentUser.id);

  if (!preferences) {
    return Response.json({
      companyKnowledge: null,
      toneOfVoice: null,
      exampleMessages: [],
      onboardingCompleted: false,
    });
  }

  return Response.json({
    companyKnowledge: preferences.companyKnowledge,
    toneOfVoice: getEffectiveToneOfVoice(preferences),
    exampleMessages: preferences.exampleMessages,
    onboardingCompleted: preferences.onboardingCompleted,
  });
}

async function handleUpdatePreferences(request: Request) {
  const currentUser = await IamService.getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: `Invalid JSON: ${message}` },
      { status: 400 },
    );
  }

  const parseResult = updatePreferencesSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json(
      { error: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const updatedPreferences = await IamService.updateAiPreferences(
    currentUser.id,
    parseResult.data,
  );

  return Response.json({
    companyKnowledge: updatedPreferences.companyKnowledge,
    toneOfVoice: getEffectiveToneOfVoice(updatedPreferences),
    exampleMessages: updatedPreferences.exampleMessages,
    onboardingCompleted: updatedPreferences.onboardingCompleted,
  });
}

const handlers = withApiLogging(
  "/api/ai-preferences",
  { GET: handleGetPreferences, PUT: handleUpdatePreferences },
  resolveSessionUserId,
);

export const { GET, PUT } = handlers;
