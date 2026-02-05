const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User'); // Update this path to your User model

const seeder = async () => {
  try {
    console.log('Connected to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGO_URI);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const cities = [
      { name: 'Dhaka', coords: [90.4125, 23.8103] },
      { name: 'Chittagong', coords: [91.7832, 22.3569] },
      { name: 'Sylhet', coords: [91.8687, 24.8949] }
    ];

    const donors = [];
    let userCount = 1;

    // 3. Generate 24 Donors (3 per blood group)
    for (const group of bloodGroups) {
      for (let i = 0; i < 3; i++) {
        // Distribute donors across the 3 cities
        const city = cities[i % cities.length];
        
        donors.push({
          name: `Test Donor ${userCount}`,
          email: `test${userCount}@gmail.com`,
          phone: `017000000${userCount.toString().padStart(2, '0')}`,
          password: '12345678', // The pre-save hook will hash this
          role: 'donor',
          bloodGroup: group,
          location: {
            type: 'Point',
            coordinates: [
              city.coords[0] + (Math.random() - 0.5) * 0.1, // Slight variance
              city.coords[1] + (Math.random() - 0.5) * 0.1
            ],
            area: city.name
          },
          nidNumber: `199000000000${userCount}`,
          nidVerified: true,
          nidStatus: 'approved',
          status: 'active',
          emailVerified: true,
          totalPoints: Math.floor(Math.random() * 500),
          lastDonationDate: new Date(Date.now() - (Math.random() * 10000000000)),
          isBlocked: false
        });
        userCount++;
      }
    }

    // 4. Insert into Database
    await User.insertMany(donors);
    console.log('Successfully seeded 24 verified donors!');
    
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seeder();