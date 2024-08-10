const requestIp = require("request-ip");
const platform = require("platform");
const ipDevice = require("../Models/IpDevice");

module.exports = function(req, res, next) {
    const clientIp = requestIp.getClientIp(req);
    const filter = { ipaddress: clientIp }
    const update = {
        $set: {
            ipaddress: clientIp,
            device: platform.description
        }
    }

    ipDevice.findOneAndUpdate(filter, update, { new: true, upsert: true }, (err, results) => {
        if (err) {
            next(err);
        }
    })
    next();
};