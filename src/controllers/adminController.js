const db = require('../config/db');

// admin: add train
exports.addTrain = (req,res) => {

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
};




// admin: update seats
exports.updateSeats = (req, res) => {
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
};



// admin:delete train
exports.deleteTrain = (req, res) => {
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
};