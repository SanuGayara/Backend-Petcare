const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vet: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  reason: String,
  status: { type: String, enum: ['booked', 'cancelled', 'completed'], default: 'booked' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
