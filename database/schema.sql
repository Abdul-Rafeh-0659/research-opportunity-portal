CREATE DATABASE IF NOT EXISTS research_portal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE research_portal;

CREATE TABLE IF NOT EXISTS opportunities (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    research_area VARCHAR(100) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    required_skills TEXT NOT NULL,
    available_positions INT NOT NULL,
    application_deadline DATE NOT NULL,
    status VARCHAR(6) NOT NULL DEFAULT 'Open',

    CONSTRAINT chk_positions
        CHECK (available_positions > 0),

    CONSTRAINT chk_status
        CHECK (BINARY status IN ('Open', 'Closed'))
);
