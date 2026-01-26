const fs = require('fs');

const express = require('express');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../starter/dev-data/data/tours-simple.json`)
);

/*
 * 3) ROUTES HANDLERS
 * 3.1) Tour route handlers
 */

const checkId = (req, res, next, val) => {
  const id = Number(req.params.id);
  if (id > tours.length)
    {return res.status(404).json({ status: 'fail', message: 'invalid id!!' });}
  next();
};

const checkBody = (req, res, next) => {
  
  if(!req.body.name || !req.body.price) {return res.status(400).json({
    status: "fail",
    message: "Missing name and price"
  })}
  next()
}

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
  const id = Number(req.params.id);
  /* console.log(req.params);
  //
  const id = req.params.id * 1;
 
   * find the tour with id of req.params.id
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'invalid id!!' });
   */
  const tour = tours.find((i) => i.id === id);

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
  res.status(200).json({
    status: 'Success',
    message: 'data updated',
  });
};

const deleteTour = (req, res) => {
  res.status(200).json({
    status: 'Success',
    message: 'data updated',
    data: {
      tour: '<Update here...>',
    },
  });
};

module.exports = {
  getAllTours,
  getTour,
  addTour,
  updateTour,
  deleteTour,
  checkId,
  checkBody
};
