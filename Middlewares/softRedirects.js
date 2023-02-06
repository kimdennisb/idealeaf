const softRedirects = (req, res, next) => {
  let redirect_to = req.query.redirect_to || req.headers.referer || "/";
  redirect_to === `${req.protocol}://${req.get(`host`)}/signup`
    ? (redirect_to = `/`)
    : redirect_to.includes(`reset`)
    ? (redirect_to = `/`)
    : undefined;
  req.session.redirect_to = redirect_to;
  next();
};

module.exports = softRedirects;
