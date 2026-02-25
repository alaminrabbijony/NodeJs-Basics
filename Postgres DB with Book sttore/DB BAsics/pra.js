
const db = require("./dbPra")
const { userTable } = require("./drizzlePra/schema")


const getAllUsers= async () => {
    const users =await db.select().from(userTable)
    console.log(`DB USERS:\n ${users}`)
    return users
}

const createUser = async ({id, name, email}) => {
    await db.insert(userTable).values({id, name, email})

}
// createUser({id: 1, name: 'arj', email: "arj@arg.io"})
// createUser({id: 2, name: 'arj2', email: "arj2@arg.io"})
 getAllUsers()

module.exports = {getAllUsers}