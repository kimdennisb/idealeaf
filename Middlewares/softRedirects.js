const softRedirects = (req, res, next) => {
  console.log(req.originalUrl);
  next();
};

module.exports = softRedirects;
