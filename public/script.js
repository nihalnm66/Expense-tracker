document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  // ============================================
  //  LOGIC FOR DASHBOARD (dashboard.html)
  // ============================================
  if (window.location.pathname.includes('dashboard.html')) {
    
    // 1. Security Check: If no token, kick user back to login
    if (!token) {
      window.location.href = 'index.html';
      return;
    }

    // 2. Load existing notes immediately
    fetchNotes();

    // 3. Handle "Add Note" button
    const addNoteBtn = document.getElementById('add-note');
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', async () => {
        const text = document.getElementById('note-text').value;
        const amount = document.getElementById('note-amount').value;

        if (!text) return alert('Please enter an item name');

        try {
          const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // MUST send token
            },
            body: JSON.stringify({ text, amount })
          });

          if (res.ok) {
            document.getElementById('note-text').value = '';
            document.getElementById('note-amount').value = '';
            fetchNotes(); // Refresh list
          } else {
            alert('Failed to add note');
          }
        } catch (err) {
          console.error(err);
        }
      });
    }

    // 4. Handle "Summarize" button
    const summarizeBtn = document.getElementById('summarize');
    if (summarizeBtn) {
      summarizeBtn.addEventListener('click', async () => {
        const summaryP = document.getElementById('summary');
        summaryP.textContent = 'Generating summary...';

        try {
          // Note: endpoint is /api/summarize/summarize based on your server.js + ai.js
          const res = await fetch('/api/summarize/summarize', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const data = await res.json();
          summaryP.textContent = data.summary;
        } catch (err) {
          summaryP.textContent = 'Error getting summary';
        }
      });
    }

    // 5. Helper function to fetch and render notes
    async function fetchNotes() {
      try {
        const res = await fetch('/api/notes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const notes = await res.json();

        const list = document.getElementById('notes-list');
        list.innerHTML = ''; // Clear current list

        notes.forEach(note => {
          const li = document.createElement('li');
          li.textContent = `${note.text} - $${note.amount || 0} `;
          
          // Add delete button
          const delBtn = document.createElement('button');
          delBtn.textContent = 'X';
          delBtn.onclick = async () => {
            await fetch(`/api/notes/${note._id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotes(); // Refresh after delete
          };
          
          li.appendChild(delBtn);
          list.appendChild(li);
        });
      } catch (err) {
        console.error('Error loading notes:', err);
      }
    }
  }

  // ============================================
  //  LOGIC FOR LOGIN/SIGNUP (index.html)
  // ============================================
  
  // Logout Logic (Works on any page with a logout button)
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }

  // Login Form Logic
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    // If we are on login page and already have a token, go to dashboard
    if (token) {
      window.location.href = 'dashboard.html';
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html';
      } else {
        document.getElementById('login-message').textContent = data.message;
      }
    });
  }

  // Signup Form Logic
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Success! Please login.');
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
      } else {
        document.getElementById('signup-message').textContent = data.message;
      }
    });

    // Toggles
    document.getElementById('go-signup').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-form').classList.add('hidden');
      document.getElementById('signup-form').classList.remove('hidden');
    });
    
    document.getElementById('go-login').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('signup-form').classList.add('hidden');
      document.getElementById('login-form').classList.remove('hidden');
    });
  }
});