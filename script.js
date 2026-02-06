import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildRemoved, serverTimestamp, get, child, remove, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKOq326tL8Kh1hraa_R0bV0MvYMUZotfk",
  authDomain: "realtime-database-3505d.firebaseapp.com",
  projectId: "realtime-database-3505d",
  storageBucket: "realtime-database-3505d.firebasestorage.app",
  messagingSenderId: "917293518076",
  appId: "1:917293518076:web:1cd71d04e6a37af7afdb79",
  measurementId: "G-K7EJSZM8L2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'messages');
const usersRef = ref(db, 'users');

const overlay = document.getElementById('registration-overlay');
const nameError = document.getElementById('name-error');
const adminBar = document.getElementById('admin-bar');
const chatBox = document.getElementById('chat-box');

let username = localStorage.getItem('chat_user_name');

// --- 1. Admin Visibility ---
const checkAdmin = (name) => {
    if (name === "stein") adminBar.style.display = "flex";
};

// --- 2. Registration Logic (Unique Names) ---
if (!username) {
    overlay.style.display = 'flex';
} else {
    document.getElementById('display-name').innerText = username + ":";
    checkAdmin(username);
}

document.getElementById('save-name-btn').addEventListener('click', async () => {
    const inputName = document.getElementById('reg-username').value.trim().toLowerCase();
    if (!inputName) return;

    // Check if name is taken in Firebase
    const snapshot = await get(child(usersRef, inputName));
    
    if (snapshot.exists() && inputName !== "stein") {
        nameError.style.display = "block";
    } else {
        // Claim the name
        await set(child(usersRef, inputName), { active: true });
        localStorage.setItem('chat_user_name', inputName);
        username = inputName;
        document.getElementById('display-name').innerText = username + ":";
        overlay.style.display = 'none';
        checkAdmin(username);
    }
});

// --- 3. Chat & Admin Controls ---
document.getElementById('message-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('message-input').value;
    push(messagesRef, { username, text: msg, time: serverTimestamp() });
    document.getElementById('message-input').value = '';
});

// Admin: Clear All
document.getElementById('clear-history').addEventListener('click', () => {
    if (confirm("Delete everything?")) remove(messagesRef);
});

// Receive Messages
onChildAdded(messagesRef, (snapshot) => {
    const data = snapshot.val();
    const key = snapshot.key;
    const div = document.createElement('div');
    div.className = 'message';
    div.id = `msg-${key}`;
    
    let deleteHTML = (username === "stein") ? `<button class="del-btn" onclick="window.deleteMsg('${key}')">DELETE</button>` : "";
    
    div.innerHTML = `<b>${data.username}:</b> ${data.text} ${deleteHTML}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Remove deleted messages from UI instantly
onChildRemoved(messagesRef, (snapshot) => {
    const el = document.getElementById(`msg-${snapshot.key}`);
    if (el) el.remove();
});

// Expose delete function to window for the button click
window.deleteMsg = (key) => {
    remove(ref(db, `messages/${key}`));
};
