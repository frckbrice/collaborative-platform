'use strict';
var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function (cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.priceRelations =
  exports.productRelations =
  exports.collaborators =
  exports.files =
  exports.__drizzle_migrations =
  exports.subscriptions =
  exports.prices =
  exports.products =
  exports.customers =
  exports.users =
  exports.folders =
  exports.workspaces =
  exports.migrations =
  exports.equality_op =
  exports.action =
  exports.subscription_status =
  exports.pricing_type =
  exports.pricing_plan_interval =
  exports.key_type =
  exports.key_status =
  exports.one_time_token_type =
  exports.factor_type =
  exports.factor_status =
  exports.code_challenge_method =
  exports.aal_level =
    void 0;
var pg_core_1 = require('drizzle-orm/pg-core');
var drizzle_orm_1 = require('drizzle-orm');
exports.aal_level = (0, pg_core_1.pgEnum)('aal_level', ['aal1', 'aal2', 'aal3']);
exports.code_challenge_method = (0, pg_core_1.pgEnum)('code_challenge_method', ['s256', 'plain']);
exports.factor_status = (0, pg_core_1.pgEnum)('factor_status', ['unverified', 'verified']);
exports.factor_type = (0, pg_core_1.pgEnum)('factor_type', ['totp', 'webauthn']);
exports.one_time_token_type = (0, pg_core_1.pgEnum)('one_time_token_type', [
  'confirmation_token',
  'reauthentication_token',
  'recovery_token',
  'email_change_token_new',
  'email_change_token_current',
  'phone_change_token',
]);
exports.key_status = (0, pg_core_1.pgEnum)('key_status', [
  'default',
  'valid',
  'invalid',
  'expired',
]);
exports.key_type = (0, pg_core_1.pgEnum)('key_type', [
  'aead-ietf',
  'aead-det',
  'hmacsha512',
  'hmacsha256',
  'auth',
  'shorthash',
  'generichash',
  'kdf',
  'secretbox',
  'secretstream',
  'stream_xchacha20',
]);
exports.pricing_plan_interval = (0, pg_core_1.pgEnum)('pricing_plan_interval', [
  'day',
  'week',
  'month',
  'year',
]);
exports.pricing_type = (0, pg_core_1.pgEnum)('pricing_type', ['one_time', 'recurring']);
exports.subscription_status = (0, pg_core_1.pgEnum)('subscription_status', [
  'trialing',
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'unpaid',
]);
exports.action = (0, pg_core_1.pgEnum)('action', [
  'INSERT',
  'UPDATE',
  'DELETE',
  'TRUNCATE',
  'ERROR',
]);
exports.equality_op = (0, pg_core_1.pgEnum)('equality_op', [
  'eq',
  'neq',
  'lt',
  'lte',
  'gt',
  'gte',
  'in',
]);
exports.migrations = (0, pg_core_1.pgTable)('migrations', {
  id: (0, pg_core_1.serial)('id').primaryKey().notNull(),
  hash: (0, pg_core_1.text)('hash').notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  created_at: (0, pg_core_1.bigint)('created_at', { mode: 'number' }),
});
exports.workspaces = (0, pg_core_1.pgTable)('workspaces', {
  id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey().notNull(),
  created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true, mode: 'string' }),
  workspaces_owner: (0, pg_core_1.uuid)('workspaces_owner').notNull(),
  title: (0, pg_core_1.text)('title').notNull(),
  icon_id: (0, pg_core_1.text)('icon_id').notNull(),
  data: (0, pg_core_1.text)('data').notNull(),
  in_trash: (0, pg_core_1.text)('in_trash'),
  logo: (0, pg_core_1.text)('logo'),
  banner_url: (0, pg_core_1.text)('banner_url'),
});
exports.folders = (0, pg_core_1.pgTable)('folders', {
  id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey().notNull(),
  created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true, mode: 'string' }),
  title: (0, pg_core_1.text)('title').notNull(),
  icon_id: (0, pg_core_1.text)('icon_id').notNull(),
  data: (0, pg_core_1.text)('data').notNull(),
  in_trash: (0, pg_core_1.text)('in_trash'),
  banner_url: (0, pg_core_1.text)('banner_url'),
  workspace_id: (0, pg_core_1.uuid)('workspace_id')
    .notNull()
    .references(
      function () {
        return exports.workspaces.id;
      },
      { onDelete: 'cascade' }
    ),
});
exports.users = (0, pg_core_1.pgTable)(
  'users',
  {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull(),
    full_name: (0, pg_core_1.text)('full_name'),
    avatar_url: (0, pg_core_1.text)('avatar_url'),
    billing_address: (0, pg_core_1.jsonb)('billing_address'),
    payment_method: (0, pg_core_1.jsonb)('payment_method'),
    email: (0, pg_core_1.text)('email'),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true, mode: 'string' }),
  },
  function (table) {
    return {
      users_id_fkey: (0, pg_core_1.foreignKey)({
        columns: [table.id],
        foreignColumns: [table.id],
        name: 'users_id_fkey',
      }),
    };
  }
);
exports.customers = (0, pg_core_1.pgTable)('customers', {
  id: (0, pg_core_1.uuid)('id')
    .primaryKey()
    .notNull()
    .references(function () {
      return exports.users.id;
    }),
  stripe_customer_id: (0, pg_core_1.text)('stripe_customer_id'),
});
exports.products = (0, pg_core_1.pgTable)('products', {
  id: (0, pg_core_1.text)('id').primaryKey().notNull(),
  active: (0, pg_core_1.boolean)('active'),
  name: (0, pg_core_1.text)('name'),
  description: (0, pg_core_1.text)('description'),
  image: (0, pg_core_1.text)('image'),
  metadata: (0, pg_core_1.jsonb)('metadata'),
});
exports.prices = (0, pg_core_1.pgTable)('prices', {
  id: (0, pg_core_1.text)('id').primaryKey().notNull(),
  product_id: (0, pg_core_1.text)('product_id').references(function () {
    return exports.products.id;
  }),
  active: (0, pg_core_1.boolean)('active'),
  description: (0, pg_core_1.text)('description'),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  unit_amount: (0, pg_core_1.bigint)('unit_amount', { mode: 'number' }),
  currency: (0, pg_core_1.text)('currency'),
  type: (0, exports.pricing_type)('type'),
  interval: (0, exports.pricing_plan_interval)('interval'),
  interval_count: (0, pg_core_1.integer)('interval_count'),
  trial_period_days: (0, pg_core_1.integer)('trial_period_days'),
  metadata: (0, pg_core_1.jsonb)('metadata'),
});
exports.subscriptions = (0, pg_core_1.pgTable)('subscriptions', {
  id: (0, pg_core_1.text)('id').primaryKey().notNull(),
  user_id: (0, pg_core_1.uuid)('user_id')
    .notNull()
    .references(function () {
      return exports.users.id;
    })
    .references(function () {
      return exports.users.id;
    }),
  status: (0, exports.subscription_status)('status'),
  metadata: (0, pg_core_1.jsonb)('metadata'),
  price_id: (0, pg_core_1.text)('price_id')
    .references(function () {
      return exports.prices.id;
    })
    .references(function () {
      return exports.prices.id;
    }),
  quantity: (0, pg_core_1.integer)('quantity'),
  cancel_at_period_end: (0, pg_core_1.boolean)('cancel_at_period_end'),
  created: (0, pg_core_1.timestamp)('created', { withTimezone: true, mode: 'string' })
    .default(
      (0, drizzle_orm_1.sql)(
        templateObject_1 || (templateObject_1 = __makeTemplateObject(['now()'], ['now()']))
      )
    )
    .notNull(),
  current_period_start: (0, pg_core_1.timestamp)('current_period_start', {
    withTimezone: true,
    mode: 'string',
  })
    .default(
      (0, drizzle_orm_1.sql)(
        templateObject_2 || (templateObject_2 = __makeTemplateObject(['now()'], ['now()']))
      )
    )
    .notNull(),
  current_period_end: (0, pg_core_1.timestamp)('current_period_end', {
    withTimezone: true,
    mode: 'string',
  })
    .default(
      (0, drizzle_orm_1.sql)(
        templateObject_3 || (templateObject_3 = __makeTemplateObject(['now()'], ['now()']))
      )
    )
    .notNull(),
  ended_at: (0, pg_core_1.timestamp)('ended_at', { withTimezone: true, mode: 'string' }).default(
    (0, drizzle_orm_1.sql)(
      templateObject_4 || (templateObject_4 = __makeTemplateObject(['now()'], ['now()']))
    )
  ),
  cancel_at: (0, pg_core_1.timestamp)('cancel_at', { withTimezone: true, mode: 'string' }).default(
    (0, drizzle_orm_1.sql)(
      templateObject_5 || (templateObject_5 = __makeTemplateObject(['now()'], ['now()']))
    )
  ),
  canceled_at: (0, pg_core_1.timestamp)('canceled_at', {
    withTimezone: true,
    mode: 'string',
  }).default(
    (0, drizzle_orm_1.sql)(
      templateObject_6 || (templateObject_6 = __makeTemplateObject(['now()'], ['now()']))
    )
  ),
  trial_start: (0, pg_core_1.timestamp)('trial_start', {
    withTimezone: true,
    mode: 'string',
  }).default(
    (0, drizzle_orm_1.sql)(
      templateObject_7 || (templateObject_7 = __makeTemplateObject(['now()'], ['now()']))
    )
  ),
  trial_end: (0, pg_core_1.timestamp)('trial_end', { withTimezone: true, mode: 'string' }).default(
    (0, drizzle_orm_1.sql)(
      templateObject_8 || (templateObject_8 = __makeTemplateObject(['now()'], ['now()']))
    )
  ),
});
exports.__drizzle_migrations = (0, pg_core_1.pgTable)('__drizzle_migrations', {
  id: (0, pg_core_1.serial)('id').primaryKey().notNull(),
  hash: (0, pg_core_1.text)('hash').notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  created_at: (0, pg_core_1.bigint)('created_at', { mode: 'number' }),
});
exports.files = (0, pg_core_1.pgTable)('files', {
  id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey().notNull(),
  created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true, mode: 'string' }),
  title: (0, pg_core_1.text)('title').notNull(),
  icon_id: (0, pg_core_1.text)('icon_id').notNull(),
  data: (0, pg_core_1.text)('data').notNull(),
  in_trash: (0, pg_core_1.text)('in_trash'),
  banner_url: (0, pg_core_1.text)('banner_url'),
  folder_id: (0, pg_core_1.uuid)('folder_id')
    .notNull()
    .references(
      function () {
        return exports.folders.id;
      },
      { onDelete: 'cascade' }
    ),
  workspace_id: (0, pg_core_1.uuid)('workspace_id')
    .notNull()
    .references(
      function () {
        return exports.workspaces.id;
      },
      { onDelete: 'cascade' }
    ),
});
exports.collaborators = (0, pg_core_1.pgTable)(
  'collaborators',
  {
    workspace_id: (0, pg_core_1.uuid)('workspace_id')
      .notNull()
      .references(
        function () {
          return exports.workspaces.id;
        },
        { onDelete: 'cascade' }
      ),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    user_id: (0, pg_core_1.uuid)('user_id')
      .notNull()
      .references(
        function () {
          return exports.users.id;
        },
        { onDelete: 'cascade' }
      ),
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey().notNull(),
  },
  function (table) {
    return {
      collaborators_id_key: (0, pg_core_1.unique)('collaborators_id_key').on(table.id),
    };
  }
);
// set relationship between Price and Product
exports.productRelations = (0, drizzle_orm_1.relations)(exports.products, function (_a) {
  var many = _a.many;
  return {
    prices: many(exports.prices),
  };
});
exports.priceRelations = (0, drizzle_orm_1.relations)(exports.prices, function (_a) {
  var one = _a.one;
  return {
    product: one(exports.products, {
      fields: [exports.prices.product_id],
      references: [exports.products.id],
    }),
  };
});
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6,
  templateObject_7,
  templateObject_8;
