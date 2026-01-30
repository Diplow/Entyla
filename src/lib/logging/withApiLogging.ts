import { _getPostHogClient } from "./posthogClient";

type RouteHandler = (...args: never[]) => Promise<Response>;

interface ApiAnalyticsEvent {
  route: string;
  method: string;
  statusCode: number;
  durationMs: number;
  status: "success" | "error";
}

function _captureApiAnalyticsEvent(event: ApiAnalyticsEvent): void {
  const posthogClient = _getPostHogClient();
  if (!posthogClient) return;

  posthogClient.capture({
    distinctId: "server",
    event: "api_call",
    properties: event,
  });
}

export function withApiLogging<T extends Record<string, RouteHandler>>(
  routePattern: string,
  handlers: T,
): T {
  const wrappedHandlers = {} as Record<string, unknown>;

  for (const methodName of Object.keys(handlers)) {
    const originalHandler = handlers[methodName]!;

    wrappedHandlers[methodName] = async (...args: unknown[]) => {
      const startTime = performance.now();
      try {
        const response = await originalHandler(...(args as never[]));
        const durationMs = Math.round(performance.now() - startTime);
        const event: ApiAnalyticsEvent = {
          route: routePattern,
          method: methodName,
          statusCode: response.status,
          durationMs,
          status: "success",
        };
        console.log(JSON.stringify(event));
        _captureApiAnalyticsEvent(event);
        return response;
      } catch (error) {
        const durationMs = Math.round(performance.now() - startTime);
        const event: ApiAnalyticsEvent = {
          route: routePattern,
          method: methodName,
          statusCode: 500,
          durationMs,
          status: "error",
        };
        console.log(JSON.stringify(event));
        _captureApiAnalyticsEvent(event);
        throw error;
      }
    };
  }

  return wrappedHandlers as T;
}
