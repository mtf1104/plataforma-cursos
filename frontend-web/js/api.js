// js/api.js
// URL base de tu API en Render
/*const API_URL = 'https://edu-platform-api-a2wx.onrender.com/api';

// Función global para manejar el Token en el frontend
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}*/
// URL de tu API local (para desarrollo)
const API_URL = 'http://localhost:3000/api';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}