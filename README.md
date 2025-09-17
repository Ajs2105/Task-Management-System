Task Management System

A full-stack Task Management System designed to manage tasks efficiently. This project demonstrates a working Spring Boot backend with PostgreSQL database, a React.js frontend, and secure JWT token-based authorization. The system follows Agile methodology principles and is fully tested using Postman.

Features

User Authentication & Authorization:
Secure JWT-based login and signup functionality with role-based access control.

Task Management:

Create, read, update, and delete tasks.

Assign tasks to users and track status.

Database:

PostgreSQL database for persistent storage.

Properly designed tables for users, roles, and tasks.

Backend:

Developed using Spring Boot.

REST APIs for managing tasks and user authentication.

Fully tested using Postman.

Frontend (Basic):

Built using React.js to test API integration.

Simple UI to check functionality of backend APIs.

Note: API integration errors may occur as the frontend is basic and intended for testing only.

Development Methodology:

Project developed following Agile principles.

Iterative development and continuous testing ensure reliability of APIs.

Security:

JWT token-based authentication for secure access to APIs.

Tech Stack

Backend: Java, Spring Boot

Frontend: React.js

Database: PostgreSQL

Testing: Postman

Authentication: JWT Token

Setup Instructions

Backend Setup:

Configure PostgreSQL database and update application.properties.

Run Spring Boot application using:

./mvnw spring-boot:run


Frontend Setup:

Navigate to frontend folder:

cd task-manager-frontend


Install dependencies:

npm install


Run React app:

npm run dev


Testing APIs:

Use Postman to test backend endpoints.

Include JWT token in Authorization header for secured endpoints.

Future Improvements

Enhance frontend with full UI for task management.

Add role-based dashboards for admin and user.

Implement real-time notifications for task updates using WebSockets.

Improve error handling and API validations.
