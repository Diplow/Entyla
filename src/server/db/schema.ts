import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  pgTableCreator,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `pg-drizzle_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  memberships: many(membership),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const organization = createTable(
  "organization",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 200 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("organization_name_idx").on(t.name)],
);

export const membership = createTable(
  "membership",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: d
      .integer()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: d.varchar({ length: 20 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    uniqueIndex("membership_user_org_idx").on(t.userId, t.organizationId),
    index("membership_org_idx").on(t.organizationId),
  ],
);

export const organizationRelations = relations(organization, ({ many }) => ({
  memberships: many(membership),
  budgets: many(budget),
  initiatives: many(initiative),
}));

export const membershipRelations = relations(membership, ({ one }) => ({
  user: one(user, { fields: [membership.userId], references: [user.id] }),
  organization: one(organization, {
    fields: [membership.organizationId],
    references: [organization.id],
  }),
}));

export const company = createTable(
  "company",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 200 }).notNull(),
    linkedinProviderId: d.varchar({ length: 100 }),
    linkedinUrl: d.varchar({ length: 500 }),
    industry: d.varchar({ length: 150 }),
    size: d.varchar({ length: 50 }),
    website: d.varchar({ length: 500 }),
    ownerId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("company_owner_idx").on(t.ownerId),
    uniqueIndex("company_linkedin_provider_owner_idx").on(
      t.linkedinProviderId,
      t.ownerId,
    ),
  ],
);

export const contact = createTable(
  "contact",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    firstName: d.varchar({ length: 100 }).notNull(),
    lastName: d.varchar({ length: 100 }).notNull(),
    email: d.varchar({ length: 255 }),
    company: d.varchar({ length: 200 }),
    jobTitle: d.varchar({ length: 150 }),
    phone: d.varchar({ length: 50 }),
    notes: d.text(),
    linkedinProviderId: d.varchar({ length: 100 }),
    linkedinUrl: d.varchar({ length: 500 }),
    companyId: d.integer().references(() => company.id, { onDelete: "set null" }),
    ownerId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("contact_owner_idx").on(t.ownerId),
    uniqueIndex("contact_linkedin_provider_owner_idx").on(
      t.linkedinProviderId,
      t.ownerId,
    ),
  ],
);

export const conversation = createTable(
  "conversation",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    contactId: d
      .integer()
      .notNull()
      .references(() => contact.id, { onDelete: "cascade" }),
    ownerId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id),
    sellingContext: d.text().notNull(),
    stoppedAt: d.timestamp({ withTimezone: true }),
    stoppedReason: d.varchar({ length: 50 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("conversation_owner_idx").on(t.ownerId)],
);

export const message = createTable(
  "message",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    conversationId: d
      .integer()
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    role: d.varchar({ length: 20 }).notNull(),
    content: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("message_conversation_idx").on(t.conversationId)],
);

// Finance domain tables

export const budget = createTable(
  "budget",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    organizationId: d
      .integer()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    totalPersonDays: d.integer().notNull(),
    periodStart: d.timestamp({ withTimezone: true }).notNull(),
    periodEnd: d.timestamp({ withTimezone: true }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("budget_org_idx").on(t.organizationId),
    uniqueIndex("budget_org_period_idx").on(
      t.organizationId,
      t.periodStart,
      t.periodEnd,
    ),
  ],
);

export const initiative = createTable(
  "initiative",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    organizationId: d
      .integer()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: d.varchar({ length: 200 }).notNull(),
    description: d.text(),
    status: d.varchar({ length: 20 }).notNull(),
    isDefaultBucket: d.boolean().default(false).notNull(),
    proposedById: d
      .varchar({ length: 255 })
      .references(() => user.id, { onDelete: "set null" }),
    approvedById: d
      .varchar({ length: 255 })
      .references(() => user.id, { onDelete: "set null" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("initiative_org_idx").on(t.organizationId),
    index("initiative_status_idx").on(t.status),
  ],
);

export const timeEntry = createTable(
  "time_entry",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    initiativeId: d
      .integer()
      .notNull()
      .references(() => initiative.id, { onDelete: "cascade" }),
    personDays: real("person_days").notNull(),
    weekOf: d.timestamp({ withTimezone: true }).notNull(),
    note: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("time_entry_user_idx").on(t.userId),
    index("time_entry_initiative_idx").on(t.initiativeId),
    uniqueIndex("time_entry_user_initiative_week_idx").on(
      t.userId,
      t.initiativeId,
      t.weekOf,
    ),
  ],
);

// Coaching domain tables

export const coachingSession = createTable(
  "coaching_session",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: d
      .integer()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    weekOf: d.timestamp({ withTimezone: true }).notNull(),
    status: d.varchar({ length: 20 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    completedAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [
    index("coaching_session_user_idx").on(t.userId),
    uniqueIndex("coaching_session_user_week_idx").on(t.userId, t.weekOf),
    index("coaching_session_org_idx").on(t.organizationId),
  ],
);

export const coachingMessage = createTable(
  "coaching_message",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    sessionId: d
      .integer()
      .notNull()
      .references(() => coachingSession.id, { onDelete: "cascade" }),
    role: d.varchar({ length: 20 }).notNull(),
    content: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("coaching_message_session_idx").on(t.sessionId)],
);

export const companyRelations = relations(company, ({ one, many }) => ({
  owner: one(user, { fields: [company.ownerId], references: [user.id] }),
  contacts: many(contact),
}));

export const contactRelations = relations(contact, ({ one }) => ({
  owner: one(user, { fields: [contact.ownerId], references: [user.id] }),
  companyRef: one(company, { fields: [contact.companyId], references: [company.id] }),
}));

export const conversationRelations = relations(conversation, ({ one, many }) => ({
  contact: one(contact, { fields: [conversation.contactId], references: [contact.id] }),
  owner: one(user, { fields: [conversation.ownerId], references: [user.id] }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, { fields: [message.conversationId], references: [conversation.id] }),
}));

// Finance domain relations

export const budgetRelations = relations(budget, ({ one }) => ({
  organization: one(organization, {
    fields: [budget.organizationId],
    references: [organization.id],
  }),
}));

export const initiativeRelations = relations(initiative, ({ one, many }) => ({
  organization: one(organization, {
    fields: [initiative.organizationId],
    references: [organization.id],
  }),
  proposedBy: one(user, {
    fields: [initiative.proposedById],
    references: [user.id],
    relationName: "proposedInitiatives",
  }),
  approvedBy: one(user, {
    fields: [initiative.approvedById],
    references: [user.id],
    relationName: "approvedInitiatives",
  }),
  timeEntries: many(timeEntry),
}));

export const timeEntryRelations = relations(timeEntry, ({ one }) => ({
  user: one(user, { fields: [timeEntry.userId], references: [user.id] }),
  initiative: one(initiative, {
    fields: [timeEntry.initiativeId],
    references: [initiative.id],
  }),
}));

// Coaching domain relations

export const coachingSessionRelations = relations(
  coachingSession,
  ({ one, many }) => ({
    user: one(user, {
      fields: [coachingSession.userId],
      references: [user.id],
    }),
    organization: one(organization, {
      fields: [coachingSession.organizationId],
      references: [organization.id],
    }),
    messages: many(coachingMessage),
  }),
);

export const coachingMessageRelations = relations(
  coachingMessage,
  ({ one }) => ({
    session: one(coachingSession, {
      fields: [coachingMessage.sessionId],
      references: [coachingSession.id],
    }),
  }),
);

// Slack integration table

export const slackUserMapping = createTable(
  "slack_user_mapping",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slackUserId: d.varchar({ length: 50 }).notNull(),
    slackTeamId: d.varchar({ length: 50 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    uniqueIndex("slack_user_mapping_user_idx").on(t.userId),
    uniqueIndex("slack_user_mapping_slack_idx").on(t.slackUserId, t.slackTeamId),
  ],
);

export const slackUserMappingRelations = relations(
  slackUserMapping,
  ({ one }) => ({
    user: one(user, {
      fields: [slackUserMapping.userId],
      references: [user.id],
    }),
  }),
);
