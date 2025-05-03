// models/Pet.js
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  species: { type: String }, // Dog, Cat, etc.
  breed: { type: String },
  age: { type: Number },
  gender: { type: String },
  healthInfo: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Pet', petSchema);
