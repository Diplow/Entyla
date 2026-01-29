import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import {
  initializeTestDb,
  cleanTestDb,
  teardownTestDb,
} from "../helpers/setupTestDb";

// --- Mock ~/server/db before any domain code loads ---

const testDbPromise = initializeTestDb();

vi.mock("~/server/db", async () => {
  const { db } = await testDbPromise;
  const { contact } = await import("~/server/db/schema");
  return { db, contact };
});

// --- Import the service AFTER the mock is set up ---

const { ContactService } = await import(
  "~/lib/domains/prospect/services/ContactService"
);

// --- Helpers ---

const OWNER_A = "user-owner-a";
const OWNER_B = "user-owner-b";

async function seedTestUsers() {
  const { db } = await testDbPromise;
  const { user } = await import("~/server/db/schema");

  await db.insert(user).values([
    {
      id: OWNER_A,
      name: "Owner A",
      email: "owner-a@test.com",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: OWNER_B,
      name: "Owner B",
      email: "owner-b@test.com",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

const fullContactInput = {
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  company: "Acme Corp",
  jobTitle: "Engineer",
  phone: "+1234567890",
  notes: "Met at conference",
};

const minimalContactInput = {
  firstName: "Bob",
  lastName: "Jones",
};

// --- Lifecycle ---

beforeEach(async () => {
  await cleanTestDb();
  await seedTestUsers();
});

afterAll(async () => {
  await teardownTestDb();
});

// --- Tests ---

describe("ContactService.create", () => {
  it("creates contact with all fields", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    expect(created).toMatchObject({
      ...fullContactInput,
      ownerId: OWNER_A,
    });
    expect(created.id).toBeTypeOf("number");
    expect(created.createdAt).toBeInstanceOf(Date);
  });

  it("creates contact with required fields only", async () => {
    const created = await ContactService.create(OWNER_A, minimalContactInput);

    expect(created.firstName).toBe("Bob");
    expect(created.lastName).toBe("Jones");
    expect(created.email).toBeNull();
    expect(created.company).toBeNull();
    expect(created.jobTitle).toBeNull();
    expect(created.phone).toBeNull();
    expect(created.notes).toBeNull();
  });

  it("assigns unique ids", async () => {
    const firstContact = await ContactService.create(
      OWNER_A,
      fullContactInput,
    );
    const secondContact = await ContactService.create(
      OWNER_A,
      minimalContactInput,
    );

    expect(firstContact.id).not.toBe(secondContact.id);
  });
});

describe("ContactService.getById", () => {
  it("returns contact when owned by caller", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    const found = await ContactService.getById(created.id, OWNER_A);

    expect(found).toMatchObject({ id: created.id, firstName: "Alice" });
  });

  it("returns null for another owner's contact", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    const found = await ContactService.getById(created.id, OWNER_B);

    expect(found).toBeNull();
  });

  it("returns null for non-existent id", async () => {
    const found = await ContactService.getById(99999, OWNER_A);

    expect(found).toBeNull();
  });
});

describe("ContactService.list", () => {
  it("returns all contacts for owner", async () => {
    await ContactService.create(OWNER_A, fullContactInput);
    await ContactService.create(OWNER_A, minimalContactInput);

    const contactList = await ContactService.list(OWNER_A);

    expect(contactList).toHaveLength(2);
  });

  it("returns empty array when none exist", async () => {
    const contactList = await ContactService.list(OWNER_A);

    expect(contactList).toEqual([]);
  });

  it("excludes other owners' contacts", async () => {
    await ContactService.create(OWNER_A, fullContactInput);
    await ContactService.create(OWNER_B, minimalContactInput);

    const ownerAContacts = await ContactService.list(OWNER_A);

    expect(ownerAContacts).toHaveLength(1);
    expect(ownerAContacts[0]!.firstName).toBe("Alice");
  });
});

describe("ContactService.update", () => {
  it("updates specified fields", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    const updated = await ContactService.update(created.id, OWNER_A, {
      firstName: "Alicia",
      company: "New Corp",
    });

    expect(updated).toMatchObject({
      id: created.id,
      firstName: "Alicia",
      company: "New Corp",
    });
  });

  it("preserves unmodified fields", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    const updated = await ContactService.update(created.id, OWNER_A, {
      firstName: "Alicia",
    });

    expect(updated!.lastName).toBe("Smith");
    expect(updated!.email).toBe("alice@example.com");
    expect(updated!.phone).toBe("+1234567890");
  });

  it("returns null for another owner's contact", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    const result = await ContactService.update(created.id, OWNER_B, {
      firstName: "Hacked",
    });

    expect(result).toBeNull();
  });

  it("does NOT modify when ownership check fails", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    await ContactService.update(created.id, OWNER_B, {
      firstName: "Hacked",
    });

    const unchanged = await ContactService.getById(created.id, OWNER_A);
    expect(unchanged!.firstName).toBe("Alice");
  });

  it("returns null for non-existent contact", async () => {
    const result = await ContactService.update(99999, OWNER_A, {
      firstName: "Ghost",
    });

    expect(result).toBeNull();
  });

  it("can set optional fields to null", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    const updated = await ContactService.update(created.id, OWNER_A, {
      email: null,
      phone: null,
    });

    expect(updated!.email).toBeNull();
    expect(updated!.phone).toBeNull();
  });
});

describe("ContactService.delete", () => {
  it("deletes owned contact and returns true", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    const deleted = await ContactService.delete(created.id, OWNER_A);

    expect(deleted).toBe(true);

    const found = await ContactService.getById(created.id, OWNER_A);
    expect(found).toBeNull();
  });

  it("returns false for another owner's contact", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    const deleted = await ContactService.delete(created.id, OWNER_B);

    expect(deleted).toBe(false);
  });

  it("does NOT delete when ownership check fails", async () => {
    const created = await ContactService.create(OWNER_A, fullContactInput);

    await ContactService.delete(created.id, OWNER_B);

    const stillExists = await ContactService.getById(created.id, OWNER_A);
    expect(stillExists).not.toBeNull();
  });

  it("returns false for non-existent contact", async () => {
    const deleted = await ContactService.delete(99999, OWNER_A);

    expect(deleted).toBe(false);
  });
});
