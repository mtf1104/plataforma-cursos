document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const authForm = document.getElementById('auth-form');
    const nameGroup = document.getElementById('name-group');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const toggleLink = document.getElementById('toggle-link');
    const toggleText = document.getElementById('toggle-text');
    const authMessage = document.getElementById('auth-message');

    let isLogin = true; // Empezamos en modo inicio de sesión

    // 1. Lógica para cambiar entre Iniciar Sesión y Registro
    toggleLink.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que el enlace recargue la página
        isLogin = !isLogin;
        
        // Limpiamos los mensajes y los campos
        authMessage.textContent = '';
        authForm.reset();

        if (isLogin) {
            formTitle.textContent = 'Iniciar Sesión';
            nameGroup.style.display = 'none';
            submitBtn.textContent = 'Entrar';
            toggleText.textContent = '¿No tienes cuenta?';
            toggleLink.textContent = 'Regístrate aquí';
        } else {
            formTitle.textContent = 'Crear Cuenta';
            nameGroup.style.display = 'block';
            submitBtn.textContent = 'Registrarse';
            toggleText.textContent = '¿Ya tienes cuenta?';
            toggleLink.textContent = 'Inicia sesión';
        }
    });

    // 2. Lógica para enviar los datos a tu API en Render
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        authMessage.textContent = 'Procesando...';
        authMessage.style.color = '#333';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;

        // Decidimos a qué ruta pegar y qué datos mandar
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const bodyData = isLogin ? { email, password } : { name, email, password };

        try {
            // Hacemos la petición a la nube usando la API_URL de api.js
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json();

            if (response.ok) {
                authMessage.style.color = 'green';
                
                if (isLogin) {
                    authMessage.textContent = '¡Conexión exitosa!';
                    setToken(data.token); // Guardamos el gafete (Token)
                    
                    // Comprobación rápida para ver el token guardado en la consola
                    console.log("¡Token guardado exitosamente!", getToken());
                    
                    // Aquí, más adelante, redirigiremos al catálogo de cursos
                    setTimeout(() => alert("¡Bienvenido! Has iniciado sesión en la nube."), 500);
                } else {
                    authMessage.textContent = '¡Registro exitoso! Por favor, inicia sesión.';
                    toggleLink.click(); // Cambiamos automáticamente a la vista de login
                }
            } else {
                // Si la API nos rechaza (ej. contraseña incorrecta)
                authMessage.style.color = 'red';
                authMessage.textContent = data.message || 'Error en la solicitud';
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            authMessage.style.color = 'red';
            authMessage.textContent = 'Error al conectar con el servidor en Render.';
        }
    });
});