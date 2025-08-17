// index.js

// Configuration
const API_URL = "http://localhost:8000/tickets";
const TOAST_DURATION = 5000;

// Global state
let isLoading = false;
let currentTickets = [];
let draggedTicket = null;
let isUpdatingStatus = false;

// DOM Elements
const navCreate = document.getElementById("navCreate");
const navAll = document.getElementById("navAll");
const navKanban = document.getElementById("navKanban");
const createSection = document.getElementById("createSection");
const allSection = document.getElementById("allSection");
const kanbanSection = document.getElementById("kanbanSection");
const ticketSearch = document.getElementById("ticketSearch");
const statusFilterBtn = document.getElementById("statusFilterBtn");
const statusDropdown = document.getElementById("statusDropdown");
const statusFilterText = document.getElementById("statusFilterText");
const dropdownArrow = document.getElementById("dropdownArrow");
const statusCount = document.getElementById("statusCount");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const ticketListCount = document.getElementById("ticketListCount");
const loadingOverlay = document.getElementById("loadingOverlay");
const toastContainer = document.getElementById("toastContainer");
const ticketForm = document.getElementById("ticketForm");
const submitBtn = document.getElementById("submitBtn");

// Form inputs
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const contactInput = document.getElementById("contact");

// Toast System
class ToastManager {
    static activeToasts = new Map();
    static pendingToasts = new Set();
    static lastToastTime = 0;
    static DEBOUNCE_TIME = 500;

    static show(message, type = 'info', duration = TOAST_DURATION, isHtml = false) {
        const now = Date.now();
        const messageKey = isHtml ? message.replace(/<[^>]*>/g, '') : message;

        if (this.pendingToasts.has(messageKey) || (now - this.lastToastTime < this.DEBOUNCE_TIME && this.activeToasts.has(messageKey))) {
            return null;
        }

        this.pendingToasts.add(messageKey);

        if (this.activeToasts.has(messageKey)) {
            this.remove(this.activeToasts.get(messageKey));
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-message">${isHtml ? message : this.escapeHtml(message)}</div>
                <button class="toast-close" aria-label="Close notification">&times;</button>
            </div>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));

        toastContainer.appendChild(toast);
        this.activeToasts.set(messageKey, toast);
        this.lastToastTime = now;

        setTimeout(() => {
            this.pendingToasts.delete(messageKey);
        }, 100);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            this.remove(toast);
        }, duration);

        return toast;
    }

    static remove(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.remove('show');

        for (let [message, toastElement] of this.activeToasts) {
            if (toastElement === toast) {
                this.activeToasts.delete(message);
                break;
            }
        }

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    static success(message, isHtml = false) { return this.show(message, 'success', TOAST_DURATION, isHtml); }
    static error(message, isHtml = false) { return this.show(message, 'error', TOAST_DURATION, isHtml); }
    static warning(message, isHtml = false) { return this.show(message, 'warning', TOAST_DURATION, isHtml); }
    static info(message, isHtml = false) { return this.show(message, 'info', TOAST_DURATION, isHtml); }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Loading Manager
class LoadingManager {
    static show() {
        isLoading = true;
        loadingOverlay.classList.add('show');
        this.disableInteractiveElements();
    }

    static hide() {
        isLoading = false;
        loadingOverlay.classList.remove('show');
        this.enableInteractiveElements();
    }

    static disableInteractiveElements() {
        navCreate.disabled = true;
        navAll.disabled = true;
        navKanban.disabled = true;
        if (ticketSearch) ticketSearch.disabled = true;
        if (statusFilterBtn) statusFilterBtn.disabled = true;
        if (clearFiltersBtn) clearFiltersBtn.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
    }

    static enableInteractiveElements() {
        navCreate.disabled = false;
        navAll.disabled = false;
        navKanban.disabled = false;
        if (ticketSearch) ticketSearch.disabled = false;
        if (statusFilterBtn) statusFilterBtn.disabled = false;
        if (clearFiltersBtn) clearFiltersBtn.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Form Validation
class FormValidator {
    static validateField(input, rules) {
        const value = input.value.trim();
        const errorElement = document.getElementById(input.id + 'Error');
        let isValid = true;
        let errorMessage = '';

        input.classList.remove('error', 'success');
        errorElement.classList.remove('show');

        if (rules.required && !value) {
            isValid = false;
            errorMessage = `${rules.label} is required.`;
        } else if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `${rules.label} must be at least ${rules.minLength} characters.`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = `${rules.label} cannot exceed ${rules.maxLength} characters.`;
        } else if (rules.type === 'contact' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[\+]?[0-9][\d]{0,15}$/;
            if (!emailRegex.test(value) && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid email address or phone number.';
            }
        }

        if (!isValid) {
            input.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        } else if (value) {
            input.classList.add('success');
        }

        return isValid;
    }

    static validateForm() {
        const titleValid = this.validateField(titleInput, {
            required: true,
            minLength: 3,
            maxLength: 200,
            label: 'Title'
        });

        const descriptionValid = this.validateField(descriptionInput, {
            required: true,
            minLength: 10,
            maxLength: 1000,
            label: 'Description'
        });

        const contactValid = this.validateField(contactInput, {
            required: true,
            maxLength: 100,
            type: 'contact',
            label: 'Contact Information'
        });

        return titleValid && descriptionValid && contactValid;
    }
}

// API Manager
class APIManager {
    static async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success && data.message) {
                throw new Error(data.message);
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Unable to connect to server. Please check your connection.');
            }
            throw error;
        }
    }

    static async createTicket(ticketData) {
        return this.request(API_URL, {
            method: 'POST',
            body: JSON.stringify(ticketData)
        });
    }

    static async getTickets(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        const url = params.toString() ? `${API_URL}?${params}` : API_URL;
        return this.request(url);
    }

    static async updateTicketStatus(id, status) {
        return this.request(`${API_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
}

// Drag and Drop Manager
class DragDropManager {
    static init() {
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(column => {
            column.addEventListener('dragover', this.handleDragOver.bind(this));
            column.addEventListener('drop', this.handleDrop.bind(this));
            column.addEventListener('dragenter', this.handleDragEnter.bind(this));
            column.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });
    }

    static handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    static handleDragEnter(e) {
        e.preventDefault();
        if (e.target.classList.contains('kanban-column') || e.target.closest('.kanban-column')) {
            const column = e.target.classList.contains('kanban-column') ? e.target : e.target.closest('.kanban-column');
            column.classList.add('drag-over');
        }
    }

    static handleDragLeave(e) {
        const column = e.target.classList.contains('kanban-column') ? e.target : e.target.closest('.kanban-column');
        if (column && !column.contains(e.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    }

    static async handleDrop(e) {
        e.preventDefault();
        const column = e.target.classList.contains('kanban-column') ? e.target : e.target.closest('.kanban-column');

        if (column) {
            column.classList.remove('drag-over');

            const newStatus = column.dataset.status;
            const ticketId = parseInt(e.dataTransfer.getData('text/plain'));

            if (draggedTicket && draggedTicket.id === ticketId && draggedTicket.status !== newStatus) {
                try {
                    await updateTicketStatusInKanban(ticketId, newStatus);
                } catch (error) {
                    console.error('Error updating ticket status:', error);
                    ToastManager.error(`Failed to update ticket status: ${error.message}`);
                }
            }
        }

        draggedTicket = null;

        document.querySelectorAll('.kanban-ticket.dragging').forEach(ticket => {
            ticket.classList.remove('dragging');
        });
    }

    static makeTicketDraggable(ticketElement, ticket) {
        ticketElement.draggable = true;
        ticketElement.tabIndex = 0;

        ticketElement.addEventListener('dragstart', (e) => {
            draggedTicket = ticket;
            e.dataTransfer.setData('text/plain', ticket.id.toString());
            e.dataTransfer.effectAllowed = 'move';

            setTimeout(() => {
                ticketElement.classList.add('dragging');
            }, 0);
        });

        ticketElement.addEventListener('dragend', () => {
            ticketElement.classList.remove('dragging');
            document.querySelectorAll('.kanban-column.drag-over').forEach(col => {
                col.classList.remove('drag-over');
            });
        });

        ticketElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showTicketMoveDialog(ticket);
            }
        });
    }
}

// Navigation
function showCreateSection() {
    hideAllSections();
    createSection.classList.remove("hidden");
    setActiveNavTab(navCreate);
    titleInput.focus();
}

function showAllSection() {
    hideAllSections();
    allSection.classList.remove("hidden");
    setActiveNavTab(navAll);
    loadTickets();
}

function showKanbanSection() {
    hideAllSections();
    kanbanSection.classList.remove("hidden");
    setActiveNavTab(navKanban);
    loadKanbanTickets();
}

function hideAllSections() {
    createSection.classList.add("hidden");
    allSection.classList.add("hidden");
    kanbanSection.classList.add("hidden");
}

function setActiveNavTab(activeTab) {
    [navCreate, navAll, navKanban].forEach(tab => tab.classList.remove("active"));
    activeTab.classList.add("active");
}

// Filter Management
class FilterManager {
    static getSelectedStatuses() {
        const checkboxes = document.querySelectorAll('.status-option input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    static updateStatusFilterText() {
        const selectedStatuses = this.getSelectedStatuses();

        if (statusFilterText) {
            statusFilterText.textContent = 'Status';
        }

        if (selectedStatuses.length > 0) {
            if (statusCount) {
                statusCount.textContent = selectedStatuses.length;
                statusCount.classList.remove('hidden');
            }
            if (dropdownArrow) {
                dropdownArrow.classList.add('hidden');
            }

            if (statusFilterBtn) {
                statusFilterBtn.classList.add('has-filters');
            }
        } else {
            if (dropdownArrow) {
                dropdownArrow.classList.remove('hidden');
            }
            if (statusCount) {
                statusCount.classList.add('hidden');
            }

            if (statusFilterBtn) {
                statusFilterBtn.classList.remove('has-filters');
            }
        }
    }

    static clearAllFilters() {
        const checkboxes = document.querySelectorAll('.status-option input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        if (ticketSearch) {
            ticketSearch.value = '';
        }

        this.closeDropdown();

        // Reset to default state: show arrow, hide count
        if (statusFilterText) {
            statusFilterText.textContent = 'Status';
        }
        if (dropdownArrow) {
            dropdownArrow.classList.remove('hidden');
        }
        if (statusCount) {
            statusCount.classList.add('hidden');
        }
        if (statusFilterBtn) {
            statusFilterBtn.classList.remove('has-filters');
        }

        loadTickets();
    }

    static setupTicketSearch() {
        if (!ticketSearch) return;

        ticketSearch.addEventListener('input', (e) => {
            loadTickets();
        });
    }

    static setupStatusDropdown() {
        if (!statusFilterBtn || !statusDropdown) return;

        statusFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !statusDropdown.classList.contains('hidden');
            if (isOpen) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        });

        document.addEventListener('click', (e) => {
            if (!statusDropdown.contains(e.target) && !statusFilterBtn.contains(e.target)) {
                this.closeDropdown();
            }
        });

        statusDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        const checkboxes = document.querySelectorAll('.status-option input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateStatusFilterText();
                loadTickets();
            });
        });
    }

    static openDropdown() {
        if (statusDropdown) {
            statusDropdown.classList.remove('hidden');
        }
    }

    static closeDropdown() {
        if (statusDropdown) {
            statusDropdown.classList.add('hidden');
        }
    }

    static getSearchQuery() {
        return ticketSearch ? ticketSearch.value.trim().toLowerCase() : '';
    }

    static filterTicketsBySearch(tickets) {
        const searchQuery = this.getSearchQuery();
        if (!searchQuery) return tickets;

        return tickets.filter(ticket =>
            ticket.title.toLowerCase().includes(searchQuery)
        );
    }
}
// Ticket Loading for List View
async function loadTickets() {
    const ticketsContainer = document.getElementById("tickets");

    if (ticketListCount) {
        ticketListCount.textContent = '0';
    }

    ticketsContainer.innerHTML = `
        <div class="ticket-loading">
            <div class="spinner"></div>
            <span>Loading tickets...</span>
        </div>
    `;

    try {
        const response = await APIManager.getTickets();
        let allTickets = response.data || [];

        const selectedStatuses = FilterManager.getSelectedStatuses();
        if (selectedStatuses.length > 0) {
            allTickets = allTickets.filter(ticket => selectedStatuses.includes(ticket.status));
        }

        allTickets = FilterManager.filterTicketsBySearch(allTickets);

        currentTickets = allTickets.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        displayTickets(currentTickets);

        if (currentTickets.length > 0 && !isUpdatingStatus) {
            setTimeout(() => {
                ToastManager.success(`Loaded ${currentTickets.length} tickets`);
            }, 200);
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        ToastManager.error(`Failed to load tickets: ${error.message}`);
        displayError('Failed to load tickets. Please try again.');
    }
}

// Board Functions
async function loadKanbanTickets() {
    try {
        const response = await APIManager.getTickets();
        currentTickets = response.data || [];
        displayKanbanTickets(currentTickets);

        if (currentTickets.length > 0) {
            ToastManager.success(`Loaded ${currentTickets.length} tickets`);
        }
    } catch (error) {
        console.error('Error loading kanban tickets:', error);
        ToastManager.error(`Failed to load tickets: ${error.message}`);
    }
}

function displayKanbanTickets(tickets) {
    const statusColumns = {
        pending: document.getElementById('pending-tickets'),
        accepted: document.getElementById('accepted-tickets'),
        resolved: document.getElementById('resolved-tickets'),
        rejected: document.getElementById('rejected-tickets')
    };

    const statusCounts = {
        pending: 0,
        accepted: 0,
        resolved: 0,
        rejected: 0
    };

    Object.values(statusColumns).forEach(column => {
        column.innerHTML = '';
    });

    tickets.forEach(ticket => {
        if (statusColumns[ticket.status]) {
            const ticketElement = createKanbanTicket(ticket);
            statusColumns[ticket.status].appendChild(ticketElement);
            statusCounts[ticket.status]++;
        }
    });

    Object.keys(statusCounts).forEach(status => {
        const countElement = document.getElementById(`${status}-count`);
        if (countElement) {
            countElement.textContent = statusCounts[status];
        }
    });

    DragDropManager.init();
}

function createKanbanTicket(ticket) {
    const ticketElement = document.createElement('div');
    ticketElement.className = 'kanban-ticket';
    ticketElement.dataset.ticketId = ticket.id;

    ticketElement.innerHTML = `
        <div class="kanban-ticket-title">${escapeHtml(ticket.title)}</div>
        <div class="kanban-ticket-description">${escapeHtml(ticket.description)}</div>
        <div class="kanban-ticket-contact">
            <strong>Contact:</strong> ${escapeHtml(ticket.contact_information)}
        </div>
        <div class="kanban-ticket-footer">
            <div class="kanban-ticket-dates">
                <div class="kanban-ticket-date">Created ${formatDate(ticket.created_at)}</div>
                <div class="kanban-ticket-date">Updated ${formatDate(ticket.updated_at)}</div>
            </div>
            <div class="kanban-ticket-id">#${ticket.id}</div>
        </div>
    `;

    DragDropManager.makeTicketDraggable(ticketElement, ticket);

    return ticketElement;
}

async function updateTicketStatusInKanban(ticketId, newStatus) {
    if (isUpdatingStatus) {
        return;
    }

    isUpdatingStatus = true;

    try {
        await APIManager.updateTicketStatus(ticketId, newStatus);

        const ticket = currentTickets.find(t => t.id === ticketId);
        if (ticket) {
            const oldStatus = ticket.status;
            ticket.status = newStatus;
            ticket.updated_at = new Date().toISOString();

            const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
            if (ticketElement) {
                const newColumn = document.getElementById(`${newStatus}-tickets`);
                if (newColumn) {
                    newColumn.appendChild(ticketElement);

                    updateKanbanCounts(oldStatus, newStatus);

                    const datesElement = ticketElement.querySelector('.kanban-ticket-dates');
                    if (datesElement) {
                        datesElement.innerHTML = `
                            <div class="kanban-ticket-date">Created ${formatDate(ticket.created_at)}</div>
                            <div class="kanban-ticket-date">Updated ${formatDate(ticket.updated_at)}</div>
                        `;
                    }
                }
            }

            const escapedTitle = ToastManager.escapeHtml(ticket.title);
            ToastManager.success(`${escapedTitle} moved to <strong>${newStatus}</strong>`, true);
        }
    } catch (error) {
        throw error;
    } finally {
        setTimeout(() => {
            isUpdatingStatus = false;
        }, 100);
    }
}

function updateKanbanCounts(oldStatus, newStatus) {
    const oldCountElement = document.getElementById(`${oldStatus}-count`);
    const newCountElement = document.getElementById(`${newStatus}-count`);

    if (oldCountElement) {
        const oldCount = parseInt(oldCountElement.textContent) - 1;
        oldCountElement.textContent = Math.max(0, oldCount);
    }

    if (newCountElement) {
        const newCount = parseInt(newCountElement.textContent) + 1;
        newCountElement.textContent = newCount;
    }
}

function showTicketMoveDialog(ticket) {
    const statuses = ['pending', 'accepted', 'resolved', 'rejected'];
    const currentStatus = ticket.status;
    const otherStatuses = statuses.filter(s => s !== currentStatus);

    const message = `Move ticket "${ticket.title}" to:\n${otherStatuses.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    const choice = prompt(message + '\nEnter number (1-3):');
    
    if (choice && choice >= 1 && choice <= 3) {
        const newStatus = otherStatuses[choice - 1];
        updateTicketStatusInKanban(ticket.id, newStatus);
    }
}

function displayTickets(tickets) {
    const ticketsContainer = document.getElementById("tickets");
    
    if (ticketListCount) {
        ticketListCount.textContent = tickets.length;
    }

    if (tickets.length === 0) {
        ticketsContainer.innerHTML = `
            <div class="no-tickets">
                <div class="empty-state">
                    <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <div>No tickets found</div>
                    <div style="font-size: 14px; opacity: 0.7;">Try adjusting your filters or create a new ticket</div>
                </div>
            </div>
        `;
        return;
    }

    ticketsContainer.innerHTML = tickets.map((ticket, index) => `
        <div class="ticket-item" style="animation-delay: ${index * 0.1}s">
            <div class="ticket-header">
                <div class="ticket-content">
                    <div class="ticket-title">${escapeHtml(ticket.title)}</div>
                    <div class="ticket-description">${escapeHtml(ticket.description)}</div>
                    <div class="ticket-contact">
                        <strong>Contact:</strong> ${escapeHtml(ticket.contact_information)}
                    </div>
                </div>
                <div class="ticket-status-section">
                    <select 
                        class="status-dropdown" 
                        onchange="updateTicketStatus(${ticket.id}, this.value)"
                        aria-label="Update ticket status"
                    >
                        <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="accepted" ${ticket.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                        <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="rejected" ${ticket.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </div>
            </div>
            
            <div class="ticket-footer">
                <div class="ticket-timestamps">
                    <span><strong>Created</strong> ${formatDate(ticket.created_at)}</span>
                    <span><strong>Updated</strong> ${formatDate(ticket.updated_at)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function displayError(message) {
    const ticketsContainer = document.getElementById("tickets");
    
    if (ticketListCount) {
        ticketListCount.textContent = '0';
    }
    
    ticketsContainer.innerHTML = `
        <div class="no-tickets">
            <div class="empty-state">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <div style="color: #ef4444;">${message}</div>
                <button onclick="loadTickets()" class="submit-btn" style="margin-top: 15px;">
                    Try Again
                </button>
            </div>
        </div>
    `;
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();

    if (!FormValidator.validateForm()) {
        ToastManager.warning('Please correct the errors and try again.');
        return;
    }

    LoadingManager.show();

    try {
        const ticketData = {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            contact_information: contactInput.value.trim()
        };

        const response = await APIManager.createTicket(ticketData);

        ToastManager.success('Ticket created successfully!');
        ticketForm.reset();

        [titleInput, descriptionInput, contactInput].forEach(input => {
            input.classList.remove('error', 'success');
            const errorElement = document.getElementById(input.id + 'Error');
            errorElement.classList.remove('show');
        });

        submitBtn.textContent = 'Created!';
        setTimeout(() => {
            submitBtn.innerHTML = `
                <span class="btn-text">Create Ticket</span>
                <div class="btn-loading">
                    <div class="spinner"></div>
                </div>
            `;
        }, 2000);

    } catch (error) {
        console.error('Error creating ticket:', error);
        ToastManager.error(`Failed to create ticket: ${error.message}`);
    } finally {
        LoadingManager.hide();
    }
}

// Update Ticket Status
async function updateTicketStatus(id, status) {
    if (isUpdatingStatus) {
        return;
    }
    
    const dropdown = event.target;
    const originalValue = dropdown.dataset.originalValue || dropdown.value;

    dropdown.disabled = true;
    dropdown.dataset.originalValue = originalValue;
    isUpdatingStatus = true;

    try {
        await APIManager.updateTicketStatus(id, status);
        
        const ticket = currentTickets.find(t => t.id === id);
        if (ticket) {
            ticket.status = status;
            ticket.updated_at = new Date().toISOString();
            
            const escapedTitle = ToastManager.escapeHtml(ticket.title);
            ToastManager.success(`${escapedTitle} moved to <strong>${status}</strong>`, true);
        } else {
            ToastManager.success(`Ticket status updated to ${status}`);
        }

        dropdown.dataset.originalValue = status;

    } catch (error) {
        console.error('Error updating status:', error);
        ToastManager.error(`Failed to update status: ${error.message}`);

        dropdown.value = originalValue;
    } finally {
        dropdown.disabled = false;
        setTimeout(() => {
            isUpdatingStatus = false;
        }, 100);
    }
}

// Event Listeners
navCreate.addEventListener("click", showCreateSection);
navAll.addEventListener("click", showAllSection);
navKanban.addEventListener("click", showKanbanSection);
ticketForm.addEventListener("submit", handleFormSubmit);

// Filter event listeners
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => FilterManager.clearAllFilters());
}

// Real-time validation
titleInput.addEventListener('blur', () => {
    FormValidator.validateField(titleInput, {
        required: true,
        minLength: 3,
        maxLength: 200,
        label: 'Title'
    });
});

descriptionInput.addEventListener('blur', () => {
    FormValidator.validateField(descriptionInput, {
        required: true,
        minLength: 10,
        maxLength: 1000,
        label: 'Description'
    });
});

contactInput.addEventListener('blur', () => {
    FormValidator.validateField(contactInput, {
        required: true,
        maxLength: 100,
        type: 'contact',
        label: 'Contact Information'
    });
});

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const dateStr = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
        
        const timeStr = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
        
        return `${dateStr} at ${timeStr}`;
    } catch (error) {
        return dateString;
    }
}

function formatDateShort(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric'
        }).format(date);
    } catch (error) {
        return dateString;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    titleInput.focus();
    DragDropManager.init();
    
    FilterManager.setupTicketSearch();
    FilterManager.setupStatusDropdown();
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    ToastManager.error('An unexpected error occurred. Please try again.');
});

window.updateTicketStatus = updateTicketStatus;