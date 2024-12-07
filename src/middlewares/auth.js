const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
dotenv.config(); 

const adminAuth = (req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).send("Invalid API Key");
  }
  next();
};


const userAuth = (req, res, next) => {
    const token = req.header('Authorization'); 

    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
};


module.exports = { adminAuth, userAuth}; 
