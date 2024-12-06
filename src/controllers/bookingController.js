const db = require('../config/db');


// start booking
exports.bookSeat = (req, res) => {
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
};



// confirmation
exports.confirmBooking = (req, res) => {
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
        res.status(200).send(`Booking confirmed successfully
            UserId: ${userId},
            Train No.: ${trainId},
            Seat No.:  ${seat_no}`
        );
    });
};