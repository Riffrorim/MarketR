function displayUsername() {
    const username = localStorage.getItem('username');
    const usernameElements = document.querySelectorAll('#name, #username-display, #current-username');
    usernameElements.forEach(element => {
        if (username && element) {
            element.textContent = username;
        }
    });
}

function checkAuthState() {
    const username = localStorage.getItem('username');
    const logInBtn = document.getElementById('LogInBtn');
    const exitBtn = document.getElementById('exit');
    const taskbar = document.getElementById('taskbar');
    const guestContainer = document.querySelector('.guest');

    if (username) {
        if (logInBtn) logInBtn.style.display = 'none';
        if (exitBtn) exitBtn.style.display = 'block';
        if (taskbar) taskbar.style.display = 'flex';
        if (guestContainer) guestContainer.style.display = 'none';
    } else {
        if (logInBtn) logInBtn.style.display = 'block';
        if (exitBtn) exitBtn.style.display = 'none';
        if (taskbar) taskbar.style.display = 'none';
        if (guestContainer) guestContainer.style.display = 'flex';
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = '/';
        }
    }
}

function setupLogout() {
    const exitButton = document.getElementById('exit');
    if (exitButton) {
        exitButton.addEventListener('click', function() {
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            checkAuthState();
            showSuccess('Вы успешно вышли из системы!');
            if (window.location.pathname.includes('profile.html')) {
                window.location.href = '/';
            }
        });
    }
}

function showMessage(message, isSuccess) {
    const messageSystem = document.querySelector('.messageSystem');
    const messageText = document.getElementById('message');
    const goodImg = document.getElementById('good');
    const badImg = document.getElementById('bad');
    
    if (!messageSystem || !messageText || !goodImg || !badImg) return;
    
    messageText.textContent = message;
    
    if (isSuccess) {
        goodImg.style.display = 'block';
        badImg.style.display = 'none';
    } else {
        goodImg.style.display = 'none';
        badImg.style.display = 'block';
    }
    
    messageSystem.style.display = 'flex';
    
    setTimeout(() => {
        messageSystem.style.display = 'none';
    }, 3000);
}

function showSuccess(message) {
    showMessage(message, true);
}

function showError(message) {
    showMessage(message, false);
}

document.addEventListener('DOMContentLoaded', function() {
    displayUsername();
    checkAuthState();
    setupLogout();
});

window.addEventListener('message', function(event) {
    if (event.data.type === 'usernameChanged') {
        localStorage.setItem('username', event.data.newUsername);
        displayUsername();
    }
});