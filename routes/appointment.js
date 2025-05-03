const express = require('express');
const authenticate = require('../middleware/auth');
const router = require('express').Router();
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// Book an appointment
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, type } = req.user;

    const appointmentData = {
      ...req.body,
    };

    // If the user is a pet owner, auto-set owner field
    if (type === 2) {
      appointmentData.owner = userId;
    }

    // If the user is a vet, auto-set vet field
    if (type === 1) {
      appointmentData.vet = userId;
    }

    const appt = new Appointment(appointmentData);
    await appt.save();
    res.status(201).json(appt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Get appointments (vet or owner)
router.get('/', authenticate, async (req, res) => {
  const { userId, type } = req.user;

  console.log('🧾 Authenticated Request');
  console.log('User ID:', userId);
  console.log('User Type:', type);

  try {
    // Type is a number (1 for vet, 2 for owner)
    const filter = type === 1
      ? { vet: new mongoose.Types.ObjectId(userId) }
      : { owner: new mongoose.Types.ObjectId(userId) };

    console.log('🔍 MongoDB Filter:', filter);

    const appointments = await Appointment.find(filter).populate('pet vet owner');

    console.log('📦 Appointments found:', appointments.length);
    if (appointments.length > 0) {
      console.log('First Appointment Sample:', appointments[0]);
    }

    res.json(appointments);
  } catch (err) {
    console.error('❌ Error fetching appointments:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Cancel appointment
router.patch('/:id/cancel', async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('pet');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
