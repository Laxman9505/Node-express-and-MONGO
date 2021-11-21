const mongoose = require('mongoose');
const Tour = require('../Model/tour');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must have text'],
      minLength: [10, 'A review must contain characters more than 10'],
      maxLength: [50, 'A review must contain characters less than 50'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating should be either greater than or equal to 1'],
      max: [5, 'Rating should be either  less than or equal to 5'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must have user field.'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must have tour field.'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  /*   this.populate([
    {
      path: 'user',
      select: 'name photo',
    },
    {
      path: 'tour',
      select: 'name',
    },
  ]); */
  this.populate([
    {
      path: 'user',
      select: 'name photo',
    },
  ]);

  next();
});

reviewSchema.statics.calAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //this points to current review
  this.constructor.calAverageRatings(this.tour);
});
//for deleting and updating review.
//findByIdAndDelete
//findByIdAndUpdate

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  /* this.r = await this.findOne(); */ //this doesnt works because query has already executed.
  await this.r.constructor.calAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
