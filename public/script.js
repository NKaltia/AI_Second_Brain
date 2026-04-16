const addNoteBtn = document.getElementById("add-note-btn");
const inputField = document.getElementById('user-input');
const askBtn = document.getElementById('ask-btn');
const chatHistory = document.getElementById('chat-history');
const modalOverlay = document.getElementById('note-modal');
const modalTitleInput = document.getElementById('modal-title');
const modalTextarea = document.getElementById('modal-textarea');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalSaveBtn = document.getElementById('modal-save-btn');
const addTagBtn = document.getElementById('add-tag-btn');
const tagDropdown = document.getElementById('tag-dropdown');
const newTagInput = document.getElementById('new-tag-input');
const modalTagsContainer = document.getElementById('modal-tags-container');
const confirmModal = document.getElementById('confirm-modal');
const confirmOkBtn = document.getElementById('confirm-ok-btn');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

const authModal = document.getElementById('auth-modal');
const authTitle = document.getElementById('auth-title');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const authActionButton = document.getElementById('auth-action-btn');
const authSwitchButton = document.getElementById('auth-switch-btn');

let isLoginMode = true;

let currentEditingTags = [];
let currentEditingNoteId = null;

let chatHistoryContext = [];
let noteToDeleteId = null;

function showConfirmModal() {
    confirmModal.classList.remove('hidden');
}

function hideConfirmModal() {
    confirmModal.classList.add('hidden');
    noteToDeleteId = null;
}

function renderModalTags() {
    document.querySelectorAll('.tag-chip').forEach(chip => chip.remove());

    currentEditingTags.forEach(tag => {
        const chip = document.createElement('div');
        chip.className = 'tag-chip';
        chip.innerText = tag;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-tag';
        removeBtn.innerText = '×';
        removeBtn.onclick = () => {
            currentEditingTags = currentEditingTags.filter(t => t !== tag);
            renderModalTags();
        };
        chip.appendChild(removeBtn);
        modalTagsContainer.insertBefore(chip, addTagBtn);
    });
}

function openModal(note = null) {
    if (note) {
        currentEditingNoteId = note.id;
        modalTitleInput.value = note.title;
        modalTextarea.value = note.content;
        currentEditingTags = note.tags || [];
    } else {
        currentEditingNoteId = null;
        modalTitleInput.value = "";
        modalTextarea.value = "";
        currentEditingTags = [];
    }

    renderModalTags();
    newTagInput.value = '';
    tagDropdown.classList.add('hidden');
    modalOverlay.classList.remove('hidden');
}

function addMessageToChat(text, senderClass, sources = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `${senderClass}`;
    if (senderClass === 'ai-message') {
        msgDiv.innerHTML = marked.parse(text);

        if (sources && sources.length > 0) {
            const sourcesDiv = document.createElement('div');
            sourcesDiv.className = 'sources-container';

            sources.forEach(note => {
                const btn = document.createElement('button');
                btn.className = 'citation-chip';
                btn.innerText = `${note.title.length > 20 ? note.title.substring(0, 20) + '...' : note.title}`;
                btn.title = note.title;

                btn.addEventListener('click', () => {
                    openModal(note);
                });
                sourcesDiv.appendChild(btn);
            });
            msgDiv.appendChild(sourcesDiv);
        }
    } else {
        msgDiv.innerText = text;
    }
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function loadNotes() {
    try {
        const response = await fetch('/notes', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            console.error('Network error');
            return;
        }
        const notesArray = await response.json();
        const notesContainer = document.getElementById('notes-list');
        notesContainer.innerHTML = '';

        notesArray.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.addEventListener('click', () => {
                openModal(note);
            });
            noteCard.className = 'note-card';
            noteCard.innerHTML = `
            <button class="delete-btn">✖</button>
            <h3 style="margin-top:0;margin-bottom:5px;">${note.title}</h3>
            <p class="note-preview">${note.content.split('\n')[0]}</p>
            <small>${new Date(note.createdAt).toLocaleString()}</small>`;

            const deleteBtn = noteCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                noteToDeleteId = note.id;
                showConfirmModal();
            });

            notesContainer.appendChild(noteCard);
        });
    } catch (err) {
        console.error("Error loading notes:", err);
    }
}

inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        askBtn.click();
    }
});

inputField.addEventListener('input', () => {
    inputField.style.height = 'auto';
    inputField.style.height = inputField.scrollHeight + 'px';

    if (inputField.scrollHeight >= 150) {
        inputField.style.overflowY = 'auto';
    } else {
        inputField.style.overflowY = 'hidden';
    }
});

addNoteBtn.addEventListener('click', () => {
    openModal();
});

askBtn.addEventListener('click', async () => {
    const text = inputField.value;

    if (!text) return;

    inputField.value = '';
    inputField.style.overflowY = 'hidden';
    inputField.style.height = 'auto';
    addMessageToChat(text, 'user-message');

    askBtn.innerHTML = "Thinking...";
    askBtn.disabled = true;

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ question: text, history: chatHistoryContext })
        });
        if (response.ok) {
            const data = await response.json();
            if (data.newNoteSaved) loadNotes();
            addMessageToChat(data.answer, 'ai-message', data.sources);
            chatHistoryContext.push({ role: 'user', content: text });
            chatHistoryContext.push({ role: 'model', content: data.answer });

            if (chatHistoryContext.length > 20) chatHistoryContext = chatHistoryContext.slice(-10);
        } else {
            addMessageToChat("Error, ai-message");
            chatHistoryContext.pop();
        }

    } catch (err) {
        addMessageToChat("Error, ai-message");
    } finally {
        askBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
            </svg>
        `;
        askBtn.disabled = false;
    }
});

modalCloseBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
    currentEditingNoteId = null;
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.add('hidden');
        currentEditingNoteId = null;
    }
});

modalSaveBtn.addEventListener('click', async () => {
    modalSaveBtn.innerText = "Saving...";
    modalSaveBtn.disabled = true;

    const newContent = modalTextarea.value;
    const newTitle = modalTitleInput.value;

    // Auto-save pending tag if user forgot to press Enter
    const pendingTag = newTagInput.value.trim().toLowerCase();
    if (pendingTag && !currentEditingTags.includes(pendingTag)) {
        currentEditingTags.push(pendingTag);
        newTagInput.value = '';
    }

    if (!newContent || !newTitle) {
        alert("Title and content can't be empty");
        modalSaveBtn.innerText = "Save";
        modalSaveBtn.disabled = false;
        return;
    }

    try {
        const method = currentEditingNoteId ? 'PUT' : 'POST';
        const url = currentEditingNoteId ? '/notes/' + currentEditingNoteId : '/notes';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content: newContent, title: newTitle, tags: currentEditingTags })
        });

        if (response.ok) {
            modalOverlay.classList.add('hidden');
            currentEditingNoteId = null;
            loadNotes();
        } else {
            alert("Failed to save note");
        }
    } catch (err) {
        console.log(err);
    } finally {
        modalSaveBtn.innerText = "Save";
        modalSaveBtn.disabled = false;
    }
});

addTagBtn.addEventListener('click', (e) => {
    e.preventDefault();
    tagDropdown.classList.toggle('hidden');

    if (!tagDropdown.classList.contains('hidden')) newTagInput.focus();
});

newTagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const newTag = newTagInput.value.trim().toLowerCase();
        if (newTag && !currentEditingTags.includes(newTag)) {
            currentEditingTags.push(newTag);
            newTagInput.value = '';
            tagDropdown.classList.add('hidden');
            renderModalTags();
        }
    }
});

tagDropdown.addEventListener('click', (e) => {
    if (e.target.classList.contains('dropdown-tag')) {
        const newTag = e.target.innerText;
        if (!currentEditingTags.includes(newTag)) {
            currentEditingTags.push(newTag);
            newTagInput.value = '';
            tagDropdown.classList.add('hidden');
            renderModalTags();
        }
    }
});

confirmCancelBtn.addEventListener('click', hideConfirmModal);
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) hideConfirmModal();
});

confirmOkBtn.addEventListener('click', async () => {
    if (noteToDeleteId) {
        try {
            await fetch('/notes/' + noteToDeleteId, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            hideConfirmModal();
            loadNotes();
        } catch (err) {
            console.error("Failed to delete note:", err);
        }
    }
});

authSwitchButton.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? 'Log in' : 'Sign Up';

    if (isLoginMode) {
        authActionButton.textContent = 'Log in';
        authSwitchButton.textContent = 'Register';
    }
    else {
        authActionButton.textContent = 'Sign Up';
        authSwitchButton.textContent = 'Already have an account? Log in';
    }
});

authActionButton.addEventListener('click', async () => {
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value.trim();

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            if (isLoginMode) {
                localStorage.setItem('token', data.token);
                checkAuth();
            } else {
                alert("Registration successful! Please log in.");
                authSwitchButton.click();
            }
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error("Auth error:", err);
        alert("An error occurred during authentication");
    }
});


function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        authModal.classList.add('hidden');
        loadNotes();
    }
    else {
        authModal.classList.remove('hidden');
    }
}

checkAuth();