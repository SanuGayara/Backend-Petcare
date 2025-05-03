const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const authenticate = require('../middleware/auth');

// 🔐 Get all pets for logged-in user (must be BEFORE /:ownerId)
router.get('/my-pets', authenticate, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user.userId });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧍‍♂️ Get all pets for a specific owner by ID
router.get('/:ownerId', async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.params.ownerId });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Register a new pet
router.post('/', async (req, res) => {
  try {
    const pet = new Pet(req.body);
    await pet.save();
    res.status(201).json(pet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update pet details
router.put('/:id', async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPet) return res.status(404).json({ message: 'Pet not found' });
    res.json(updatedPet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a pet
router.delete('/:id', async (req, res) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.id);
    if (!deletedPet) return res.status(404).json({ message: 'Pet not found' });
    res.json({ message: 'Pet deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search pets by name (case-insensitive)
router.get('/search/byName', async (req, res) => {
  try {
    const nameQuery = req.query.name;
    if (!nameQuery) return res.status(400).json({ message: 'Name query is required' });

    const pets = await Pet.find({ name: { $regex: nameQuery, $options: 'i' } });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
