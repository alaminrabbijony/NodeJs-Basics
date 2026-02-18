const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');
const { promisify } = require('util');
const sendMail = require('../util/emai');
const crypto = require('crypto');
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendTokenAndLogin = (user, code, res) => {
  const token = signToken(user._id); // _id is created by mongoDB automatically

  const cookieOpts = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), //90d
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;
  res.cookie('jwt', token, cookieOpts);
  user.password = undefined;

  res.status(code).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        updatePasswordAt: user.updatePasswordAt,
      },
    },
  });
};

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, updatePasswordAt, role } =
    req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    confirmPassword,
    updatePasswordAt,
    role,
  });

  //const token = jwt.sign({"PAYLOAD"}, "SECRET", {"HEADER_OPTION"});
  //const token = signToken(newUser._id); // _id is created by mongoDB automatically
  sendTokenAndLogin(newUser, 201, res);

  /**
 res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
 */
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) Check if email and password exist
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));
  //2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password'); // as password is set to select false in model
  if (!user || !(await user.matchPassword(password, user.password))) {
    //awaut will be in the if condition as matchPassword is an async function
    // and we must wait for its result
    // weneed to check the password with instance that we created in user model
    return next(new AppError('Incorrect email or password', 401)); //401
  }
  //3) If everything ok, send token to client
  sendTokenAndLogin(user, 200, res);
  /**
     const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
   */
});

const protect = catchAsync(async (req, res, next) => {
  //1) get the token from header🚷
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(new AppError('🚷 U are not logged in. Plz login!🚷', 401)); //401=> unauthorized
  //console.log(token)
  //2) verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);
  //3) check user sill exists
  const currUser = await User.findById(decoded.id);
  if (!currUser) return next(new AppError('🚫🚫 No user found 🚫🚫', 401));

  //4) check user changed password

  if (currUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('🚫🚫 Token Expired. plz login again 🚫🚫', 401));
  }
  req.user = currUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('U dont have authorization to this content 😥😥😥', 403)
      ); //403 => forbidden
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  //1) get the user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No user found 😥😥😥', 404));
  //console.log(user);
  //2) Generate the reset token
  const token = user.generateResetToken();
  //console.log(token);
  await user.save({ validateBeforeSave: false });
  //3) Send the token to the mail
  try {
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset/${token}`;

    const message = `Forgot ur password?\n Submit a PATCH req with ur new password and confirm password in this URL\n ${resetUrl}\n If u didnt then ignore this email`;
    await sendMail({
      email: req.body.email,
      subject: 'Reset password',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token send to email',
      resetUrl,
    });
  } catch (error) {
    user.resetToken = undefined;
    user.resetTokenExpiryDate = undefined;
    await user.save();

    return next(
      new AppError(
        'There was an error sending the email😢😢😢 \n Try again',
        500
      )
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  //1. Get the user with the token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //2. If token has not expired , there is a user so set the password
  const user = await User.findOne({
    resetToken: hashToken,
    resetTokenExpiryDate: { $gt: Date.now() },
  });

  if (!user) return new AppError('Token is invalid or has expired', 400);

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetToken = undefined;
  user.resetTokenExpiryDate = undefined;
  await user.save();

  //3. Change the updatPasswordAt
  //4. Log user and send jwt
  sendTokenAndLogin(user, 200, res);
  /**
 
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });

 */
});

const updatePassword = catchAsync(async (req, res, next) => {
  //1) get the user from the collections
  const { password, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  //2) check if posted current password is correct
  if (!user || !(await user.matchPassword(password, user.password)))
    return next(new AppError('Incorrect email or password😢😢😢', 404));
  //3) if so, update password
  user.password = newPassword;
  user.confirmPassword = confirmPassword;

  await user.save();
  //4) log user in with jwt
  sendTokenAndLogin(user, 200, res);
  /**
    const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
    token,
  });
  */
});

// const updateEmail = catchAsync(async (req, res, next) => {
//   const {email, password ,confirmPassword} = req.body
// })

module.exports = {
  register,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
