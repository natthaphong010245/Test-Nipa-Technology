CREATE DATABASE IF NOT EXISTS helpdesk_system;
USE helpdesk_system;

CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    contact_information VARCHAR(100) NOT NULL,
    status ENUM('pending', 'accepted', 'resolved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
);

INSERT INTO tickets (title, description, contact_information, status) VALUES
('Login Issue', 'Cannot login to the system with correct credentials', 'john.doe@example.com', 'pending'),
('Password Reset', 'Need to reset password for user account', 'jane.smith@example.com', 'accepted'),
('Software Bug', 'Application crashes when clicking save button', 'support@company.com', 'pending'),
('Feature Request', 'Request for new reporting feature', 'manager@company.com', 'resolved'),
('Network Problem', 'Cannot connect to company VPN', 'tech@company.com', 'rejected');

SHOW TABLES;

SELECT * FROM tickets ORDER BY created_at DESC;