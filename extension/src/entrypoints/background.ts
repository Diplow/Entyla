import { defineBackground } from "wxt/sandbox";
import type { ApiMessage, ApiResponse } from "../lib/types";

export type { ApiMessage, ApiResponse };

const BASE_URL = import.meta.env.WXT_API_URL ?? "http://localhost:3000";

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener(
    (message: ApiMessage, _sender, sendResponse: (response: ApiResponse) => void) => {
      if (message.type !== "api-request") return false;

      void handleApiRequest(message).then(sendResponse);

      // Return true to keep the message channel open for async response
      return true;
    },
  );
});

async function handleApiRequest(message: ApiMessage): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}${message.path}`, {
      method: message.method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: message.body ? JSON.stringify(message.body) : undefined,
    });

    const data: unknown = await response.json().catch(() => ({}));

    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Network error" } };
  }
}
