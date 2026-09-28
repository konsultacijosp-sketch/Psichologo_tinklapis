const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  reason: { type: String },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
