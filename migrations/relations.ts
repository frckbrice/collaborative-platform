import { relations } from 'drizzle-orm/relations';
import {
  workspaces,
  folders,
  users,
  customers,
  products,
  prices,
  subscriptions,
  files,
  collaborators,
} from './schema';

export const foldersRelations = relations(folders, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [folders.workspace_id],
    references: [workspaces.id],
  }),
  files: many(files),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  folders: many(folders),
  files: many(files),
  collaborators: many(collaborators),
}));

export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  collaborators: many(collaborators),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  // usersInAuth: one(usersInAuth, {
  //   fields: [customers.id],
  //   references: [usersInAuth.id],
  // }),
}));

export const pricesRelations = relations(prices, ({ one, many }) => ({
  product: one(products, {
    fields: [prices.product_id],
    references: [products.id],
  }),
  subscriptions_price_id: many(subscriptions, {
    relationName: 'subscriptions_price_id_prices_id',
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  prices: many(prices),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  price_price_id: one(prices, {
    fields: [subscriptions.price_id],
    references: [prices.id],
    relationName: 'subscriptions_price_id_prices_id',
  }),
  user: one(users, {
    fields: [subscriptions.user_id],
    references: [users.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folder_id],
    references: [folders.id],
  }),
  workspace: one(workspaces, {
    fields: [files.workspace_id],
    references: [workspaces.id],
  }),
}));

export const collaboratorsRelations = relations(collaborators, ({ one }) => ({
  user: one(users, {
    fields: [collaborators.user_id],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [collaborators.workspace_id],
    references: [workspaces.id],
  }),
}));
