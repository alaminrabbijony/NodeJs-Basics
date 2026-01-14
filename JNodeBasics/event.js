const EventListenr = require("events");
/*

class Sales extends EventListenr {
  constructor() {
    super();
  }
}
const myEmitter = new Sales(); // init instance

myEmitter.on("newSale", () => {
  console.log("1. New sale registered");
});

myEmitter.on("newSale", () => {
  console.log("2. New sale registered");
});

myEmitter.on("newSale", (stock) => {
  console.log(`3. New sale registered remaing stock: ${stock}`);
});

myEmitter.emit("newSale", 9);
 */
const http = require("http")

const server = http.createServer()

server.on("request", (req, res) => {
    console.log("Received req")
    res.end(" Req Received")
})

server.on("close", (req, res) => {
    console.log("server closed")
})

server.listen(8000, () => {
    console.log("waiting for requests.......")
})