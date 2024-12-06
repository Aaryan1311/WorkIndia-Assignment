const db = require('./db');
const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

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

const PORT = 3000;
app.listen(PORT, () =>{
    console.log(`Server running at port ${PORT}`);
})
