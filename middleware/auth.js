const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const util = require('util');
const userModel = require('../Model/user');
const jwt = require('jsonwebtoken');
module.exports = catchAsync(async (req, res, next) => {
  //check if the token is in the header or not
  const token = req.header('x-auth-token');
  if (!token) {
    return next(new AppError('No token found.Authorization denied'));
  }
  //check if the token given by the user is valid  (token verification)
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  //see if user still exist
  const currentUser = await userModel.findById(decoded.user.id);
  if (!currentUser) {
    next(
      new AppError(
        "User belonging to the token doestn't exists! please login again!",
        401
      )
    );
  }

  //check if the user changed the password after token was issued
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    next(
      new AppError(
        'User has changed his password recently. Please login again!'
      ),
      401
    );
  }
  req.user = currentUser;
  next();
});
