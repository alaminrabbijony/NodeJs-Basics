const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  createReview,
  getReview,
  deleteReview,
  updateReview,
} = require('../controllers/reviewController');
const queryReq = require('../Middleware/QueryMiddleware');
const Review = require('../Models/ReviewModel');
const { getAll, setBaseFilter } = require('../controllers/handlerFactory');

const router = express.Router({ mergeParams: true });

/*
 *  NESTED ROUTES
 
 *  POST-> /api/v1/tours/69887ca160e/reviews/create-review
 *  GET-> /api/v1/tours/6988ca160e/reviews
 *  GET-> /api/v1/tours/69887160e/reviews/32456fdfrrtt4
 */
// const getAllByTour =  (req, res, next) => {
//     if(req.params.tourId){
//      req.baseFilter = {tour: req.params.tourId}
//     }else{
//       req.baseFilter ={}
//     }

//     next()
// };


/***ALL***/
router
  .route('/')
  .get(setBaseFilter('tourId', 'tour'), queryReq(Review), getAll);

router.route('/:id').get(setBaseFilter('tourId', 'tour'), getReview);

/***ALL AUTHORIZED***/

router.use(protect)

/**
 *** NORMAL ROUTES ***
 */
// router.route('/').get(protect, queryReq(Review), getAll);
//router.route('/:id').get(protect, getReview);

/***AUTHORIZED USERS ONLY***/
router.use(restrictTo('user'))
router.route('/post-review').post(createReview);
router.route('/:id').patch(updateReview).delete(deleteReview);

/***ADMIN***/
//router.use(restrictTo('admin', 'lead-guide'))


module.exports = router;
