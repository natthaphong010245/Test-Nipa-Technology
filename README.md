# Helpdesk Ticket Management System

A modern, responsive web-based helpdesk ticket management system built with Node.js, Express, and MySQL. Features a clean interface with both list and Kanban board views for efficient ticket management.

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
- **Error Handling** - Comprehensive error handling and user feedback
- **Input Sanitization** - XSS protection and data validation

## Screenshots

### New Ticket Creation
![New Ticket Form](https://via.placeholder.com/800x500/f8f9fa/6c757d?text=New+Ticket+Form)
*Clean, intuitive form for creating new support tickets with real-time validation*

### Ticket Backlog View
![Backlog View](https://via.placeholder.com/800x500/f8f9fa/6c757d?text=Backlog+View)
*Comprehensive list view with advanced filtering and search capabilities*

### Kanban Board Interface
![Board View](https://via.placeholder.com/800x500/f8f9fa/6c757d?text=Kanban+Board)
*Visual Kanban board with drag-and-drop functionality for status management*

## Quick Start

### Prerequisites
- Node.js (v14.0.0 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/natthaphong010245/Test-Nipa-Technology.git
   cd Test-Nipa-Technology
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure database connection**
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

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Or production mode
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:8000`


## 🔌 API Endpoints

### Tickets
- `GET /tickets` - Retrieve all tickets ( optional filtering)
- `POST /tickets` - Create a new ticket
- `GET /tickets/:id` - Get a specific ticket
- `PUT /tickets/:id` - Update a ticket (typically status changes)

### Query Parameters
- `status` - Filter by ticket status (pending, accepted, resolved, rejected)
- `sortBy` - Sort by field (created_at, updated_at, status, title)
- `order` - Sort order (ASC, DESC)

**Built with ❤️ for NIPA Technology**

*A modern helpdesk solution for efficient ticket management*
