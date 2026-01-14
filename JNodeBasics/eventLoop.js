const fs = require("fs");
const crypto = require("crypto");

process.env.UV_THREADPOOL_SIZE = 4;

const start = Date.now();

setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 fin"));

fs.readFile("./test-file.txt", (err, data) => {
  console.log("I/O 1 fin");
  console.log("---------------------------------");

  setTimeout(() => console.log("Timer 2 finished"), 0);
  setImmediate(() => console.log("Immediate 2 fin"));

  setTimeout(() => console.log("Timer 3 finished"), 3000);

  process.nextTick(() => console.log("log from next tick "));
  /*

  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", ()=> {
    console.log(Date.now() - start, "times took to completed in threadpool")
    
  })
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", ()=> {
    console.log(Date.now() - start, "times took to completed in threadpool")
    
  })
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", ()=> {
    console.log(Date.now() - start, "times took to completed in threadpool")
    
  })
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", ()=> {
    console.log(Date.now() - start, "times took to completed in threadpool")
    
  })

 */
  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "times took to completed in threadpool");

  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "times took to completed in threadpool");

  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "times took to completed in threadpool");

  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "times took to completed in threadpool");
});

console.log("hello from the top lvl code");
