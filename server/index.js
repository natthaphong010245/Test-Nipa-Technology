// server/index.js

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mysql = require('mysql2/promise')

const app = express()
const port = 8000
let conn = null

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))

// Database connection
const initMySQL = async() => {
    try {
        conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'helpdesk_system',
            port: 3306
        })
        console.log('Database connected successfully')
    } catch (error) {
        console.error('Database connection failed:', error.message)
        process.exit(1)
    }
}

// Backlog tickets (optional filter & sort)
app.get('/tickets', async(req, res) => {
    try {
        if (!conn) throw new Error('Database not connected')

        const { status, sortBy = 'updated_at', order = 'DESC' } = req.query
        let query = 'SELECT * FROM tickets'
        let queryParams = []

        if (status && ['pending', 'accepted', 'resolved', 'rejected'].includes(status)) {
            query += ' WHERE status = ?'
            queryParams.push(status)
        }

        const validSortFields = ['created_at', 'updated_at', 'status', 'title']
        const validOrder = ['ASC', 'DESC']
        if (validSortFields.includes(sortBy) && validOrder.includes(order.toUpperCase())) {
            query += ` ORDER BY ${sortBy} ${order.toUpperCase()}`
        }

        const results = await conn.query(query, queryParams)
        res.json({ success: true, data: results[0], count: results[0].length })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching tickets', error: error.message })
    }
})

// New ticket
app.post('/tickets', async(req, res) => {
    try {
        if (!conn) throw new Error('Database not connected')

        const { title, description, contact_information } = req.body
        if (!title || !description || !contact_information) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, description, contact_information'
            })
        }

        const ticketData = {
            title: title.trim(),
            description: description.trim(),
            contact_information: contact_information.trim(),
            status: 'pending'
        }

        const results = await conn.query('INSERT INTO tickets SET ?', ticketData)
        const newTicket = await conn.query('SELECT * FROM tickets WHERE id = ?', [results[0].insertId])

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: newTicket[0][0]
        })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating ticket', error: error.message })
    }
})

// Get ticket by ID
app.get('/tickets/:id', async(req, res) => {
    try {
        if (!conn) throw new Error('Database not connected')

        const [rows] = await conn.query('SELECT * FROM tickets WHERE id = ?', [req.params.id])
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' })
        }

        res.json({ success: true, data: rows[0] })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching ticket', error: error.message })
    }
})

// Update ticket
app.put('/tickets/:id', async(req, res) => {
    try {
        if (!conn) throw new Error('Database not connected')

        const { title, description, contact_information, status } = req.body
        if (status && !['pending', 'accepted', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: pending, accepted, resolved, or rejected'
            })
        }

        const [rows] = await conn.query('SELECT * FROM tickets WHERE id = ?', [req.params.id])
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' })
        }

        const updateData = {}
        if (title) updateData.title = title.trim()
        if (description) updateData.description = description.trim()
        if (contact_information) updateData.contact_information = contact_information.trim()
        if (status) updateData.status = status

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'No data provided for update' })
        }

        await conn.query('UPDATE tickets SET ? WHERE id = ?', [updateData, req.params.id])
        const [updatedTicket] = await conn.query('SELECT * FROM tickets WHERE id = ?', [req.params.id])

        res.json({ success: true, message: 'Ticket updated successfully', data: updatedTicket[0] })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating ticket', error: error.message })
    }
})

// Ticket stats
app.get('/tickets/stats', async(req, res) => {
    try {
        if (!conn) throw new Error('Database not connected')

        const [results] = await conn.query(`
      SELECT status, COUNT(*) as count
      FROM tickets
      GROUP BY status
    `)

        res.json({ success: true, data: results })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching ticket stats', error: error.message })
    }
})

app.listen(port, async() => {
    try {
        await initMySQL()
        console.log(`Server running at http://localhost:${port}`)
    } catch (error) {
        console.error('Failed to start server:', error.message)
        process.exit(1)
    }
})