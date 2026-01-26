const fs = require('fs');

const express = require('express');

const Tour = require('../../Models/TourModels');

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

const createTour = async (req, res, next) => {
  try {
    // Tour.create(req.body).then() // returns a promise
    //so we used asyn await to catch the promise result
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    //catching error and send error response
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getAllTours = async (req, res) => {
  try {

    /** 
    console.log(req.query);
    //1. filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'limit', 'fields', "sort"];
    excludedFields.forEach((el) => delete queryObj[el]);
    //2. Advanced filtering

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    //const query = Tour.find(queryObj); // returns a query

    //3. Sorting
    console.log(req.query.sort);
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    }else{
      query = query.sort('-createdAt')
    }

    //4. Field limiting
    if(req.query.fields){
      const fields = req.query.fields.split(",").join(" ") // {"name duration"}
      query = query.select(fields)
    }else{
      query = query.select("-__v") // exclude __v field always
    }

    //5. Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    console.log(`🙌🙌 \n page: ${page}, limit: ${limit} \n 🙌🙌`);
    const skip = (page -1 )*limit
    query = query.skip(skip).limit(limit)
    console.log(`🙌🙌 \n skip: ${skip}, \n query: ${limit} \n 🙌🙌`);

    // if the page number is too high
    if(req.query.page) {
      const numTours = await Tour.countDocuments()
      if(skip >= numTours) throw new Error("This page does not exist ")
    }
*/

    // executing the query

    const query = req.mongoQuery;

    const tours = await query;

    /**
     * Hard coded query example
   
    
        const tours = await Tour.find(req.query)
      .where('difficulty')
      .equals('easy')
      .where('duration')
      .equals(5);

    const tours = await Tour.find({
      duration: 5,
      difficulty: 'easy',
    })
*/
    // console.log(queryObj);
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getTour = async (req, res) => {
  try {
    //const tour = await Tour.findOne({ _id: req.params.id }) // alternative way but slower
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};
const deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// special controller for monthy plan

const getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

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
