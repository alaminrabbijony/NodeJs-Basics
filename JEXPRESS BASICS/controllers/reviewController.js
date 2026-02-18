const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

const Review = require('../Models/ReviewModel');
const {
  deleteOne,
  updateOne,
  getOne,
  getAll,
  createOne,
} = require('./handlerFactory');

/**
 * 401->UnAuthorized
 */

// const createReview = catchAsync(async (req, res, next) => {
//   const reviewData = {
//     review: req.body.review,
//     rating: req.body.rating,
//     tour: req.body.tour || req.params.tourId,
//     user: req.user._id, // IMPORTANT: store the id, not the whole user object
//   };

//   // if (!req.body.tour) req.body.tour = req.params.tourId;
//   // if (!req.body.user) req.body.user = req.user;
//   const newReview = await Review.create(reviewData);

//   res.status(200).json({
//     status: 'success',
//     data: { review: newReview },
//   });
// });

// const getAllReviews = catchAsync(async (req, res, next) => {

//   let filter = {}
//   if (req.params.tourId) filter = {tour: req.params.tourId};

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     data: { reviews },
//   });
// });

// const getReview = catchAsync(async (req, res, next) => {

//   const review = await Review.findById(req.params.id);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });

/**
 * Factory Functions
 */
const createReview = createOne(Review, (req) => ({
  review: req.body.review,
  rating: req.body.rating,
  tour: req.body.tour || req.params.tourId,
  user: req.user._id, // IMPORTANT: store the id, not the whole user object
}));

const getReview = getOne(Review);
const deleteReview = deleteOne(Review);

const updateReview = updateOne(Review, (req) => ({
  review: req.body.review,
  rating: req.body.rating,
}));

module.exports = {
  createReview,
  getReview,
  deleteReview,
  updateReview,
};
