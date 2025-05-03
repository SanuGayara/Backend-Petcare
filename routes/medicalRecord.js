const router = require('express').Router();
const MedicalRecord = require('../models/MedicalRecord');
const Pet = require('../models/Pet');
const User = require('../models/User');
const mongoose = require('mongoose');
const authenticate = require('../middleware/auth');

// 🔐 Create a medical record (vet only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, type } = req.user;

    if (type !== 1) {
      return res.status(403).json({ message: 'Only vets can create medical records' });
    }

    const record = new MedicalRecord({
      ...req.body,
      vet: userId, // inject from token
    });

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔐 Get all medical records for the current vet
router.get('/my-records', authenticate, async (req, res) => {
  const { userId, type } = req.user;

  if (type !== 1) {
    return res.status(403).json({ message: 'Access denied. Not a vet.' });
  }

  try {
    const records = await MedicalRecord.find({ vet: userId })
      .populate('pet', 'name species')
      .populate('vet', 'fullName email');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/customer-records', authenticate, async (req, res) => {
  const { userId } = req.user;

  try {
    const pets = await Pet.find({ owner: userId }, '_id');
    const petIds = pets.map(p => p._id);

    const records = await MedicalRecord.find({ pet: { $in: petIds } })
      .populate('pet', 'name species')
      .populate('vet', 'fullName email');

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Get all medical records for a specific pet
router.get('/pet/:petId', async (req, res) => {
  try {
    const records = await MedicalRecord.find({ pet: req.params.petId })
      .populate('vet', 'fullName email')
      .populate('pet', 'name species');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all records created by a specific vet
router.get('/vet/:vetId', async (req, res) => {
  try {
    const records = await MedicalRecord.find({ vet: req.params.vetId })
      .populate('pet', 'name species')
      .populate('vet', 'fullName email');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Search records by pet name or ID
router.get('/search/pet', async (req, res) => {
  const { q } = req.query;

  try {
    let pets = [];

    if (mongoose.Types.ObjectId.isValid(q)) {
      const petById = await Pet.findById(q);
      if (petById) pets.push(petById);
    }

    const petsByName = await Pet.find({ name: { $regex: q, $options: 'i' } });
    pets.push(...petsByName);

    const petIds = [...new Set(pets.map(p => p._id))];

    const records = await MedicalRecord.find({ pet: { $in: petIds } })
      .populate('vet', 'fullName email')
      .populate('pet', 'name species');

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Search records by owner (user) name or ID
router.get('/search/owner', async (req, res) => {
  const { q } = req.query;

  try {
    let users = [];

    if (mongoose.Types.ObjectId.isValid(q)) {
      const userById = await User.findById(q);
      if (userById) users.push(userById);
    }

    const usersByName = await User.find({ fullName: { $regex: q, $options: 'i' } });
    users.push(...usersByName);

    const userIds = [...new Set(users.map(u => u._id))];

    const pets = await Pet.find({ owner: { $in: userIds } });
    const petIds = pets.map(p => p._id);

    const records = await MedicalRecord.find({ pet: { $in: petIds } })
      .populate('vet', 'fullName email')
      .populate('pet', 'name species');

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update a medical record
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { userId, type } = req.user;

    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Not found' });

    // Only the vet who created it can update
    if (record.vet.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to update this record' });
    }

    const updated = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('vet', 'fullName email')
      .populate('pet', 'name species');

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete a medical record
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { userId, type } = req.user;

    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Not found' });

    if (record.vet.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medical record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
