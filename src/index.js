const db = require('./config/db');
const express = require('express');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const adminAuth = require('./middlewares/adminAuth');

dotenv.config();

const app = express();
app.use(express.json());



//registration
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const hashpassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users 
        (username, password, role)
         VALUES (?, ?, ?)`;


        db.query(query, [username, hashpassword, role || 'user'], (err) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).send('Cannot register at the moment. Please try again later');
            }
            res.status(201).send('User registration successful');
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal server error');
    }
});



//login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * 
    FROM users 
    WHERE username = ?`;


    db.query(query, [username], async (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).send('Login failed');
        }

        if (result.length === 0) {
            return res.status(400).send('User not found');
        }

        const user = result[0];
        const flag = await bcrypt.compare(password, user.password);

        if (!flag) {
            return res.status(400).send('Incorrect password');
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    });
});



// admin: add train
app.post('/admin/addTrain', adminAuth, (req, res) => {
    const { name, source, destination, totalSeats } = req.body;

    if (!name || !source || !destination || !totalSeats) {
        return res.status(400).send('All fields are required');
    }

    const query = `
        INSERT INTO trains 
        (name, source, destination, total_seats, available_seats)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [name, source, destination, totalSeats, totalSeats], (err) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).send('Cannot add train at the moment. Please try again later');
        }
        res.status(201).send('Train added successfully');
    });
});




// admin: update seats
app.put('/admin/updateSeats/:trainId', adminAuth, (req, res) => {
    const { trainId } = req.params;
    const { totalSeats } = req.body;

    if (!totalSeats || isNaN(totalSeats) || totalSeats <= 0) {
        return res.status(400).send('Valid total seats are required');
    }


    const query = `SELECT total_seats, available_seats 
    FROM trains 
    WHERE id = ?`;



    db.query(query, [trainId], (err, result) => {
        if (err) {
            console.error('Error fetching train:', err);
            return res.status(500).send('Error fetching train details');
        }

        if (result.length === 0) {
            return res.status(404).send('Train not found');
        }

        const train = result[0];
        const difference = totalSeats - train.total_seats;

  
        const update = `
            UPDATE trains
            SET total_seats = ?, available_seats = GREATEST(available_seats + ?, 0)
            WHERE id = ?
        `;



        db.query(update, [totalSeats, difference, trainId], (err) => {

            if (err) {
                console.error('Error updating train seats:', err);
                return res.status(500).send('Cannot update total seats');
            }

            res.status(200).send('Train seats updated successfully');
        });
    });
});



// admin:delete train
app.delete('/admin/deleteTrain/:trainId', adminAuth, (req, res) => {
    const { trainId } = req.params;


    const lock_seat_row = 'DELETE FROM locked_seats WHERE train_id = ?';
    db.query(lock_seat_row, [trainId], (err) => {
        if (err) {
            console.error('Error :', err);
            return res.status(500).send('Cannot delete locked seats');
        }

        
        const delete_train = 'DELETE FROM trains WHERE id = ?';
        db.query(delete_train, [trainId], (err) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).send('Cannot delete train');
            }

            res.status(200).send('Train deleted successfully');
        });
    });
});

// check availability
app.get('/trainavailability', (req, res) => {
    const { source, destination } = req.query;

    if (!source || !destination) {
        return res.status(400).send('Source and destination are required');
    }

    const query = `
        SELECT * FROM trains
        WHERE source = ? AND destination = ?
    `;
    db.query(query, [source, destination], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).send('Cannot check train availability at the moment');
        }

        if (result.length === 0) {
            return res.status(404).send('No train found on the given route');
        }

        res.status(200).json(result);
    });
});

// start booking
app.post('/seatbooking', (req, res) => {
    const { trainId, userId } = req.body;

    if (!trainId || !userId) {
        return res.status(400).send('Train ID and User ID are required');
    }

    const current_time = new Date();

    const query = 'SELECT * FROM trains WHERE id = ?';
    db.query(query, [trainId], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).send('Cannot check train availability at the moment');
        }

        if (result.length === 0) {
            return res.status(404).send('No train found');
        }

        const train = result[0];

        if (train.available_seats <= 0) {
            return res.status(400).send('No available seats');
        }

        const seat_lock = `
            INSERT INTO locked_seats (train_id, seat_number, locked_until, user_id)
            VALUES (?, ?, ?, ?)
        `;
        const lockuntil = new Date(current_time.getTime() + 10 * 60000);
        const seatNumber = train.total_seats - train.available_seats + 1;

        db.query(seat_lock, [trainId, seatNumber, lockuntil, userId], (err) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).send('Cannot lock seat at the moment');
            }

            const update_seats = `
                UPDATE trains
                SET available_seats = ?
                WHERE id = ?
            `;
            db.query(update_seats, [train.available_seats - 1, trainId], (err) => {
                if (err) {
                    console.error('Error:', err);
                    return res.status(500).send('Cannot update seat availability');
                }
                res.status(201).send('Seat locked for 10 minutes. Please confirm booking');
            });
        });
    });
});



// confirmation
app.post('/confirmbooking', (req, res) => {
    const { trainId, seat_no, userId } = req.body;

    if (!trainId || !seat_no || !userId) {
        return res.status(400).send('Train ID, seat number, and user ID are required');
    }



    const confirm = `
        UPDATE locked_seats
        SET confirmed = TRUE
        WHERE train_id = ? AND seat_number = ? AND user_id = ?
    `;



    db.query(confirm, [trainId, seat_no, userId], (err) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).send('Cannot confirm booking at the moment');
        }
        res.status(200).send('Booking confirmed successfully');
    });
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});
