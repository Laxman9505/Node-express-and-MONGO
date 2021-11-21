const User = require('../Model/user');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};
const sendTokenInCookie = (token, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV == 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
};

exports.singUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  const payload = {
    user: {
      id: newUser._id,
    },
  };

  const token = signToken(payload);
  sendTokenInCookie(token, res);
  newUser.password = undefined;
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  //check if user enters both email and password
  if (!email || !password) {
    return next(new AppError('please enter both email and password!', 401));
  }

  //check if user exists in our system
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 400));
  }
  const payload = {
    user: {
      id: user.id,
    },
  };
  //return json web token if everything went well
  const token = signToken(payload);
  res.status(200).json({
    status: 'success',
    token,
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  //checking if the user with the given email exists in our system
  if (!user) {
    return next(new AppError('There is no any user with the given email'), 404);
  }
  //generating the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //sending the reset token to the email.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetPassword/${resetToken}`;
  const message = `Forgot your password? send a patch request with your new password and passwordConfirm in : ${resetURL}.\n If you didn't forgot your password. just igonre this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid only for 10mins)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'token sent to the email!',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending an email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or already expired!', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  const payload = {
    user: {
      id: user.id,
    },
  };
  //return json web token if everything went well
  const token = signToken(payload);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)Get user from the collection

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(
      new AppError('Please login first to update your password', 400)
    );
  }
  //2)check if posted password is correct
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('please enter the correct passowrd!', 400));
  }
  //3)if so, update the password
  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();
  //4) login the user in and return json web token
  const payload = {
    user: {
      id: user.id,
    },
  };
  //return json web token if everything went well
  const token = signToken(payload);
  res.status(200).json({
    status: 'success',
    token,
  });
});
