async doLogin() {
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');
    loginButton.disabled = true;
    errorMessage.textContent = '';

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out. Please try again.')), 10000));

    try {
        const response = await Promise.race([apiGet('/login'), timeout]);
        if (!response || response.status !== 200) {
            throw new Error('User not found. Please check your credentials.');
        }
        // Handle successful login
        // ...
    } catch (err) {
        if (err.message === 'Request timed out. Please try again.') {
            errorMessage.textContent = 'Network issue. Please check your connection.';
        } else {
            errorMessage.textContent = err.message;
        }
        // Fallback to demo users
        const demoUsers = [
            { email: 'demo1@example.com', password: 'demo123' },
            { email: 'demo2@example.com', password: 'demo456' }
        ];
        if (init.users.length === 0) {
            loadDemoUsers(demoUsers);
        }
    } finally {
        loginButton.disabled = false;
    }
}

function loadDemoUsers(users) {
    const userList = document.getElementById('demoUserList');
    userList.innerHTML = '';
    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = user.email;
        listItem.addEventListener('click', () => {
            document.getElementById('emailInput').value = user.email;
            document.getElementById('passwordInput').value = user.password;
        });
        userList.appendChild(listItem);
    });
}