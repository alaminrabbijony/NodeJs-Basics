const express = require('express');

const {
  getUser,
  updateMe,
  deleteMe,
  deleteUser,
  getMe,
} = require('../controllers/userControllers');
const {
  register,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');
// 4) ROUTER

// 4.2) User router
const router = express.Router();

// MIDDLEWARES
const rateLimit = require('express-rate-limit');
const queryReq = require('../Middleware/QueryMiddleware');
const User = require('../Models/UserModel');
const { getAll } = require('../controllers/handlerFactory');

const limiter = rateLimit({
  max: 5,
  windowMs: 5 * 60 * 1000, //5min
  message: 'Too may attempts.🛑🛑 plz try again after 5 min',
});

//AUTHENTICATION AND AUTHORIZATION ROUTES
router.post('/register', limiter, register);
router.post('/login', limiter, login);

router.post('/forgot', forgotPassword);
router.patch('/reset/:token', resetPassword);

//All of the below routes are protected
router.use(protect)

//USER

router.delete('/deleteMe',  deleteMe);
router.patch('/update-password',  updatePassword);
router.patch('/updateMe',  updateMe);
router.route('/me').get( getMe, getUser)
router.route('/:id').get(getUser);


//ADMIN
router.use(restrictTo('admin'))
router.route('/').get(queryReq(User), getAll);
router.delete('/:id', deleteUser);

module.exports = router;
