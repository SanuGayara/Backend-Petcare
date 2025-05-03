const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  vet: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitDate: { type: Date, default: Date.now },
  description: String,
  diagnosis: String,
  treatment: String,
  prescription: String,
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
