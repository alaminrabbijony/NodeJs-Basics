const fs = require('fs');

const express = require('express');

const Tour = require('../Models/TourModels');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');

/*
 * 3) ROUTES HANDLERS
 * 3.1) Tour route handlers
 */

// BEST TOURS
const getBestTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price'; //careful with the spaces as no space here
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const createTour = catchAsync(async (req, res, next) => {
  // Tour.create(req.body).then() // returns a promise
  //so we used asyn await to catch the promise result
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
const getAllTours = catchAsync(async (req, res, next) => {
  const query = req.mongoQuery;

  const tours = await query;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const getTour = catchAsync(async (req, res, next) => {
  //const tour = await Tour.findOne({ _id: req.params.id }) // alternative way but slower
  
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } }, // ascending order
    // { $match: { _id: { $ne: 'EASY' } } }, // exclude easy tours
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

// special controller for monthy plan

const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = Number(req.params.year); // 2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
      // deconstructs an array field from the input documents to output a document for each element of the array
    },
    {
      $match: {
        //match is used for selecting documents that satisfy the condition
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        //
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }, // push all the tour names in an array
      },
    },
    {
      $addFields: { month: '$_id' }, // add a field month with value of _id
    },
    {
      $project: { _id: 0 }, // remove the _id field
    },
    {
      $sort: { numTours: -1 }, // sort by numTours in descending order
    },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

module.exports = {
  createTour,
  getAllTours,
  getTour,
  updateTour,
  deleteTour,
  getBestTours,
  getTourStats,
  getMonthlyPlan,
};
