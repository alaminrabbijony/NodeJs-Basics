const queryReq = (Model) => (req, res, next) => {
  //1. FILTERING

  const queryFilter = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryFilter[el]);
  
  const queryObj = { ...(req.baseFilter || {}), ...queryFilter };

  //2. ADVANCED FILTERING
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  const filter = JSON.parse(queryStr);

  let mongoQuery = Model.find(filter);
  //3. SORTING
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    mongoQuery = mongoQuery.sort(sortBy);
  } else {
    mongoQuery = mongoQuery.sort('-createdAt');
  }
  //4. FIELD LIMITING
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    mongoQuery = mongoQuery.select(fields);
  } else {
    mongoQuery = mongoQuery.select('-__v');
  }
  //5. PAGINATION
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const skip = (page - 1) * limit;
  mongoQuery = mongoQuery.skip(skip).limit(limit);
  //6, Attach the query to the req object
  req.mongoQuery = mongoQuery;
  next();
};
module.exports = queryReq;
