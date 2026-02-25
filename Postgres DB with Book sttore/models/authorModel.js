const { sql } = require("drizzle-orm");
const { pgTable, uuid, varchar } = require("drizzle-orm/pg-core");

const authorTable = pgTable('authors', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 55 }).notNull(),
    email: varchar('email', { length: 100 }).notNull(),
});

module.exports = { authorTable };