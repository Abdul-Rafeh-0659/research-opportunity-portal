# University Research Opportunity Portal

CN Assignment #01 - Fall 2026

## Project Description

A simple web-based application for managing university research opportunities.

Faculty members can create, view, update, close, and delete research opportunities.

The frontend communicates with an Express REST API, and all opportunity records are stored in MySQL.

## Technologies Used

- Node.js
- Express.js
- MySQL 8
- HTML5
- CSS3
- Vanilla JavaScript
- Bootstrap 5
- Postman
- Git and GitHub

## Features

- Create research opportunities
- List all available opportunities
- View complete opportunity details
- Edit existing opportunities
- Change status from Open to Closed
- Delete opportunities
- Validate required input fields
- Display success and error messages
- Handle appropriate HTTP response codes

## Project Structure

    research-opportunity-portal/
    ├── backend/
    │   ├── config/
    │   │   └── db.js
    │   ├── controllers/
    │   │   └── opportunityController.js
    │   ├── routes/
    │   │   └── opportunityRoutes.js
    │   ├── .env.example
    │   ├── package.json
    │   ├── package-lock.json
    │   └── server.js
    ├── frontend/
    │   ├── css/style.css
    │   ├── js/app.js
    │   └── index.html
    ├── database/
    │   └── schema.sql
    ├── postman/
    │   └── Research_Opportunity_Portal.postman_collection.json
    ├── .gitignore
    └── README.md

## Setup Instructions

### 1. Requirements

Install Node.js, npm, and MySQL 8.

### 2. Clone the Repository

    git clone https://github.com/Abdul-Rafeh-0659/research-opportunity-portal
    cd research-opportunity-portal

### 3. Create the Database

Run from the project root:

    sudo mysql < database/schema.sql

This creates the research_portal database and opportunities table.

### 4. Create a MySQL Application User

Open MySQL:

    sudo mysql

Execute the following SQL statements, replacing the password placeholder with your own private password:

    CREATE USER 'research_app'@'localhost'
    IDENTIFIED BY 'CHOOSE_A_PRIVATE_PASSWORD';

    GRANT SELECT, INSERT, UPDATE, DELETE
    ON research_portal.*
    TO 'research_app'@'localhost';

    EXIT;

If the user already exists, configure the existing account instead of creating it again.

### 5. Configure Environment Variables

Open the backend directory:

    cd backend

Create a private .env file from the example:

    cp .env.example .env

Edit .env and configure:

    PORT=3000
    DB_HOST=127.0.0.1
    DB_USER=research_app
    DB_PASSWORD=YOUR_PRIVATE_PASSWORD
    DB_NAME=research_portal

Never upload .env to GitHub.

### 6. Install Dependencies

From the backend directory:

    npm ci

### 7. Start the Application

From the backend directory:

    node server.js

For development with automatic restarts:

    node --watch server.js

### 8. Open the Frontend

Visit:

    http://localhost:3000

The same Express server serves the frontend and REST API.

Bootstrap styling requires internet access to load its CDN stylesheet.

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/opportunities | Create opportunity |
| GET | /api/opportunities | List opportunities |
| GET | /api/opportunities/:id | Get opportunity by ID |
| PUT | /api/opportunities/:id | Update or close opportunity |
| DELETE | /api/opportunities/:id | Delete opportunity |

## HTTP Response Codes

- 200: Successful request
- 201: Opportunity created
- 400: Invalid request data
- 404: Opportunity not found
- 500: Internal server error

API responses use JSON.

## API Testing

Import:

    postman/Research_Opportunity_Portal.postman_collection.json

into Postman.

Start the backend server and run the requests in collection order.

The collection covers:

1. Creating three opportunities
2. Retrieving all opportunities
3. Retrieving a single opportunity
4. Updating an opportunity
5. Closing an opportunity
6. Deleting an opportunity
7. Demonstrating 404 after deletion
8. Demonstrating 400 validation errors

The collection automatically stores the first created opportunity ID.

## GitHub Repository

https://github.com/Abdul-Rafeh-0659/research-opportunity-portal

## Demonstration

A demonstration video of no more than 60 seconds is included with the assignment submission or supplied as a video link.

## Security Notes

- Database credentials are stored in .env.
- .env and node_modules are excluded from Git.
- SQL queries use parameterized statements.
- Backend input validation is implemented.

## Academic Information

Course: Computer Networks (CN)

Assignment: #01 — University Research Opportunity Portal

Semester: Fall 2026
