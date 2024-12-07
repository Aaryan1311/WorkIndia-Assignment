
# Assignment for SDE Internship Program at WorkIndia

## Project Description

This project implements a ticket booking system with two roles:
1. **User**: Can book and confirm tickets in a race condition environment.
2. **Admin**: Can add, delete trains, and update the number of seats.

The system handles serial seat allocation and ensures smooth operations in concurrent scenarios.

---

## Technologies Used

- **Node.js**
- **MySQL**

---

## Installation Instructions

1. **Clone the Repository**:
   \`\`\`bash
   git clone <repository-url>
   cd <repository-folder>
   \`\`\`

2. **Install Dependencies**:
   \`\`\`bash
   npm install bcrypt dotenv express jsonwebtoken mysql2
   \`\`\`

3. **Create a \`.env\` File**:
   Add the following environment variables:
   \`\`\`
   DB_HOST = localhost
   DB_USER = root
   DB_PASSWORD = "your sql password"
   DB_NAME = irctc
   JWT_SECRET = "your jwt secret"
   ADMIN_API_KEY = "your api key"
   \`\`\`

4. **Create the MySQL Database**:
   Use the following SQL commands:
   \`\`\`sql
   CREATE DATABASE irctc;
   USE irctc;

   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(255) NOT NULL,
       password VARCHAR(255) NOT NULL,
       role ENUM('admin', 'user') DEFAULT 'user',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE trains (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       source VARCHAR(255) NOT NULL,
       destination VARCHAR(255) NOT NULL,
       total_seats INT NOT NULL,
       available_seats INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE bookings (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       train_id INT NOT NULL,
       booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id),
       FOREIGN KEY (train_id) REFERENCES trains(id)
   );

   ALTER TABLE trains ADD COLUMN locked_until TIMESTAMP DEFAULT NULL;

   CREATE TABLE locked_seats (
       id INT AUTO_INCREMENT PRIMARY KEY,
       train_id INT NOT NULL,
       seat_number INT NOT NULL,
       locked_until TIMESTAMP NOT NULL,
       user_id INT NOT NULL,
       confirmed BOOLEAN DEFAULT FALSE,
       FOREIGN KEY (train_id) REFERENCES trains(id)
   );
   \`\`\`

---

## API Endpoints

### **Auth Endpoints**

#### **1. Register**
- **POST** \`/auth/register\`
- **Example Body**:
  \`\`\`json
  {
      "username": "person1",
      "password": "password1",
      "role": "admin"
  }
  \`\`\`
  \`\`\`json
  {
      "username": "person2",
      "password": "password2",
      "role": "user"
  }
  \`\`\`

#### **2. Login**
- **POST** \`/auth/login\`
- **Example Body for Admin Login**:
  \`\`\`json
  {
      "username": "person1",
      "password": "password1"
  }
  \`\`\`
- **Example Body for User Login**:
  \`\`\`json
  {
      "username": "person2",
      "password": "password2"
  }
  \`\`\`

---

### **Admin Endpoints**

#### **1. Add Train**
- **POST** \`/admin/addTrain\`
- **Example Body**:
  \`\`\`json
  {
      "name": "train1",
      "source": "source1",
      "destination": "destination1",
      "totalSeats": 100
  }
  \`\`\`
  \`\`\`json
  {
      "name": "train2",
      "source": "source2",
      "destination": "destination2",
      "totalSeats": 200
  }
  \`\`\`

#### **2. Update Train Seats**
- **PUT** \`/admin/updateSeats/1\`
- **Example Body**:
  \`\`\`json
  {
      "totalSeats": 400
  }
  \`\`\`

#### **3. Delete Train**
- **DELETE** \`/admin/deleteTrain/2\`
- Deletes train with ID \`2\`.

---

### **User Endpoints**

#### **1. Book a Seat**
- **POST** \`/booking/book\`
- **Example Body**:
  \`\`\`json
  {
      "trainId": 1,
      "userId": 2
  }
  \`\`\`

#### **2. Confirm Booking**
- **POST** \`/booking/confirm\`
- **Example Body**:
  \`\`\`json
  {
      "trainId": 1,
      "seat_no": 30,
      "userId": 2
  }
  \`\`\`

#### **3. Check Train Availability**
- **GET** \`/train/availability\`
- **Query Parameters**:
  \`\`\`
  ?source=source1&destination=destination1
  \`\`\`

---

## How to Test
1. Use a tool like **Postman** or **cURL** to test each endpoint.
2. Start with registering a user or admin.
3. Log in to obtain an authentication token for the \`Authorization\` header (format: \`Bearer <token>\`).
4. Use the token to access the respective endpoints for booking, confirming, or managing trains.

---

