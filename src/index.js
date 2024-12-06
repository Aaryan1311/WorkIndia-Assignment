const db = require('./db');
const express = require('express');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());




//registration
app.post('/register', async (req,res) => {
    const { username ,password , role } = req.body;

    const hashpassword = await bcrypt.hash(password,10);
    const query = 'INSERT INTO users (username, password, role) VALUES (? ,? ,? )';
    db.query(query,[username,hashpassword, role || 'user'], (err,result) => {
        if(err){
            console.error('Error: ', err);
            return res.status(500).send('Error in user registration');
        }

        res.status(201).send('User registration successfull');
    });
});


//login
app.post('/login',(req,res) => {
    const {username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err,result) => {
        if(err){
            console.error('Error: '.replace, err);
            return res.status(500).send('Login failed');
        }

        if(result.length === 0){
            return res.status(400).send('User not found');
        }

        //check password
        const user = result[0];
        const flag = await bcrypt.compare(password,user.password);

        if(!flag){
            res.status(400).send('Incorrect Password');
        }

        const token = jwt.sign(
            {
                userId: user.id, role: user.role 
            },

            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.status(200).json({message: 'Login successfully',token});
    });
});



//seat availability check
app.get('/availability', (req,res) => {
    const {source,destination} = req.query;
    if(!source){
        return res.status(400).send('Source is required');
    }
    if(!destination){
        return res.status(400).send('Destination is required');
    }

    const query = `
    SELECT * FROM trains
    WHERE source = ? AND destination = ?
    `

    db.query(query,[source,destination], (err,result) => {
        if(err){
            console.log('Error: ', err);
            return res.status(500).send('Error in fetching availability');
        }

        if(result.length === 0){
            return res.status(404).send('No train found in the given route');
        }

        res.status(200).json(result);
    });
});





const PORT = 3000;
app.listen(PORT, () =>{
    console.log(`Server running at port ${PORT}`);
})
