const api = {
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    },

    // requiresAuth: true → 401/403 means "session died, kick to login"
    // login/register also return 401 on bad credentials — must NOT look like session expiry
    async handleResponse(response, { requiresAuth = false } = {}) {
        if (requiresAuth && (response.status === 401 || response.status === 403)) {
            localStorage.removeItem('token');
            window.location.reload();
            throw new Error('Session expired. Please log in again.');
        }

        const contentType = response.headers.get('content-type');
        const data = (contentType && contentType.includes('application/json'))
            ? await response.json()
            : null;

        if (!response.ok) throw new Error(data?.error || data?.message || 'Request failed');
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
        return await this.handleResponse(response, { requiresAuth: true });
    },

    async saveNote(id, title, content, tags) {
        const method = id ? 'PUT' : 'POST';
        const url = id ? '/notes/' + id : '/notes';
        const response = await fetch(url, {
            method,
            headers: this.getHeaders(),
            body: JSON.stringify({ title, content, tags })
        });
        return await this.handleResponse(response, { requiresAuth: true });
    },

    async deleteNote(id) {
        const response = await fetch('/notes/' + id, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return await this.handleResponse(response, { requiresAuth: true });
    },

    async askAI(question, history) {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ question, history })
        });
        return await this.handleResponse(response, { requiresAuth: true });
    }
};

window.api = api;
