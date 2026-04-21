const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const seedDatabase = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/neighbour');
        console.log('MongoDB connected for seeding.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const dummyUsers = [
            // --- CUSTOMERS ---
            {
                name: 'Alice Customer',
                email: 'alice@example.com',
                password: hashedPassword,
                role: 'customer',
                phone: '9876543210',
                location: { type: 'Point', coordinates: [78.0772, 9.8787] } // Tiruparankundram Center
            },
            {
                name: 'Bob Buyer',
                email: 'bob@example.com',
                password: hashedPassword,
                role: 'customer',
                phone: '9876543211',
                location: { type: 'Point', coordinates: [78.0812, 9.8820] } // Nearby
            },
            // --- PROVIDERS ---
            {
                name: 'Carlos Plumber',
                email: 'carlos@example.com',
                password: hashedPassword,
                role: 'provider',
                phone: '9123456780',
                skills: ['Plumbing', 'AC Repair'],
                rating: 4.8,
                jobsCompleted: 45,
                yearsOfExperience: 10,
                location: { type: 'Point', coordinates: [78.0750, 9.8750] } // Tiruparankundram
            },
            {
                name: 'Diana Electrician',
                email: 'diana@example.com',
                password: hashedPassword,
                role: 'provider',
                phone: '9123456781',
                skills: ['Electrical'],
                rating: 4.9,
                jobsCompleted: 120,
                yearsOfExperience: 15,
                location: { type: 'Point', coordinates: [78.0790, 9.8790] } // Tiruparankundram
            },
            {
                name: 'Evans Cleaners',
                email: 'evans@example.com',
                password: hashedPassword,
                role: 'provider',
                phone: '9123456782',
                skills: ['Cleaning', 'Gardening'],
                rating: 4.2,
                jobsCompleted: 12,
                yearsOfExperience: 2,
                location: { type: 'Point', coordinates: [78.0700, 9.8800] } // Tiruparankundram
            },
            {
                name: 'Fiona Tech',
                email: 'fiona@example.com',
                password: hashedPassword,
                role: 'provider',
                phone: '9123456783',
                skills: ['PC Repair'],
                rating: 5.0,
                jobsCompleted: 230,
                yearsOfExperience: 8,
                location: { type: 'Point', coordinates: [78.0850, 9.8700] } // Tiruparankundram
            },
            {
                name: 'George Handyman',
                email: 'george@example.com',
                password: hashedPassword,
                role: 'provider',
                phone: '9123456784',
                skills: ['Carpentry', 'Painting'],
                rating: 4.5,
                jobsCompleted: 67,
                yearsOfExperience: 5,
                location: { type: 'Point', coordinates: [78.0650, 9.8850] } // Tiruparankundram
            }
        ];

        const emailList = dummyUsers.map(u => u.email);
        await User.deleteMany({ email: { $in: emailList } });

        let addedCount = 0;
        for (const u of dummyUsers) {
            await User.create(u);
            addedCount++;
        }

        console.log(`Successfully added ${addedCount} dummy users!`);
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

seedDatabase();
