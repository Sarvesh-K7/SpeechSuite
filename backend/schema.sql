-- Optional manual setup (Flask-SQLAlchemy's db.create_all() also does this automatically).

CREATE DATABASE IF NOT EXISTS speech_to_text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE speech_to_text;

CREATE TABLE IF NOT EXISTS transcriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    detected_language VARCHAR(20),
    duration_seconds FLOAT,
    session_id VARCHAR(64),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;