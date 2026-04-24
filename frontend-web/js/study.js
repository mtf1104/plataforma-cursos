document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) { window.location.href = 'index.html'; return; }

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');

    if (!courseId) { alert("Curso no válido"); window.location.href = 'catalog.html'; return; }

    const courseTitleNav = document.getElementById('course-title-nav');
    const lessonsList = document.getElementById('lessons-list');
    const lessonTitle = document.getElementById('lesson-title');
    const completeBtn = document.getElementById('complete-btn');
    const progressMsg = document.getElementById('progress-msg');
    
    let currentLessonId = null;

    // ¡SOLUCIÓN! Definimos la función ARRIBA, antes de pedir los datos a la base
    window.loadLesson = (id, title) => {
        currentLessonId = id;
        lessonTitle.textContent = title;
        completeBtn.style.display = 'block';
        progressMsg.textContent = '';
        
        const lessonDesc = document.getElementById('lesson-desc');
        if(lessonDesc) lessonDesc.style.display = 'none';

        document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
        
        document.querySelectorAll('.lesson-item').forEach(el => {
            if(el.textContent.includes(title)) {
                el.classList.add('active');
            }
        });
    };

    // 1. Cargar datos del curso y lecciones
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            courseTitleNav.textContent = data.course.title;
            
            if (data.lessons.length === 0) {
                lessonsList.innerHTML = '<p>Este curso aún no tiene lecciones.</p>';
                return;
            }

            lessonsList.innerHTML = data.lessons.map(lesson => `
                <div class="lesson-item" onclick="loadLesson(${lesson.id}, '${lesson.title}')">
                    ${lesson.sequence_order}. ${lesson.title}
                </div>
            `).join('');

            // Ahora sí, la función ya existe cuando la llamamos aquí
            loadLesson(data.lessons[0].id, data.lessons[0].title);
        }
    } catch (error) {
        console.error("Error cargando curso:", error);
    }

    // 3. Lógica para marcar lección completada
    completeBtn.addEventListener('click', async () => {
        if (!currentLessonId) return;
        
        progressMsg.textContent = 'Procesando...';
        progressMsg.style.color = '#333';
        
        try {
            const response = await fetch(`${API_URL}/student/lessons/${currentLessonId}/complete`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                progressMsg.style.color = 'green';
                progressMsg.textContent = data.message;
                completeBtn.style.display = 'none';
            } else {
                progressMsg.style.color = 'red';
                progressMsg.textContent = data.message;
            }
        } catch (error) {
            console.error("Error al completar:", error);
        }
    });
});