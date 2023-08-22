const mongoose = require("mongoose");

const IpDeviceSchema = new mongoose.Schema(
  {
    ipaddress: {
      type: String,
    },
    device: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("IpDevice", IpDeviceSchema);
