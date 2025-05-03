const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

// Routes for the backend
const medicalRecordRoutes = require('./routes/medicalRecord');
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const appointmentRoutes = require('./routes/appointment');
const chatRoute = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB().then(() => {
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/pets', petRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/medical-records', medicalRecordRoutes);
  app.use('/api/chat', chatRoute)

  app.get('/api', (req, res) => res.send('API is live'));

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
