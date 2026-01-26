const express = require('express');

const {
  getAllTours,
  deleteTour,
  updateTour,
  getTour,
  createTour,
  getBestTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourControllers');

const Tour = require('../Models/TourModels');
const queryReq = require('../Middleware/QueryMiddleware');

// 4) ROUTER
// 4.1) Tour router
const router = express.Router();

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

router.route('/best-tours').get(getBestTours,queryReq(Tour),getAllTours)
router.route('/tour-stats').get(getTourStats)
router.route('/monthly/:year').get(getMonthlyPlan)


router.route('/').get( queryReq(Tour),getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
