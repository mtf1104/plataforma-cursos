document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    
    // Si no hay token, lo regresamos al login para proteger la página
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const coursesGrid = document.getElementById('courses-grid');
    const logoutBtn = document.getElementById('logout-btn');

    // Función para cerrar sesión
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        removeToken();
        window.location.href = 'index.html';
    });

    // Cargar los cursos desde Render
    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            }
        });

        if (response.ok) {
            const courses = await response.json();
            
            if (courses.length === 0) {
                coursesGrid.innerHTML = '<p>Aún no hay cursos disponibles.</p>';
                return;
            }

            // Dibujar las tarjetas de los cursos
            coursesGrid.innerHTML = courses.map(course => `
                <div class="course-card">
                    <h3>${course.title}</h3>
                    <p>Profesor: ${course.teacher_name}</p>
                    <button onclick="enroll(${course.id})">Inscribirme</button>
                </div>
            `).join('');
        } else {
            // Si el token expiró o hay error
            removeToken();
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error("Error cargando cursos:", error);
        coursesGrid.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
});

// Función real para inscribirse al curso
async function enroll(courseId) {
    const token = getToken();
    
    try {
        const response = await fetch(`${API_URL}/enrollments`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ course_id: courseId })
        });

        const data = await response.json();

        if (response.ok) {
            // Si la inscripción es nueva y exitosa
            alert("¡Inscripción exitosa! Redirigiendo al salón de clases...");
            window.location.href = `study?course_id=${courseId}`;
        } else {
            // Si ya estaba inscrito, de todos modos lo dejamos pasar a estudiar
            if (response.status === 400 && data.message.includes('Ya estás inscrito')) {
                window.location.href = `study?course_id=${courseId}`;
            } else {
                alert(data.message || 'Error al inscribirse');
            }
        }
    } catch (error) {
        console.error("Error en la inscripción:", error);
        alert("Hubo un problema al intentar procesar la inscripción.");
    }

}