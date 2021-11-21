const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndRemove(req.params.id);
    if (!doc) {
      return next(new AppError("Couldn't find the doc with the given ID", 404));
    }
    res.status(204).json({});
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(
        new AppError("Couldn't find the document with the given ID", 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    let doc = await query;
    if (!doc) {
      return next(
        new AppError("Couldn't find the document with the given ID", 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter;
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    const queryObj = { ...req.query };
    //filtering
    const excludedQuery = ['page', 'sort', 'filter', 'fields', 'limit'];
    excludedQuery.forEach((el) => delete queryObj[el]);

    //advanced filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    queryString = JSON.parse(queryString);

    let query = Model.find(queryString, filter);
    //sorting
    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort('-createdAt');
    }
    //field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    //pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    //throwing the error if user request page that doesnot exists in our database
    if (req.query.page) {
      const numberOfTours = await tourModel.countDocuments();
      if (skip >= numberOfTours) {
        throw new Error("This page doesn't exists");
      }
    }

    /*  let doc = await query.explain(); */
    let doc = await query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
