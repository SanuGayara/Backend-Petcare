const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://sanuki:isanuki123@cluster0.jczded4.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\n MongoDB Connected Successfully!');
    console.log(`   ➤ Host: ${conn.connection.host}`);
    console.log(`   ➤ DB Name: ${conn.connection.name}\n`);
  } catch (err) {
    console.error('\n MongoDB Connection Failed!');
    console.error(`   ➤ Error: ${err.message}\n`);
    process.exit(1); // Exit the process on failure
  }
};

module.exports = connectDB;
