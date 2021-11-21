const Review = require('../Model/reviewModel');
/* const catchAsync = require('../utils/catchAsync'); */
const factoryHandler = require('../controllers/factoryHandler');
exports.getAllReviews = factoryHandler.getAll(Review);
/*  catchAsync(async (req, res, next) => {
  const reviews = await Review.find(filter);
  if (!reviews) {
    return res.status(204).json({
      status: 'fail',
      message: 'There is not any reviews in the database',
    });
  }
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: reviews,
  });
}); */
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getReview = factoryHandler.getOne(Review);
exports.createReview = factoryHandler.createOne(Review);
exports.deleteReview = factoryHandler.deleteOne(Review);
exports.updateReview = factoryHandler.updateOne(Review);
