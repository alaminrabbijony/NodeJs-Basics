const { text } = require("drizzle-orm/gel-core");
const { uuid } = require("drizzle-orm/gel-core");
const { varchar } = require("drizzle-orm/pg-core");
const { pgTable } = require("drizzle-orm/pg-core");
const { authorTable } = require("./authorModel");
const { sql } = require("drizzle-orm");
const { index } = require("drizzle-orm/gel-core");

const bookTable = pgTable('books', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    title: varchar('title', {length: 100}).notNull(),
    description: text(),
    authorId: uuid().references(() => authorTable.id).notNull(),
    
}, (table) => ({
    titleSearchIndex: index('title_search_index').using('gin', sql`to_tsvector('english', ${table.title})`),
}))



module.exports = {bookTable}