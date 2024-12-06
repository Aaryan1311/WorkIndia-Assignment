const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();



//registration
exports.register = async (req, res) => {
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
};



//login
exports.login = (req, res) => {
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
};
