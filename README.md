# Ticket Management System

A modern, responsive web-based ticket management system built with Node.js, Express, and MySQL. Features a clean interface with both list and board views for efficient ticket management.

## Features

### Ticket Management
- **Create New Tickets** - Simple form with validation for title, description, and contact information
- **Status Tracking** - Four status levels: Pending, Accepted, Resolved, Rejected
- **Real-time Updates** - Instant status changes with visual feedback
- **Comprehensive Validation** - Client-side and server-side validation

### Multiple Views
- **List View** - Traditional table-style ticket listing with filtering and search
- **Kanban Board** - Drag-and-drop interface for visual ticket management
- **Advanced Filtering** - Filter by status, search by title

### User Experience
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Toast Notifications** - Real-time feedback for all actions
- **Loading States** - Smooth loading indicators and animations
- **Accessibility** - WCAG compliant with proper ARIA labels and keyboard navigation

### Technical Features
- **RESTful API** - Clean API endpoints for all ticket operations
- **MySQL Database** - Reliable data storage with proper indexing
- **Docker Support** - Containerized deployment with Docker Compose
- **Error Handling** - Comprehensive error handling and user feedback
- **Input Sanitization** - XSS protection and data validation

## Screenshots

### New Ticket Creation
<img width="1849" height="923" alt="Screenshot 2025-08-17 211953" src="https://github.com/user-attachments/assets/09e0525c-5edc-4afc-ba49-d79c6d0de7f8" />

### Ticket Backlog View
<img width="1820" height="968" alt="Screenshot 2025-08-17 212019" src="https://github.com/user-attachments/assets/1280f3a1-9f07-48a4-898b-8f0c0c8a428a" />

### Board Interface
<img width="1840" height="946" alt="Screenshot 2025-08-17 212045" src="https://github.com/user-attachments/assets/089a6aa6-ab9f-45aa-a94e-7e8c692a2019" />


## Docker Deployment (Recommended)

The easiest way to run the application is using Docker Compose, which sets up the entire stack automatically.

### 1. Clone the repository
```bash
git clone https://github.com/natthaphong010245/Test-Nipa-Technology.git
cd Test-Nipa-Technology
```

### 2. Start with Docker Compose
```bash
# Start all services (Node.js, MySQL, phpMyAdmin)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Access the application
- **Main Application**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8080 (username: `root`, password: `root`)
- **API Health Check**: http://localhost:8000/tickets

### Docker Services
The Docker setup includes:
- **Node.js Application** (Port 8000) - Main helpdesk server
- **MySQL Database** (Port 3306) - Data storage with auto-initialization
- **phpMyAdmin** (Port 8080) - Database management interface

### Environment Variables (Docker)
The Docker setup uses these environment variables:
```env
DB_HOST=db
DB_USER=root
DB_PASSWORD=root
DB_NAME=helpdesk_system
DB_PORT=3306
NODE_ENV=production
```

## Manual Installation

### 1. Clone the repository
```bash
git clone https://github.com/natthaphong010245/Test-Nipa-Technology.git
cd Test-Nipa-Technology
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
Connect to your MySQL server and run the following SQL commands:
```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS helpdesk_system;
USE helpdesk_system;

-- Create the tickets table
CREATE TABLE tickets (
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

-- Insert sample data (optional)
INSERT INTO tickets (title, description, contact_information, status) VALUES
('Login Issue', 'Cannot login to the system with correct credentials', 'john.doe@example.com', 'pending'),
('Password Reset', 'Need to reset password for user account', 'jane.smith@example.com', 'accepted'),
('Software Bug', 'Application crashes when clicking save button', 'support@company.com', 'pending'),
('Feature Request', 'Request for new reporting feature', 'manager@company.com', 'resolved'),
('Network Problem', 'Cannot connect to company VPN', 'tech@company.com', 'rejected');
```

### 4. Configure database connection
Edit `server/index.js` and update the database configuration:
```javascript
const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'helpdesk_system',
    port: 3306
})
```

### 5. Start the server
```bash
cd server
npx nodemon index.js
```

### 6. Access the application
Open your browser and navigate to `http://localhost:8000`

## API Endpoints

### Tickets
- `GET /tickets` - Retrieve all tickets (optional filtering)
- `POST /tickets` - Create a new ticket
- `GET /tickets/:id` - Get a specific ticket
- `PUT /tickets/:id` - Update a ticket (typically status changes)
- `GET /tickets/stats` - Get ticket statistics by status

### Query Parameters
- `status` - Filter by ticket status (pending, accepted, resolved, rejected)
- `sortBy` - Sort by field (created_at, updated_at, status, title)
- `order` - Sort order (ASC, DESC)

## Development

### Local Development Setup
For development with hot reload:

```bash
# Start database only with Docker
docker-compose up -d db phpmyadmin

# Run server in development mode
cd server
npm run dev
```

### Environment Configuration
The application supports different environments:
- **Development**: Uses localhost database, port 3001
- **Production**: Uses Docker services, port 8000
