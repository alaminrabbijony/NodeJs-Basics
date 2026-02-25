
const {Pool} = require('pg')
const { drizzle } = require('drizzle-orm/node-postgres');

// postgres://<username>:<pass>@<host>:<port>/<db_name>
const pool = new Pool({  
    connectionString: process.env.DATABASE_URL,
  
})

const db = drizzle(pool)

module.exports = db