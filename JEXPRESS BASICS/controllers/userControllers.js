const catchAsync = require('../util/catchAsync');
const User = require('../Models/UserModel');
const AppError = require('../util/AppError');
const { deleteOne, getOne, updateOne } = require('./handlerFactory');

/**
 * HELPERS
 */
const filteredObj = (obj, ...allowedFields) => {
  if (!obj || typeof obj !== 'object') return {};

  const allowed = new Set(allowedFields);
  const filtered = {};
  for (const key of Object.keys(obj)) {
    if (allowed.has(key)) {
      filtered[key] = obj[key];
    }
  }
  return filtered;
};

/**
 * CONTROLLERS
 */
// const getAllUsers = catchAsync(async (req, res) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//     //message: 'routes are not handled yet',
//   });
// });

// const getUser = catchAsync(async (req, res) => {
//   const filteredInput = filteredObj(req.body, 'email', 'name', 'role');
//   const user = await User.findById(req.params.id, filteredInput);
//   res.status(200).json({
//     status: 'success',
//     message: 'success',
//     data: {
//       user,
//     },
//   });
// });

const updateMe = catchAsync(async (req, res, next) => {
  const { password, confirmPassword, name, email, role } = req.body;
  //1) 1st check its not the password change
  if (password || confirmPassword) {
    return next(
      new AppError(
        'This route is not for password change. plz go to route -> /update-password',
        400
      )
    );
  }
  //2) filter user input
  const filteredInput = filteredObj(req.body, 'email', 'name');

  //3) find the user doc
  /*
     const user = await User.findById(req.user._id) //req.user coming from the protect middleware

  // This method doesnt work as it needs all the required field to be fields
    user.name = name
    user.role = role
  //  user.email = email
  await user.save()
*/
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    filteredInput,
    {
      new: true, //returns the updated document
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    //204 -> deleted
    status: 'success',
    data: null,
  });
});

/**
 *** Factory Functions ***
 */


const getUser = (req, res, next) => {
  const opts = {};
  if (req.user.role === 'user') opts.select = 'name email role';

  return getOne(User, opts)(req, res, next);
};

const updateUser = updateOne(User, (req) => ({
  role: req.body.role
}))
const deleteUser = deleteOne(User);


const getMe = (req, res, next) => {
  req.params.id  = req.user.id
  next()
}

module.exports = {
  // getAllUsers,
  getUser,
  updateMe,
  deleteMe,
  deleteUser,
  updateUser,
  getMe
};
