// URL de tu API en Render (Producción)
const API_URL = 'https://edu-platform-api-a2wx.onrender.com/api';

// URL de tu API local (Desarrollo - Comentada)
// const API_URL = 'http://localhost:3000/api';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}