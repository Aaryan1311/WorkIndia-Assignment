const db = require('./db');

db.query('SHOW DATABASES', (err,results) => {
    if(err) throw err;
    console.log('Database: ', results);
});