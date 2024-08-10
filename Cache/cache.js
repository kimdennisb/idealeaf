const cache = require("memory-cache");

// configuring cache middleware
const memCache = new cache.Cache();
const cacheMiddleware = (duration) => (req, res, next) => {
    const key = `__express__${req.originalUrl}` || req.url;
    const cacheContent = cache.get(key);
    if (cacheContent) {
        res.sendStatus(cacheContent);
    } else {
        res.sendResponse = res.send;
        res.sendStatus = (body) => {
            memCache.put(key, body, duration * 1000);
            res.sendResponse(body);
        };
        next();
    }
};

module.exports = cacheMiddleware;