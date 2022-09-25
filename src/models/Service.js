const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  commit: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    required: true
  },
});

module.exports = mongoose.model("Service", serviceSchema);
