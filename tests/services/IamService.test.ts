import { describe, it, expect, vi } from "vitest";
import { getTestInstance } from "better-auth/test";

// --- Mock environment (prevents env validation from failing) ---

vi.mock("~/env", () => ({
  env: {
    DATABASE_URL: "postgres://test:test@localhost:5432/test",
    ANTHROPIC_API_KEY: "test-key",
    BETTER_AUTH_GOOGLE_CLIENT_ID: "test-client-id",
    BETTER_AUTH_GOOGLE_CLIENT_SECRET: "test-client-secret",
    NODE_ENV: "test",
  },
}));

// --- Mock database (prevents real DB connection) ---

vi.mock("~/server/db", () => ({
  db: {},
  creditBalance: {},
}));

// --- Create test auth instance (in-memory SQLite) ---

const testInstancePromise = getTestInstance(
  { emailAndPassword: { enabled: true } },
  { disableTestUser: true },
);

let mockSessionHeaders: Headers = new Headers();

vi.mock("~/server/better-auth", async () => {
  const { auth } = await testInstancePromise;
  return {
    auth,
    getSession: async () => auth.api.getSession({ headers: mockSessionHeaders }),
  };
});

// --- Import the service AFTER the mock is set up ---

const { IamService } = await import(
  "~/lib/domains/iam/services/IamService"
);

// --- Helpers ---

async function signUpUser(email: string, name: string, password: string) {
  const { auth } = await testInstancePromise;
  return auth.api.signUpEmail({
    body: { email, name, password },
  });
}

async function signInAndGetHeaders(email: string, password: string) {
  const { signInWithUser } = await testInstancePromise;
  const { headers } = await signInWithUser(email, password);
  return headers;
}

// --- Tests ---

describe("IamService.getCurrentUser", () => {
  it("returns null when no auth headers", async () => {
    mockSessionHeaders = new Headers();

    const result = await IamService.getCurrentUser();

    expect(result).toBeNull();
  });

  it("returns null for invalid session token", async () => {
    const invalidHeaders = new Headers();
    invalidHeaders.set("cookie", "better-auth.session_token=invalid-garbage-token");
    mockSessionHeaders = invalidHeaders;

    const result = await IamService.getCurrentUser();

    expect(result).toBeNull();
  });

  it("returns user for valid session", async () => {
    await signUpUser("alice@test.com", "Alice", "password123");
    mockSessionHeaders = await signInAndGetHeaders("alice@test.com", "password123");

    const result = await IamService.getCurrentUser();

    expect(result).not.toBeNull();
    expect(result!.email).toBe("alice@test.com");
    expect(result!.name).toBe("Alice");
  });

  it("maps all user fields correctly", async () => {
    await signUpUser("bob@test.com", "Bob Smith", "password123");
    mockSessionHeaders = await signInAndGetHeaders("bob@test.com", "password123");

    const result = await IamService.getCurrentUser();

    expect(result).toMatchObject({
      email: "bob@test.com",
      name: "Bob Smith",
      image: null,
    });
    expect(result!.id).toBeTypeOf("string");
    expect(result!.id.length).toBeGreaterThan(0);
  });

  it("returns null after session is revoked", async () => {
    await signUpUser("carol@test.com", "Carol", "password123");
    const sessionHeaders = await signInAndGetHeaders("carol@test.com", "password123");
    mockSessionHeaders = sessionHeaders;

    // Verify session works before revoking
    const beforeRevoke = await IamService.getCurrentUser();
    expect(beforeRevoke).not.toBeNull();

    // Revoke all sessions for this user
    const { auth } = await testInstancePromise;
    await auth.api.revokeSessions({ headers: sessionHeaders });

    const afterRevoke = await IamService.getCurrentUser();

    expect(afterRevoke).toBeNull();
  });

  it("returns correct user among multiple users", async () => {
    await signUpUser("dan@test.com", "Dan", "password123");
    await signUpUser("eve@test.com", "Eve", "password123");

    const danHeaders = await signInAndGetHeaders("dan@test.com", "password123");
    const eveHeaders = await signInAndGetHeaders("eve@test.com", "password123");

    mockSessionHeaders = danHeaders;
    const danResult = await IamService.getCurrentUser();

    mockSessionHeaders = eveHeaders;
    const eveResult = await IamService.getCurrentUser();

    expect(danResult!.email).toBe("dan@test.com");
    expect(danResult!.name).toBe("Dan");
    expect(eveResult!.email).toBe("eve@test.com");
    expect(eveResult!.name).toBe("Eve");
    expect(danResult!.id).not.toBe(eveResult!.id);
  });
});
