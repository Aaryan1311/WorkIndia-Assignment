const dotenv = require("dotenv");
dotenv.config(); 

const adminAuth = (req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).send("Invalid API Key");
  }
  next();
};

module.exports = adminAuth; 
