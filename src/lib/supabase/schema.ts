import { pgTable, uuid, timestamp, text, jsonb, integer, boolean } from 'drizzle-orm/pg-core';
import { prices, products, subscription_status, users } from '../../../migrations/schema';
import { One, relations, sql } from 'drizzle-orm';

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
  workspaceOwner: uuid('workspaces_owner').notNull(),
  title: text('title').notNull(),
  iconId: text('icon_id').notNull(),
  data: text('data').notNull(),
  inTrash: text('in_trash'),
  logo: text('logo'),
  bannerUrl: text('banner_url'),
});

export const folders = pgTable('folders', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
  title: text('title').notNull(),
  iconId: text('icon_id').notNull(),
  data: text('data').notNull(),
  inTrash: text('in_trash'),
  bannerUrl: text('banner_url'),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, {
      onDelete: 'cascade',
    }),
});

export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
  title: text('title').notNull(),
  iconId: text('icon_id').notNull(),
  data: text('data').notNull(),
  inTrash: text('in_trash'),
  bannerUrl: text('banner_url'),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, {
      onDelete: 'cascade',
    }),
  folderId: uuid('folder_id')
    .notNull()
    .references(() => folders.id, {
      onDelete: 'cascade',
    }),
});

//we copy this subscripto=ion here from /migration/schema because it is going to update at each migration

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().notNull(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id)
    .references(() => users.id),
  status: subscription_status('status'),
  metadata: jsonb('metadata'),
  price_id: text('price_id')
    .references(() => prices.id)
    .references(() => prices.id),
  quantity: integer('quantity'),
  cancel_at_period_end: boolean('cancel_at_period_end'),
  created: timestamp('created', { withTimezone: true, mode: 'string' })
    .default(sql`now()`)
    .notNull(),
  current_period_start: timestamp('current_period_start', { withTimezone: true, mode: 'string' })
    .default(sql`now()`)
    .notNull(),
  current_period_end: timestamp('current_period_end', { withTimezone: true, mode: 'string' })
    .default(sql`now()`)
    .notNull(),
  ended_at: timestamp('ended_at', { withTimezone: true, mode: 'string' }).default(sql`now()`),
  cancel_at: timestamp('cancel_at', { withTimezone: true, mode: 'string' }).default(sql`now()`),
  canceled_at: timestamp('canceled_at', { withTimezone: true, mode: 'string' }).default(sql`now()`),
  trial_start: timestamp('trial_start', { withTimezone: true, mode: 'string' }).default(sql`now()`),
  trial_end: timestamp('trial_end', { withTimezone: true, mode: 'string' }).default(sql`now()`),
});

export const collaborators = pgTable('collaborators', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, {
      onDelete: 'cascade',
    }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),
});

// set relationship between Price and Product
export const productRelations = relations(products, ({ many }) => ({
  prices: many(prices),
}));

export const priceRelations = relations(prices, ({ one }) => ({
  product: one(products, {
    fields: [prices.product_id],
    references: [products.id],
  }),
}));

//TODO set all the relations for other tables
