const catchAsync = require('../utils/catchAsync');
const Journal = require('../model/Journal');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getJournals = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Journal.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const journals = await features.query;
  res
    .status(200)
    .json({ success: true, count: journals.length, data: journals });
});

exports.createJournal = catchAsync(async (req, res, next) => {
  const journal = await Journal.create(req.body);
  res.status(200).json({ success: true, data: journal });
});

exports.getJournal = catchAsync(async (req, res, next) => {
  const journal = await Journal.findById(req.params.id);
  if (!journal) {
    return next(
      new AppError(`Journal Not found with the id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: journal });
});

exports.updateJournal = catchAsync(async (req, res, next) => {
  const journal = await Journal.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!journal) {
    return next(
      new AppError(`Journal not found with the id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: journal });
});

exports.deleteJournal = catchAsync(async (req, res, next) => {
  const journal = await Journal.findByIdAndDelete(req.params.id);
  if (!journal) {
    return next(
      new AppError(`Journal not found with the id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: {} });
});
