const express = require('express');

const {
  deleteTour,
  updateTour,
  getTour,
  createTour,
  getBestTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  distances,
} = require('../controllers/tourControllers');

const Tour = require('../Models/TourModels');
const queryReq = require('../Middleware/QueryMiddleware');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');
const { getAll } = require('../controllers/handlerFactory');

// 4) ROUTER
// 4.1) Tour router
const router = express.Router({ mergeParams: true });

/**
 * param middleware
 * 
 router.param("id", (req, res, nxt, val) => {
    console.log(`This route id is ${val}`)
    nxt()
 })

 router.param("id", checkId)
*/
//CUSTOME ROUTES WITH SORTING FILTERING PAGINATION: BEST MATCH

/*--------------------------------------- ALL -----------------------------------*/
router.use('/:tourId/Reviews', reviewRouter);

router.route('/').get(queryReq(Tour), getAll);
router.route('/tour-stats').get(getTourStats);

//GeoSpatial Queries
router.route('/tours-within/:distance/center/:lnglat/unit/:unit').get(getTourWithin)
router.route('/distances/:lnglat/unit/:unit').get(distances)

/*--------------------------------------- AUTHORIZED-----------------------------------*/
router.use(protect); // ONLY FOR AUTH USERS NOW



router.route('/best-tours').get(getBestTours, queryReq(Tour), getAll);
router.route('/monthly/:year').get(getMonthlyPlan);

router.route('/:id').get(getTour);

/*--------------------------------------- ADMIN -----------------------------------*/

router.use(restrictTo('admin', 'lead-guide')); //ONLY FOR ADMINS

router.route('/').post(createTour);
router.route('/:id').delete(deleteTour).patch(updateTour);


/*--------------------------------------- NESTED ROUTES -----------------------------------*/

/*
 *  POST-> /api/v1/tours/69887ca160e/reviews/create-review
 *  GET-> /api/v1/tours/6988ca160e/reviews
 *  GET-> /api/v1/tours/69887160e/reviews/32456fdfrrtt4
 */

// router.route("/:tourId/reviews").get(protect,getAllReviews)
// router.route("/:tourId/reviews/:id").get(protect, getReview)

module.exports = router;
