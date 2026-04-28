const errorHandler = (err, req, res, next) => {
  console.error(`[Error]: ${err.message}`);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show the detailed stack trace if we are in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the errorHandler above
};

module.exports = { errorHandler, notFound };