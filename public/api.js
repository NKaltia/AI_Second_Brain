const api = {
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    },

    async handleResponse(response) {
        if (response.status === 401 || response.status === 403) {
            // Auto-logout triggers here globally for all requests
            localStorage.removeItem('token');
            window.location.reload(); 
            throw new Error("Session expired. Please log in again.");
        }
        
        // Handles standard parsing
        const contentType = response.headers.get("content-type");
        const data = (contentType && contentType.includes("application/json")) 
            ? await response.json() 
            : null;
            
        if (!response.ok) throw new Error(data?.error || data?.message || "Request failed");
        return data;
    },

    async login(email, password) {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await this.handleResponse(response);
    },

    async register(email, password) {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await this.handleResponse(response);
    },

    async getNotes() {
        const response = await fetch('/notes', { headers: this.getHeaders() });
        return await this.handleResponse(response);
    },

    async saveNote(id, title, content, tags) {
        const method = id ? 'PUT' : 'POST';
        const url = id ? '/notes/' + id : '/notes';
        const response = await fetch(url, {
            method,
            headers: this.getHeaders(),
            body: JSON.stringify({ title, content, tags })
        });
        return await this.handleResponse(response);
    },

    async deleteNote(id) {
        const response = await fetch('/notes/' + id, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return await this.handleResponse(response);
    },

    async askAI(question, history) {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ question, history })
        });
        return await this.handleResponse(response);
    }
};

window.api = api;
