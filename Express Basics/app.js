const express = require("express")
const app = express()

/*
 * Req gets executed from top to bottom
 */

/* 
app.use((req, res, next) => {
    console.log("In the middleware")
    next() // Allow the req to continue to next middleware
})

// app.use((req, res, next) => {
//     console.log("2nd: middleware")
//    // res.send("<h1> The Add Product Page</h1>")
// })

app.use((req, res, next) => {
    console.log("another middleware")
    res.send("<h1> Hlw from the next middleware</h1>")
})
*/

/*
app.use('/',(req, res, next) => {
    console.log("1st Middleware: This will always run")
    next() // Allow the req to continue to next middleware
})


app.use("/add-product",(req, res, next) => {
    console.log("2nd: middleware")
    res.send("<h1> The Add Product Page</h1>")
})

app.use("/",(req, res, next) => {
    console.log("3rd: middleware")
    res.send("<h1> Hlw from the next middleware</h1>")
})
*/

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: false}))

app.use('/',(req, res, next) => {
    console.log("1st Middleware: This will always run")
    next() // Allow the req to continue to next middleware
})


app.use("/add-product",(req, res, next) => {
    res.send("<form action='/product' method='POST'> <input type='text' name='message' /><button type='submit'>Add</button></form>")
})

app.post('/product', (req, res, next) => {
    console.log(req.body)
    res.redirect('/')
})

app.use("/",(req, res, next) => {
    res.send("<h1> Hlw from the next middleware</h1>")
})


app.listen(3000)