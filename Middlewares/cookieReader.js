module.exports = (req, res, next) => {
    const cookie = req.headers.cookie;
    if (cookie) {
        const values = cookie.split(";").reduce((total, item) => {
            const data = item.trim().split("=");
            //adds data to total each time
            return {...total, [data[0]]: data[1] }
        }, {});
        res.locals.cookies = values;
    }
    next();
}