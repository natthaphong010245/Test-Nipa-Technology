# 🎫 Helpdesk Ticket Management System

A modern, responsive web-based helpdesk ticket management system built with Node.js, Express, and MySQL. Features a clean interface with both list and Kanban board views for efficient ticket management.

## ✨ Features

### 📝 Ticket Management
- **Create New Tickets** - Simple form with validation for title, description, and contact information
- **Status Tracking** - Four status levels: Pending, Accepted, Resolved, Rejected
- **Real-time Updates** - Instant status changes with visual feedback
- **Comprehensive Validation** - Client-side and server-side validation

### 📊 Multiple Views
- **List View** - Traditional table-style ticket listing with filtering and search
- **Kanban Board** - Drag-and-drop interface for visual ticket management
- **Advanced Filtering** - Filter by status, search by title

### 🎨 User Experience
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Toast Notifications** - Real-time feedback for all actions
- **Loading States** - Smooth loading indicators and animations
- **Accessibility** - WCAG compliant with proper ARIA labels and keyboard navigation

### 🔧 Technical Features
- **RESTful API** - Clean API endpoints for all ticket operations
- **MySQL Database** - Reliable data storage with proper indexing
- **Error Handling** - Comprehensive error handling and user feedback
- **Input Sanitization** - XSS protection and data validation

## 📸 Screenshots

### New Ticket Creation
![New Ticket Form](https://via.placeholder.com/800x500/f8f9fa/6c757d?text=New+Ticket+Form)
*Clean, intuitive form for creating new support tickets with real-time validation*

### Ticket Backlog View
![Backlog View](https://via.placeholder.com/800x500/f8f9fa/6c757d?text=Backlog+View)
*Comprehensive list view with advanced filtering and search capabilities*

### Kanban Board Interface
![Board View](https://via.placeholder.com/800x500/f8f9fa/6c757d?text=Kanban+Board)
*Visual Kanban board with drag-and-drop functionality for status management*

## 🚀 Quick Start

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

3. **Set up the database**
   ```bash
   # Create database and tables
   mysql -u root -p < db.sql
   ```

4. **Configure database connection**
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

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Or production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:8000`

## 📁 Project Structure

```
Test-Nipa-Technology/
├── server/
│   └── index.js          # Express server and API routes
├── index.html            # Main HTML file
├── index.js              # Frontend JavaScript
├── style.css             # Styling and responsive design
├── db.sql                # Database schema
├── package.json          # Project dependencies
└── README.md             # This file
```

## 🔌 API Endpoints

### Tickets
- `GET /tickets` - Retrieve all tickets (with optional filtering)
- `POST /tickets` - Create a new ticket
- `GET /tickets/:id` - Get a specific ticket
- `PUT /tickets/:id` - Update a ticket (typically status changes)

### Query Parameters
- `status` - Filter by ticket status (pending, accepted, resolved, rejected)
- `sortBy` - Sort by field (created_at, updated_at, status, title)
- `order` - Sort order (ASC, DESC)

### Example API Usage

```javascript
// Create a new ticket
POST /tickets
{
  "title": "ปัญหาการเข้าสู่ระบบ",
  "description": "ไม่สามารถเข้าสู่ระบบได้ เกิด error 500",
  "contact_information": "user1@example.com"
}

// Update ticket status
PUT /tickets/1
{
  "status": "accepted"
}

// Get filtered tickets
GET /tickets?status=pending&sortBy=created_at&order=DESC
```

## 🎨 Features Highlight

### Drag & Drop Kanban Board
- เลื่อนตั๋วระหว่าง columns ได้แบบ real-time
- อัพเดท status อัตโนมัติเมื่อลาก
- แสดงการแจ้งเตือนเมื่อเปลี่ยนสถานะ

### Advanced Filtering System
- ค้นหาตั๋วตาม title
- กรองตาม status หลายแบบพร้อมกัน
- เรียงลำดับตามวันที่หรือสถานะ

### Real-time Toast Notifications
- แจ้งเตือนเมื่อสร้างตั๋วใหม่
- แสดงผลลัพธ์การอัพเดท status
- ระบบแจ้งเตือน error ที่เข้าใจง่าย

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm test` - Run connection tests

### Technology Stack
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Features**: RESTful API, Responsive Design, Drag & Drop

## 🔒 Security Features

- **Input Validation** - ตรวจสอบข้อมูลทั้งฝั่ง client และ server
- **XSS Prevention** - ป้องกัน Cross-site scripting
- **SQL Injection Protection** - ใช้ Parameterized queries
- **CORS Configuration** - จัดการ cross-origin requests อย่างปลอดภัย

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

หากพบปัญหาหรือมีคำถาม:

1. ตรวจสอบที่ [Issues](https://github.com/natthaphong010245/Test-Nipa-Technology/issues)
2. สร้าง issue ใหม่พร้อมรายละเอียด
3. แนบ screenshots และ error messages ด้วย

## 🔮 Future Enhancements

- [ ] ระบบแจ้งเตือนทาง Email
- [ ] รองรับการแนบไฟล์
- [ ] ระบบ Authentication และ User roles
- [ ] Dashboard สำหรับรายงาน
- [ ] Mobile app
- [ ] Integration กับ external services
- [ ] Auto-assignment ตั๋ว
- [ ] SLA tracking และ alerts

---

**Built with ❤️ for NIPA Technology**

*A modern helpdesk solution for efficient ticket management*
