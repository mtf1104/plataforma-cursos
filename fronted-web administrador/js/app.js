document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const authMessage = document.getElementById('auth-message');

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        authMessage.textContent = 'Verificando credenciales...';
        authMessage.style.color = '#333';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Validación crucial: Verificar que el rol sea 'admin'
                // Esto asume que tu API devuelve { token, role: 'admin' }
                if(data.role === 'admin') {
                    authMessage.style.color = 'green';
                    authMessage.textContent = '¡Acceso concedido!';
                    setToken(data.token);
                    
                    // Redirigir al panel de administración
                    window.location.href = 'administrar.html';
                } else {
                    authMessage.style.color = 'red';
                    authMessage.textContent = 'Acceso denegado. Se requieren permisos de administrador.';
                }
            } else {
                authMessage.style.color = 'red';
                authMessage.textContent = data.message || 'Credenciales incorrectas';
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            authMessage.style.color = 'red';
            authMessage.textContent = 'Error al conectar con el servidor.';
        }
    });
});