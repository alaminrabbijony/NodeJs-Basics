const {defineConfig} = require( 'drizzle-kit')

const config = defineConfig ({
    out: '/drizzle',
    schema: './drizzle/schema.js',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },

})

module.exports = config