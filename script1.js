// Scramble Generator
const moves = ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2', 'M', 'M\'', 'M2', 'E', 'E\'', 'E2', 'S', 'S\'', 'S2'];

function generateScramble() {
    const scrambleLength = 25;
    const scramble = [];
    let lastMove = '';
    
    for (let i = 0; i < scrambleLength; i++) {
        let move;
        do {
            move = moves[Math.floor(Math.random() * moves.length)];
        } while (move.charAt(0) === lastMove.charAt(0) || (lastMove && move === lastMove));
        
        scramble.push(move);
        lastMove = move;
    }
    
    return scramble.join(' ');
}

// Timer State
let timerState = {
    running: false,
    time: 0,
    startTime: 0,
    inspection: true,
    spacebarPressed: false,
    spacebarPressedTime: 0,
    inspectionTime: 0,
    times: [],
    lastScramble: ''
};

let currentUser = null;

// Get current scramble
function getCurrentScramble() {
    return document.getElementById('scramble').textContent;
}

// DOM Elements
const timerDisplay = document.getElementById('timerDisplay');
const timerHint = document.getElementById('timerHint');
const timerStatus = document.getElementById('timerStatus');
const scrambleText = document.getElementById('scramble');
const newScrambleBtn = document.getElementById('newScrambleBtn');
const wcaInspection = document.getElementById('wcaInspection');
const timesList = document.getElementById('timesList');
const bestTimeEl = document.getElementById('bestTime');
const worstTimeEl = document.getElementById('worstTime');
const ao5El = document.getElementById('ao5');
const solveCountEl = document.getElementById('solveCount');

// Initialize
window.addEventListener('load', () => {
    scrambleText.textContent = generateScramble();
    timerState.lastScramble = getCurrentScramble();
    loadSessionStats();
    checkUserLogin();
});

// Page Navigation
function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    document.getElementById(pageName + 'Page').classList.add('active');
    event.target.classList.add('active');
}

// New Scramble Button
newScrambleBtn.addEventListener('click', () => {
    if (!timerState.running) {
        const newScramble = generateScramble();
        scrambleText.textContent = newScramble;
        timerState.lastScramble = newScramble;
    }
});

// WCA Inspection Toggle
wcaInspection.addEventListener('change', () => {
    timerState.inspection = wcaInspection.checked;
});

// Spacebar Detection
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !timerState.running) {
        e.preventDefault();
        
        if (!timerState.spacebarPressed) {
            timerState.spacebarPressed = true;
            timerState.spacebarPressedTime = Date.now();
            
            timerHint.textContent = 'Hold to start...';
            timerStatus.textContent = '';
            
            // Start inspection if enabled
            if (timerState.inspection && timerState.inspectionTime === 0) {
                timerDisplay.textContent = '15.00';
                timerDisplay.style.color = '#4a90e2';
                startInspection();
            }
        }
    }
});

function startInspection() {
    let inspectionSeconds = 15;
    
    const inspectionInterval = setInterval(() => {
        inspectionSeconds--;
        
        if (inspectionSeconds < 0) {
            clearInterval(inspectionInterval);
            timerDisplay.style.color = '#e74c3c';
            timerDisplay.textContent = '+2';
            timerStatus.textContent = 'Time will have +2 penalty';
        } else if (inspectionSeconds < 4) {
            timerDisplay.style.color = '#e74c3c';
            timerDisplay.textContent = inspectionSeconds.toFixed(2);
        } else {
            timerDisplay.textContent = inspectionSeconds.toFixed(2);
        }
    }, 1000);
    
    if (!timerState.inspectionInterval) {
        timerState.inspectionInterval = inspectionInterval;
    }
}

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && timerState.spacebarPressed && !timerState.running) {
        const holdDuration = (Date.now() - timerState.spacebarPressedTime) / 1000;
        
        if (holdDuration >= 0.3) {
            // Start timer
            if (timerState.inspectionInterval) {
                clearInterval(timerState.inspectionInterval);
                timerState.inspectionInterval = null;
            }
            
            timerState.running = true;
            timerState.startTime = Date.now();
            timerDisplay.style.color = '#1a1a1a';
            timerDisplay.textContent = '0.00';
            timerHint.textContent = 'Running... Release spacebar to stop';
            timerStatus.textContent = '';
            
            startTimer();
        } else {
            timerHint.textContent = `Released too early (${holdDuration.toFixed(2)}s)`;
        }
        
        timerState.spacebarPressed = false;
    }
});

// Timer Logic
let timerInterval = null;

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - timerState.startTime) / 1000;
        timerDisplay.textContent = elapsed.toFixed(2);
    }, 10);
}

// Stop Timer on Spacebar Release during solve
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && timerState.running) {
        e.preventDefault();
        stopTimer();
    }
});

function stopTimer() {
    if (!timerState.running) return;
    
    timerState.running = false;
    clearInterval(timerInterval);
    
    const finalTime = (Date.now() - timerState.startTime) / 1000;
    timerState.times.push({
        time: finalTime,
        scramble: timerState.lastScramble,
        timestamp: new Date().toISOString()
    });
    
    // Save to user account if logged in
    if (currentUser) {
        saveUserTime(finalTime);
    }
    
    updateStats();
    saveSessionStats();
    
    timerHint.textContent = 'Hold spacebar to start (0.3s to ready)';
    timerStatus.textContent = `Time: ${finalTime.toFixed(2)}s`;
    
    // Generate new scramble
    const newScramble = generateScramble();
    scrambleText.textContent = newScramble;
    timerState.lastScramble = newScramble;
}

// Statistics
function updateStats() {
    if (timerState.times.length === 0) return;
    
    const times = timerState.times.map(t => t.time);
    const best = Math.min(...times);
    const worst = Math.max(...times);
    
    bestTimeEl.textContent = best.toFixed(2);
    worstTimeEl.textContent = worst.toFixed(2);
    solveCountEl.textContent = timerState.times.length;
    
    if (times.length >= 5) {
        const last5 = times.slice(-5);
        const ao5 = (last5.reduce((a, b) => a + b) / 5).toFixed(2);
        ao5El.textContent = ao5;
    }
    
    updateTimesList();
}

function updateTimesList() {
    timesList.innerHTML = '';
    
    const times = timerState.times.map(t => t.time);
    const best = Math.min(...times);
    
    for (let i = times.length - 1; i >= Math.max(0, times.length - 20); i--) {
        const timeEl = document.createElement('div');
        timeEl.className = 'time-item';
        
        if (times[i] === best) {
            timeEl.classList.add('pb');
        }
        
        timeEl.textContent = `${(i + 1).toString().padStart(2, '0')}. ${times[i].toFixed(2)}`;
        timesList.appendChild(timeEl);
    }
}

// Local Storage
function saveSessionStats() {
    localStorage.setItem('speedcube_session', JSON.stringify(timerState.times));
}

function loadSessionStats() {
    const saved = localStorage.getItem('speedcube_session');
    if (saved) {
        timerState.times = JSON.parse(saved);
        updateStats();
    }
}

// Account Management
function toggleAuthForm(e) {
    e.preventDefault();
    const loginBox = document.getElementById('loginBox');
    const signupBox = document.getElementById('signupBox');
    
    if (loginBox.style.display === 'none') {
        loginBox.style.display = 'block';
        signupBox.style.display = 'none';
    } else {
        loginBox.style.display = 'none';
        signupBox.style.display = 'block';
    }
}

function checkUserLogin() {
    const userStr = localStorage.getItem('speedcube_user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
        showProfile();
    } else {
        showAuth();
    }
}

function showAuth() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('profileContainer').style.display = 'none';
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.onsubmit = handleLogin;
    }
    
    if (signupForm) {
        signupForm.onsubmit = handleSignup;
    }
}

function showProfile() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'block';
    
    document.getElementById('username').textContent = currentUser.username;
    loadUserStats();
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = e.target.children[0].value;
    const password = e.target.children[1].value;
    
    // Get all users from localStorage
    const allUsersStr = localStorage.getItem('speedcube_users');
    const allUsers = allUsersStr ? JSON.parse(allUsersStr) : {};
    
    // Check if user exists and password matches
    const userKey = Object.keys(allUsers).find(key => allUsers[key].email === email);
    
    if (userKey && allUsers[userKey].password === password) {
        currentUser = {
            username: allUsers[userKey].username,
            email: email
        };
        localStorage.setItem('speedcube_user', JSON.stringify(currentUser));
        e.target.reset();
        showProfile();
    } else {
        alert('Invalid email or password');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const username = e.target.children[0].value;
    const email = e.target.children[1].value;
    const password = e.target.children[2].value;
    const confirmPassword = e.target.children[3].value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Get all users
    const allUsersStr = localStorage.getItem('speedcube_users');
    const allUsers = allUsersStr ? JSON.parse(allUsersStr) : {};
    
    // Check if user already exists
    if (Object.values(allUsers).some(user => user.email === email || user.username === username)) {
        alert('User already exists');
        return;
    }
    
    // Create new user
    const userId = 'user_' + Date.now();
    allUsers[userId] = {
        username: username,
        email: email,
        password: password,
        times: []
    };
    
    localStorage.setItem('speedcube_users', JSON.stringify(allUsers));
    
    currentUser = {
        username: username,
        email: email
    };
    localStorage.setItem('speedcube_user', JSON.stringify(currentUser));
    
    e.target.reset();
    showProfile();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('speedcube_user');
    
    document.getElementById('profileContainer').style.display = 'none';
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('loginBox').style.display = 'block';
    document.getElementById('signupBox').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function saveUserTime(time) {
    if (!currentUser) return;
    
    const allUsersStr = localStorage.getItem('speedcube_users');
    const allUsers = JSON.parse(allUsersStr);
    
    const userKey = Object.keys(allUsers).find(key => allUsers[key].email === currentUser.email);
    if (userKey) {
        if (!allUsers[userKey].times) {
            allUsers[userKey].times = [];
        }
        allUsers[userKey].times.push(time);
        localStorage.setItem('speedcube_users', JSON.stringify(allUsers));
    }
}

function loadUserStats() {
    if (!currentUser) return;
    
    const allUsersStr = localStorage.getItem('speedcube_users');
    if (!allUsersStr) {
        document.getElementById('userTotalSolves').textContent = '0';
        return;
    }
    
    const allUsers = JSON.parse(allUsersStr);
    const userKey = Object.keys(allUsers).find(key => allUsers[key].email === currentUser.email);
    
    if (!userKey || !allUsers[userKey].times || allUsers[userKey].times.length === 0) {
        document.getElementById('userTotalSolves').textContent = '0';
        document.getElementById('userTimesList').innerHTML = '';
        return;
    }
    
    const times = allUsers[userKey].times;
    
    const best = Math.min(...times);
    const worst = Math.max(...times);
    
    document.getElementById('userBest').textContent = best.toFixed(2);
    document.getElementById('userTotalSolves').textContent = times.length;
    
    if (times.length >= 5) {
        const last5 = times.slice(-5);
        const ao5 = (last5.reduce((a, b) => a + b) / 5).toFixed(2);
        document.getElementById('userAo5').textContent = ao5;
    }
    
    if (times.length >= 12) {
        const last12 = times.slice(-12);
        const ao12 = (last12.reduce((a, b) => a + b) / 12).toFixed(2);
        document.getElementById('userAo12').textContent = ao12;
    }
    
    updateUserTimesList(times);
}

function updateUserTimesList(times) {
    const userTimesList = document.getElementById('userTimesList');
    userTimesList.innerHTML = '';
    
    const best = Math.min(...times);
    
    for (let i = Math.max(0, times.length - 20); i < times.length; i++) {
        const timeEl = document.createElement('div');
        timeEl.className = 'time-item';
        
        if (times[i] === best) {
            timeEl.classList.add('pb');
        }
        
        timeEl.textContent = `${(i + 1).toString().padStart(3, '0')}. ${times[i].toFixed(2)}`;
        userTimesList.appendChild(timeEl);
    }
}

// Contact Form
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.onsubmit = handleContactSubmit;
    }
});

function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: e.target.children[0].value,
        email: e.target.children[1].value,
        subject: e.target.children[2].value,
        message: e.target.children[3].value,
        timestamp: new Date().toISOString()
    };
    
    // Save contact message to localStorage
    const messagesStr = localStorage.getItem('speedcube_contacts');
    const messages = messagesStr ? JSON.parse(messagesStr) : [];
    messages.push(formData);
    localStorage.setItem('speedcube_contacts', JSON.stringify(messages));
    
    // Show success message
    const messageEl = document.getElementById('contactMessage');
    messageEl.className = 'contact-message success';
    messageEl.textContent = 'Message saved! Thank you for reaching out. Open browser console to view all messages.';
    messageEl.style.display = 'block';
    e.target.reset();
    
    // Log message to console for viewing
    console.log('Contact Message:', formData);
    console.log('All Messages:', messages);
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}
