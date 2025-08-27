GramRoot Foods - Backend API | A Digital Marketplace for Rural Freshness
"GramRoot Foods" is an innovative e-commerce platform that delivers fresh and traditional food items from rural areas directly to urban customers. This repository contains the complete backend API for the platform, built using Node.js, Express, and MongoDB.

🚀 Key Features
User Management: Separate roles and permissions for three types of users: Customer, Seller, and Admin.

Full-Featured Authentication: Secure registration, login, and session management using JWT (JSON Web Token).

Seller Management System:

Application process for users to become sellers, with an approval system managed by the admin.

A withdrawal request system for sellers to cash out their earnings.

A dedicated dashboard and order management system for sellers.

Complete E-commerce Functionality:

Detailed product information, categories, and inventory management.

A seamless shopping cart and a secure checkout process.

Integrated with the SSLCommerz payment gateway.

Innovative Coin System: A rewards system that allows customers to earn coins from purchases and use them for discounts.

Advanced Features:

A rating and review system for products.

A wishlist feature for users.

Advanced search, filtering, and sorting capabilities.

Powerful Admin Panel:

An advanced dashboard for complete site control and oversight.

The ability to manage users, products, and orders.

A Content Management System (CMS) to control static pages.

🛠️ Tech Stack
Backend: Node.js, Express.js

Database: MongoDB with Mongoose ODM

Authentication: Passport.js (JWT Strategy, Google OAuth)

Security: Helmet, CORS, bcrypt.js

Payment Gateway: SSLCommerz

Real-time Logging: Morgan (in development)

⚙️ Getting Started
Follow the steps below to set up and run this project on your local machine.

Prerequisites
Node.js (v16 or higher)

MongoDB (local database or Atlas)

Git

Installation
Clone the repository:

Bash

git clone https://github.com/alamin99ab/gramroot-ecommerce.git
cd gramroot-foods-backend
Install the necessary packages:

Bash

npm install
Set up environment variables:
Create a file named .env in the root directory of the project. Then, fill it with your information according to the format in the .env.example file below.

Code snippet

# .env.example
PORT=5000
NODE_ENV=development
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY

# Google OAuth Credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# SSLCommerz Credentials
STORE_ID=YOUR_STORE_ID
STORE_PASSWORD=YOUR_STORE_PASSWORD
Start the development server:

Bash

npm run dev
The server will start running at http://localhost:5000.

📄 API Documentation
Use the Postman collection below to test all the API endpoints for this project.

Postman Collection Link
(You can upload your collection to Postman and share the public link here)

👤 Author
Alamin

GitHub: @alamin99ab