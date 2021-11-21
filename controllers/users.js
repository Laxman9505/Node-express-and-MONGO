const catchAsync = require('../utils/catchAsync');
const User = require('../Model/user');
const AppError = require('../utils/appError');
const factoryHandler = require('../controllers/factoryHandler');
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getOne = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password updates. please go to /updatePassword for updating your password',
        400
      )
    );
  }
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  return res.status(204).json({
    status: 'success',
    datat: null,
  });
  //filtered out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  //update user document
  const updatedUser = await User.findById(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'The route is under construction',
  });
};
exports.getAllUsers = factoryHandler.getAll(User);
exports.getUser = factoryHandler.getOne(User);
exports.updateUser = factoryHandler.deleteOne(User);
exports.deleteUser = factoryHandler.deleteOne(User);
