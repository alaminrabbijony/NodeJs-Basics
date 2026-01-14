const fs = require("fs");
const superAgent = require("superagent");

const readFilePromise = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) return reject("Couldn't find the file!!");
      resolve(data);
    });
  });
};

const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      // resolved promise
      if (err) return reject("Couldn't find the file!!");
      resolve("success");
    });
  });
};
/**
 * 
 * generic way of defining promises
 * 
 
readFilePromise("breed.txt")
  .then((data) => {
  return  superAgent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then((res) => {
    // pending promise
    console.log(res.body.message);
    return writeFilePromise("dog.txt", res.body.message);
  })
  .then(()=> {
    // resolving promise
   console.log("Random dog image link gathered")
  })
  .catch((err) => {
    // catch err
    return console.log(err.message);
  });
  */
/**
 * Single Promise
 
const getDogPic = async () => {
  try {
    const read = await readFilePromise("breed.txt");
    const res = await superAgent.get(
      `https://dog.ceo/api/breed/${read}/images/random`
    );
    console.log(res.body.message)
     await writeFilePromise("dog.txt", res.body.message);
    console.log("random dog pic ");
  } catch (error) {
    console.log(error)

    throw error
  }
};
*/

// multiple promises
const getDogPic = async () => {
  try {
    const read = await readFilePromise("breed.txt");

    const res1 = superAgent.get(
      `https://dog.ceo/api/breed/${read}/images/random`
    );
    const res2 = superAgent.get(
      `https://dog.ceo/api/breed/${read}/images/random`
    );
    const res3 = superAgent.get(
      `https://dog.ceo/api/breed/${read}/images/random`
    );
    const all = await Promise.all([res1, res2, res3]);
    const imgs = all.map((e) => e.body.message).join("\n");
    console.log(imgs);

    await writeFilePromise("dog.txt", imgs);
    console.log("random dog pic ");
  } catch (error) {
    console.log(error);

    throw error;
  }
};

(async () => {
  try {
    console.log("1. getting images");
    const x = await getDogPic();
    console.log(x);
    console.log("got images");
  } catch (error) {
    console.log("ERROR");
  }
})();
