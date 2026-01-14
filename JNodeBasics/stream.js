const fs = require("fs");

const server = require("http").createServer();

server.on("request", (req, res) => {
  /*
 * // Sol-1: Reading whole file and outputing in the page
    fs.readFile("test-file.txt", (err, data) => {
        console.log("file read")
        res.end(data)
    })
 */

    /* 
  // Sol-2: Here we use stream to stream the data in the file
  const readable = fs.createReadStream("test-file.txt");

  readable.on("data", (chunk) => {
    // data are chunked and written to the response
    res.write(chunk);
  });

  readable.on("end", () => {
    // we need to use end here
    // as readable string finish reading 
    // then we have to singnal that we are ready to end 
    res.end();
  });

  readable.on("error", (err) => {
    res.statusCode = 500;
    console.log(err);
    res.end("file not found");
  });
*/  
//sol-3:

const readable = fs.createReadStream("test-file.txt")
readable.pipe(res)

});

server.listen(3000, (err) => {
  console.log("listening from server.....");
});
