const api = {
    /**
     * Cookies (access + refresh) are HttpOnly — browser sends them; JS never reads them.
     * credentials: 'include' is required on same-origin fetches so Set-Cookie / Cookie work.
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    },

    async tryRefresh() {
        const response = await fetch('/auth/refresh', {
            method: 'POST',
            credentials: 'include',
            headers: this.getHeaders(),
        });
        return response.ok;
    },

    /**
     * @returns {Promise<*>}
     * On failure throws Error with .status and optional .requestId (from error middleware).
     */
    // requiresAuth: true → 401 after failed silent refresh means "session died, kick to login"
    // login/register also return 401 on bad credentials — must NOT look like session expiry
    async handleResponse(response, {
        requiresAuth = false,
        retried = false,
        retry,
        // false for GET /auth/me on page load — otherwise failed refresh → reload loop on the login screen
        reloadOnAuthFailure = true,
    } = {}) {
        if (requiresAuth && response.status === 401 && !retried && typeof retry === 'function') {
            const refreshed = await this.tryRefresh();
            if (refreshed) {
                return retry();
            }
            if (reloadOnAuthFailure) {
                window.location.reload();
            }
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
            credentials: 'include',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password }),
        });
        return await this.handleResponse(response);
    },

    async register(email, password) {
        const response = await fetch('/auth/register', {
            method: 'POST',
            credentials: 'include',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password }),
        });
        return await this.handleResponse(response);
    },

    async me() {
        const doFetch = () =>
            fetch('/auth/me', {
                credentials: 'include',
                headers: this.getHeaders(),
            });
        const response = await doFetch();
        return await this.handleResponse(response, {
            requiresAuth: true,
            reloadOnAuthFailure: false,
            retry: async () =>
                this.handleResponse(await doFetch(), {
                    requiresAuth: true,
                    retried: true,
                    reloadOnAuthFailure: false,
                }),
        });
    },

    async logout() {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: this.getHeaders(),
        });
        // 204 has no JSON body
        if (response.status === 204) {
            return null;
        }
        return await this.handleResponse(response);
    },

    async getNotes() {
        const doFetch = () =>
            fetch('/notes', {
                credentials: 'include',
                headers: this.getHeaders(),
            });
        const response = await doFetch();
        return await this.handleResponse(response, {
            requiresAuth: true,
            retry: async () => this.handleResponse(await doFetch(), { requiresAuth: true, retried: true }),
        });
    },

    async saveNote(id, title, content, tags) {
        const method = id ? 'PUT' : 'POST';
        const url = id ? '/notes/' + id : '/notes';
        const doFetch = () =>
            fetch(url, {
                method,
                credentials: 'include',
                headers: this.getHeaders(),
                body: JSON.stringify({ title, content, tags }),
            });
        const response = await doFetch();
        return await this.handleResponse(response, {
            requiresAuth: true,
            retry: async () => this.handleResponse(await doFetch(), { requiresAuth: true, retried: true }),
        });
    },

    async deleteNote(id) {
        const doFetch = () =>
            fetch('/notes/' + id, {
                method: 'DELETE',
                credentials: 'include',
                headers: this.getHeaders(),
            });
        const response = await doFetch();
        return await this.handleResponse(response, {
            requiresAuth: true,
            retry: async () => this.handleResponse(await doFetch(), { requiresAuth: true, retried: true }),
        });
    },

    async askAI(question, history) {
        const doFetch = () =>
            fetch('/ask', {
                method: 'POST',
                credentials: 'include',
                headers: this.getHeaders(),
                body: JSON.stringify({ question, history }),
            });
        const response = await doFetch();
        return await this.handleResponse(response, {
            requiresAuth: true,
            retry: async () => this.handleResponse(await doFetch(), { requiresAuth: true, retried: true }),
        });
    },
};

window.api = api;
