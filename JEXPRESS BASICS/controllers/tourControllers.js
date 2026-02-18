const fs = require('fs');
const Tour = require('../Models/TourModels');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');
const { deleteOne, updateOne, getOne, createOne } = require('./handlerFactory');

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

// const createTour = catchAsync(async (req, res, next) => {
//   // Tour.create(req.body).then() // returns a promise
//   //so we used asyn await to catch the promise result
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// const getAllTours = catchAsync(async (req, res, next) => {
//   const query = req.mongoQuery;

//   const tours = await query;
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// const getTour = catchAsync(async (req, res, next) => {
//   //const tour = await Tour.findOne({ _id: req.params.id }) // alternative way but slower

//   const tour = await Tour.findById(req.params.id).populate({
//     path: "guides",
//     select: "-__v -updatePasswordAt -active"
//   }).populate('reviews');//virtual populate => field name must be same as in the virtula populate

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: { tour },
//   });
// });

// const updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: { tour },
//   });
// });

// const deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

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

/*
{
  startLocation: {
    $geoWithin: {
      $centerSphere: [
        [-118.23074340820314, 33.84418591636914],
        0.0024818791958044965
      ]
    }
  }
}
 => route: tours/tours-within/:distance/center/:lnglat/unit/:unit
 => route: tours/tours-within/400/center/-118.23074340820314,33.84418591636914/unit/mi 

*/

const getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, lnglat, unit } = req.params;

  const [lng, lat] = lnglat.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lng || !lat)
    return next(new AppError('Plz provide valid latitude and longitude', 400));

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat], // [-118.23074340820314, 33.84418591636914]
          radius, //0.0024818791958044965
        ],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const distances = catchAsync(async (req, res, next) => {
  const { lnglat, unit } = req.params;

  const [lng, lat] = lnglat.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.0001;
  if (!lng || !lat)
    return next(new AppError('Plz provide valid latitude and longitude', 400));

  const tours = await Tour.aggregate([
    //geo near need a indexed key otherwise we need to put a key obj
    // we already have startLocation as a index
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });
});

/**
 *** Factory Functions ***
 */

const createTour = createOne(Tour, (req) => ({
  name: req.body.name,
  duration: req.body.duration,
  maxGroupSize: req.body.maxGroupSize,
  difficulty: req.body.difficulty,
  price: req.body.price,
  summary: req.body.summary,
  description: req.body.description,
  imageCover: req.body.imageCover,

  // optional fields
  images: req.body.images,
  startDates: req.body.startDates,
  startLocation: req.body.startLocation,
  locations: req.body.locations,
  guides: req.body.guides,
}));

const popOpts = [
  {
    path: 'guides',
    select: '-__v -updatePasswordAt -active',
  },
  { path: 'reviews' },
];
const getTour = getOne(Tour, { popOpts: popOpts });

const deleteTour = deleteOne(Tour);
const updateTour = updateOne(Tour, (req) => ({
  name: req.body.name,
  duration: req.body.duration,
  maxGroupSize: req.body.maxGroupSize,
  difficulty: req.body.difficulty,
  price: req.body.price,
  summary: req.body.summary,
  description: req.body.description,
  imageCover: req.body.imageCover,

  // optional fields
  images: req.body.images,
  startDates: req.body.startDates,
  startLocation: req.body.startLocation,
  locations: req.body.locations,
  guides: req.body.guides,
}));

module.exports = {
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getBestTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  distances,
};
