const api = {
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    },

    /**
     * @returns {Promise<*>}
     * On failure throws Error with .status and optional .requestId (from error middleware).
     */
    // requiresAuth: true → 401/403 means "session died, kick to login"
    // login/register also return 401 on bad credentials — must NOT look like session expiry
    async handleResponse(response, { requiresAuth = false } = {}) {
        if (requiresAuth && (response.status === 401 || response.status === 403)) {
            localStorage.removeItem('token');
            window.location.reload();
            const expired = new Error('Session expired. Please log in again.');
            expired.status = response.status;
            throw expired;
        }

        const contentType = response.headers.get('content-type');
        const data = (contentType && contentType.includes('application/json'))
            ? await response.json()
            : null;

        if (!response.ok) {
            const err = new Error(data?.error || data?.message || 'Request failed');
            err.status = response.status;
            if (data?.requestId) err.requestId = data.requestId;
            throw err;
        }
        return data;
    },

    /** User-facing text: 5xx include request id when the server sent one. */
    formatError(err) {
        const status = err?.status;
        const requestId = err?.requestId;
        if (status >= 500 && requestId) {
            return `Something went wrong. Error code: ${requestId}`;
        }
        return err?.message || 'Request failed';
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
