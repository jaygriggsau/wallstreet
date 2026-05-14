import {
  pgTable,
  text,
  integer,
  bigint,
  numeric,
  timestamp,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  cashCents: bigint("cash_cents", { mode: "number" }).notNull().default(10_000_00),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (a) => ({ pk: primaryKey({ columns: [a.provider, a.providerAccountId] }) })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({ pk: primaryKey({ columns: [vt.identifier, vt.token] }) })
);

export const stocks = pgTable(
  "stocks",
  {
    id: text("id").primaryKey(),
    symbol: text("symbol").notNull(),
    name: text("name").notNull(),
    sector: text("sector").notNull(),
    priceCents: bigint("price_cents", { mode: "number" }).notNull(),
    prevPriceCents: bigint("prev_price_cents", { mode: "number" }).notNull(),
    volatility: numeric("volatility", { precision: 6, scale: 4 }).notNull().default("0.02"),
    drift: numeric("drift", { precision: 6, scale: 4 }).notNull().default("0.0001"),
    sharesOutstanding: bigint("shares_outstanding", { mode: "number" }).notNull().default(1_000_000),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({ symbolIdx: uniqueIndex("stocks_symbol_idx").on(t.symbol) })
);

export const holdings = pgTable(
  "holdings",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    stockId: text("stock_id").notNull().references(() => stocks.id, { onDelete: "cascade" }),
    shares: bigint("shares", { mode: "number" }).notNull().default(0),
    avgCostCents: bigint("avg_cost_cents", { mode: "number" }).notNull().default(0),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.stockId] }) })
);

export const trades = pgTable("trades", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stockId: text("stock_id").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  side: text("side", { enum: ["buy", "sell"] }).notNull(),
  shares: bigint("shares", { mode: "number" }).notNull(),
  priceCents: bigint("price_cents", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const priceHistory = pgTable("price_history", {
  id: text("id").primaryKey(),
  stockId: text("stock_id").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  priceCents: bigint("price_cents", { mode: "number" }).notNull(),
  at: timestamp("at").notNull().defaultNow(),
});
