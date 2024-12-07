**Assignment for SDE Internship Program at WorkIndia**

**Project Description**

This project implements a ticket booking system with two roles:

1. **User**: Can book and confirm tickets in a race condition environment.
1. **Admin**: Can add, delete trains, and update the number of seats.

The system handles serial seat allocation and ensures smooth operations in concurrent scenarios.

-----
**Technologies Used**

- **Node.js**
- **MySQL**
-----
**Installation Instructions**

1. **Clone the Repository**: *bash git clone cd*
1. **Install Dependencies**: *bash npm install bcrypt dotenv express jsonwebtoken mysql2*
1. **Create a `.env` File**: Add the following environment variables:    
   DB\_HOST = localhost  
   DB\_USER = root  
   DB\_PASSWORD = "your sql password"  
   DB\_NAME = irctc  
   JWT\_SECRET = "your jwt secret"  
   ADMIN\_API\_KEY = "your api key"  

1. **Create the MySQL Database**: Use the following SQL commands: 
   sql CREATE DATABASE irctc;  
   USE irctc;  
   CREATE TABLE users  
   id INT AUTO\_INCREMENT PRIMARY KEY,  
   username VARCHAR(255) NOT NULL,
   password VARCHAR(255) NOT NULL,  
   role ENUM('admin', 'user') DEFAULT 'user',  
   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP;

   CREATE TABLE trains  
   id INT AUTO\_INCREMENT PRIMARY KEY,  
   name VARCHAR(255) NOT NULL,  
   source VARCHAR(255) NOT NULL,  
   destination VARCHAR(255) NOT NULL,  
   total\_seats INT NOT NULL,  
   available\_seats INT NOT NULL,  
   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP;

   CREATE TABLE bookings  
   id INT AUTO\_INCREMENT PRIMARY KEY,  
   user\_id INT NOT NULL,  
   train\_id INT NOT NULL,  
   booking\_time TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
   FOREIGN KEY (user\_id) REFERENCES users(id),  
   FOREIGN KEY (train\_id) REFERENCES trains(id);  

   ALTER TABLE trains ADD COLUMN locked\_until TIMESTAMP DEFAULT NULL;  

   CREATE TABLE locked\_seats  
   id INT AUTO\_INCREMENT PRIMARY KEY,  
   train\_id INT NOT NULL,  
   seat\_number INT NOT NULL,  
   locked\_until TIMESTAMP NOT NULL,  
   user\_id INT NOT NULL,  
   confirmed BOOLEAN DEFAULT FALSE,  
   FOREIGN KEY (train\_id)  
   REFERENCES trains(id);  

-----
**API Endpoints**

**Auth Endpoints**

**1. Register**

- **POST** /auth/register
- **Example Body**:  
  {  
  `        `"username": "person1",  
  `        `"password": "password1",  
  `        `"role": "admin"  
  }  

  {   
  `         `"username": "person2",  
  `           `"password": "password2",  
  `           `"role": "user"  
  }  

**2. Login**

- **POST** /auth/login
- **Example Body for Admin Login**:  
  {  
  `            `"username": "person1",  
  `            `"password": "password1"  
  }
- **Example Body for User Login**:   
  {  
  `        `"username": "person2",  
  `        `"password": "password2"  
  }
-----
**Admin Endpoints**

**1. Add Train**

- **POST** /admin/addTrain
- **Example Body**:   
  {  
  `       `"name": "train1",  
  `       `"source": "source1",  
  `       `"destination": "destination1",  
  `       `"totalSeats": 100  
  } 

  {  
  `         `"name": "train2",  
  `         `"source": "source2",  
  `         `"destination": "destination2",  
  `         `"totalSeats": 200  
  }  

**2. Update Train Seats**

- **PUT** /admin/updateSeats/1
- **Example Body**:  
  {  
  `           `"totalSeats": 400  
  }

**3. Delete Train**

- **DELETE** /admin/deleteTrain/2
- Deletes train with ID `2`.
-----
**User Endpoints**

**1. Book a Seat**

- **POST** /booking/book
- **Example Body**:  
  {  
  `        `"trainId": 1,  
  `        `"userId": 2  
  ` }

**2. Confirm Booking**

- **POST** /booking/confirm
- **Example Body**: 
  {  
  `         `"trainId": 1,  
  `         `"seat\_no": 30,  
  `         `"userId": 2  
  }

**3. Check Train Availability**

- **GET** /train/availability
- **Query Parameters**: *?source=source1&destination=destination1*
-----
**How to Test**

1. Use a tool like **Postman** to test each endpoint.
1. Start with registering a user or admin.
1. Log in to obtain an authentication token for the `Authorization` header (format: `Bearer `).
1. Use the token to access the respective endpoints for booking, confirming, or managing trains.

