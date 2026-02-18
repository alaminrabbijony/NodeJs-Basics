const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

const createOne = (Model, buildData) => {
  if (typeof buildData !== 'function') {
    throw new Error('CreateOne requires a data builder fn 🚸🚸🚸');
  }

  return catchAsync(async (req, res, next) => {
    const data = buildData(req);

    if (!data || typeof data !== 'object') {
      return next(new AppError('Invalid input data', 400));
    }

    const newDoc = await Model.create(data);

    res.status(200).json({
      status: 'success',
      data: { newDoc },
    });
  });
};

const getAll = catchAsync(async (req, res, next) => {
  let query = req.mongoQuery;
  // const docs = await query.explain();
  const docs = await query;
  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: {
      docs,
    },
  });
});

const setBaseFilter = (paramName, fieldname) => (req, res, next) => {
  const value = req.params?.[paramName];
  req.baseFilter = value // its like obj[key] => obj.key
    ? { [fieldname]: value }
    : {};
  next();
};

const getOne = (
  Model,
  { popOpts = [], constraints = {}, select = null } = {}
) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findOne({ _id: req.params.id, ...constraints });

    if (select) {
      query = query.select(select);
    }

    if (Array.isArray(popOpts) && popOpts.length) {
      popOpts.forEach((opts) => {
        query = query.populate(opts);
      });
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

const deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

const updateOne = (Model, buildData) => {
  if (typeof buildData !== 'function') {
    throw new Error('CreateOne requires a data builder fn 🚸🚸🚸');
  }
  return catchAsync(async (req, res, next) => {
    const data = buildData(req);
    if (!data || typeof data !== 'object') {
      return next(new AppError('Invalid input', 400));
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });
};

module.exports = {
  createOne,
  deleteOne,
  updateOne,
  getOne,
  getAll,
  setBaseFilter,
};
