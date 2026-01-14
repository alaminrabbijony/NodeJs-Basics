const fs = require("fs");
const superAgent = require("superagent");

fs.readFile("breed.txt", "utf-8", (err, data) => {
  console.log(data);
  superAgent.get(`https://dog.ceo/api/breed/${data}/images/random`).end((err, res) => {
    if (err) return console.log(err.message);
    console.log(res.body.message);
    fs.writeFile("dogs.txt", res.body.message, (err) => {
      if (err) return console.log(err.message);
      console.log("Random dog is saved to file");
    });
  });
});
