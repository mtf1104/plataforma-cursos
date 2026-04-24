document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Configuración de cabeceras para las peticiones
    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // --- CERRAR SESIÓN ---
    document.getElementById('logout-btn').addEventListener('click', () => {
        removeToken();
        window.location.href = 'index.html';
    });

    // --- ALTA DE PROFESOR ---
    document.getElementById('form-teacher').addEventListener('submit', async (e) => {
        e.preventDefault();
        const teacherData = {
            name: document.getElementById('t-name').value,
            email: document.getElementById('t-email').value,
            specialty: document.getElementById('t-specialty').value
        };

        try {
            const res = await fetch(`${API_URL}/admin/teachers`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(teacherData)
            });
            if (res.ok) {
                alert('Profesor dado de alta con éxito');
                e.target.reset();
                loadTeachers(); // Recargar la lista para el formulario de cursos
            } else {
                alert('Error al guardar el profesor');
            }
        } catch (error) {
            console.error(error);
        }
    });

    // --- ALTA DE CURSOS Y LECCIONES ---
    const lessonsContainer = document.getElementById('lessons-container');
    document.getElementById('add-lesson-btn').addEventListener('click', () => {
        const newLesson = document.createElement('div');
        newLesson.className = 'lesson-input';
        newLesson.innerHTML = `
            <input type="text" class="l-title" placeholder="Título del video" required>
            <input type="text" class="l-url" placeholder="URL del video" required>
        `;
        lessonsContainer.appendChild(newLesson);
    });

    document.getElementById('form-course').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Recopilar datos del curso
        const title = document.getElementById('c-title').value;
        const teacher_id = document.getElementById('c-teacher').value;
        
        // Recopilar el arreglo de lecciones
        const lessonElements = document.querySelectorAll('.lesson-input');
        const lessons = Array.from(lessonElements).map((el, index) => ({
            title: el.querySelector('.l-title').value,
            video_url: el.querySelector('.l-url').value,
            sequence_order: index + 1
        }));

        try {
            const res = await fetch(`${API_URL}/admin/courses`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ title, teacher_id, lessons })
            });
            if (res.ok) {
                alert('Curso y videos guardados con éxito');
                e.target.reset();
                lessonsContainer.innerHTML = `
                    <div class="lesson-input">
                        <input type="text" class="l-title" placeholder="Título del video" required>
                        <input type="text" class="l-url" placeholder="URL del video" required>
                    </div>
                `;
            } else {
                alert('Error al guardar el curso');
            }
        } catch (error) {
            console.error(error);
        }
    });

    // --- CARGAR PROFESORES AL SELECT ---
    async function loadTeachers() {
        try {
            const res = await fetch(`${API_URL}/admin/teachers`, { headers: authHeaders });
            if (res.ok) {
                const teachers = await res.json();
                const select = document.getElementById('c-teacher');
                select.innerHTML = '<option value="">Selecciona un profesor...</option>';
                teachers.forEach(t => {
                    const option = document.createElement('option');
                    option.value = t.id;
                    option.textContent = `${t.name} (${t.specialty})`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error cargando profesores', error);
        }
    }

    // --- REPORTES (Visualizaciones y Calificaciones) ---
    document.getElementById('load-reports-btn').addEventListener('click', async () => {
        const container = document.getElementById('reports-container');
        container.innerHTML = '<p>Cargando datos...</p>';

        try {
            const res = await fetch(`${API_URL}/admin/reports/top-courses`, { headers: authHeaders });
            if (res.ok) {
                const data = await res.json();
                // Asumiendo que data trae un arreglo con: title, views, avg_rating, comments_count
                let html = '<table border="1" width="100%"><tr><th>Curso</th><th>Visualizaciones</th><th>Calificación Promedio</th><th>Reseñas</th></tr>';
                
                data.forEach(row => {
                    html += `<tr>
                                <td>${row.title}</td>
                                <td>${row.total_views}</td>
                                <td>${row.avg_rating} / 5</td>
                                <td>${row.total_reviews}</td>
                             </tr>`;
                });
                html += '</table>';
                container.innerHTML = html;
            }
        } catch (error) {
            container.innerHTML = '<p style="color:red;">Error al cargar reportes.</p>';
        }
    });

    // Inicializar datos
    loadTeachers();
});