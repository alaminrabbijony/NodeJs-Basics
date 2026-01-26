const fs = require('fs');

const express = require('express');
const morgan = require('morgan');

const app = express();
const port = 3000;

//1) MIDDLWARES

// 1.1) middlewares from packages
app.use(morgan('dev'));
app.use(express.json()); // middleware for parsing req body

// 1.2) Custome middlewares
app.use((req, res, next) => {
  console.log('THIS IS A MIDDLEWARE. REQ MUST GO THROUGH ME');
  next();
});

app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  next();
});

/*
app.get("/", (req, res) => {
  res.status(200)
  .json({ msg: "Hello from the first api", app: "arj" });
});
app.post("/", (req, res) => {
  res.status(200)
  .json({ msg: "the first post req", app: "arj" });
});
*/

// 2) TOP LVL CODE
const tours = JSON.parse(
  fs.readFileSync('./starter/dev-data/data/tours-simple.json')
);

//3) ROUTES HANDLERS

// 3.1) Tour route handlers

const getAllTours = (req, res) => {
  console.log(`The req time from middleware is ${req.reqTime}`);
  res.status(200).json({
    status: 'success',
    requestedAt: req.reqTime,
    result: tours.length,

    data: {
      tours,
    },
  });
};
const getTour = (req, res) => {
  console.log(req.params);
  const id = Number(req.params.id);
  /**
   * find the tour with id of req.params.id
   */
  const tour = tours.find((i) => i.id === id);

  if (!tour)
    {return res.status(404).json({ status: 'fail', message: 'invalid id!!' });}
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};
const addTour = (req, res) => {
  //console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  // create a new js obj and assing new tour with the id
  const newTour = Object.assign({ id: newId }, req.body);
  // now push to the tours
  tours.push(newTour);
  fs.writeFile(
    './starter/dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'created',
        data: {
          tours: newTour,
        },
      });
    }
  );

  //res.send('Done'); // we cant `send` twice
};

const updateTour = (req, res) => {
  const id = Number(req.params.id);
  if (id > tours.length)
    {res.status(404).json({ status: 'fail', message: 'invalid id!!' });}
  res.status(200).json({
    status: 'Success',
    message: 'data updated',
  });
};

const deleteTour = (req, res) => {
  const id = Number(req.params.id);
  if (id > tours.length)
    {res.status(404).json({ status: 'fail', message: 'invalid id!!' });}
  res.status(200).json({
    status: 'Success',
    message: 'data updated',
    data: {
      tour: '<Update here...>',
    },
  });
};

// 3.2) User route handler

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'routes are not handled yet',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'routes are not handled yet',
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'routes are not handled yet',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'routes are not handled yet',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'routes are not handled yet',
  });
};

/* 

// GET ALL TOURS
app.get('/api/v1/tours', getAllTours);

// GET A TOUR WITH AN ID
app.get('/api/v1/tours/:id', getTour);

// POST NEW TOUR
app.post('/api/v1/tours', addTour);

//UPDATE A TOUR
app.patch('/api/v1/tours/:id', updateTour);

// DELETE A TOUR
app.delete('/api/v1/tours/:id',deleteTour );
 */

// 4) ROUTER

const tourRouter = express.Router();
const userRouter = express.Router();

// 4.1) Tour router
tourRouter.route('/').get(getAllTours).post(addTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// 4.2) User router
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// 4.3) Mount routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 5) SERVER
app.listen(port, () => {
  console.log(`Listening from ${port}...`);
});
