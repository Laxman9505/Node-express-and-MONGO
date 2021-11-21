const Tour = require('../Model/tour');
const catchAsync = require('../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  console.log(tour);
  res.status(200).render('tour', {
    title: 'The forest Hiker',
    tour,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login');
});
