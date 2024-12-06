const db = require('../config/db');

//train availability
exports.checkAvailability = (req, res) => {
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
};