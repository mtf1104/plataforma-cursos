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

    // Función para cargar la lección
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
                // Si la base de datos nos dice que nos graduamos
                if (data.message.includes('terminado el curso')) {
                    // 1. Ocultamos el salón de clases para bloquearlo
                    document.getElementById('video-player').style.display = 'none';
                    document.getElementById('lesson-title').style.display = 'none';
                    document.getElementById('lesson-desc').style.display = 'none';
                    document.querySelector('.sidebar').style.display = 'none'; // Ocultamos la lista
                    completeBtn.style.display = 'none';
                    progressMsg.style.display = 'none';

                    // 2. Mostramos la pantalla dorada de graduación
                    document.getElementById('graduation-screen').style.display = 'block';
                } else {
                    // Si es una lección normal, solo mostramos el éxito
                    progressMsg.style.color = 'green';
                    progressMsg.textContent = data.message;
                    completeBtn.style.display = 'none';
                }
            } else {
                progressMsg.style.color = 'red';
                progressMsg.textContent = data.message;
            }
        } catch (error) {
            console.error("Error al completar:", error);
        }
    }); // <-- Aquí cerramos correctamente el evento del botón Completar

    // --- LAS SIGUIENTES FUNCIONES AHORA ESTÁN AFUERA, DONDE DEBEN IR ---

    // Lógica para enviar la calificación
    const submitReviewBtn = document.getElementById('submit-review-btn');
    if(submitReviewBtn) {
        submitReviewBtn.addEventListener('click', () => {
            const score = document.getElementById('course-rating').value;
            // Aquí en el futuro puedes hacer un fetch() POST a /api/reviews
            document.querySelector('.rating-section').innerHTML = `<h3 style="color: #2ecc71;">¡Gracias por tus ${score} estrellas! 🌟</h3><p>Tu evaluación ha sido registrada.</p>`;
        });
    }

    // Lógica para generar el diploma en HTML puro
    const downloadDiplomaBtn = document.getElementById('download-diploma-btn');
    if(downloadDiplomaBtn) {
        downloadDiplomaBtn.addEventListener('click', () => {
            const courseName = document.getElementById('course-title-nav').textContent;
            const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
            
            // Creamos un documento nuevo y elegante para imprimir
            const diplomaHTML = `
                <html><head><title>Diploma Oficial</title></head>
                <body style="display:flex; justify-content:center; align-items:center; height:100vh; background:#555; margin:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="background: white; width: 800px; padding: 60px; text-align: center; border: 15px solid #2c3e50; outline: 5px solid #f1c40f; outline-offset: -20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <h1 style="color: #2c3e50; font-size: 45px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Certificado de Finalización</h1>
                        <p style="font-size: 22px; color: #666; margin-bottom: 40px;">Se otorga el presente diploma al alumno de la plataforma por haber concluido satisfactoriamente todos los módulos correspondientes a:</p>
                        
                        <h2 style="color: #3498db; font-size: 35px; border-bottom: 2px solid #3498db; display: inline-block; padding-bottom: 10px; margin-bottom: 50px;">${courseName}</h2>
                        
                        <div style="display: flex; justify-content: space-between; margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px;">
                            <div>
                                <p style="font-weight: bold; font-size: 18px; margin: 0;">MAGNET EduPlatform</p>
                                <p style="font-size: 14px; color: #888;">Autoridad Emisora</p>
                            </div>
                            <div>
                                <p style="font-weight: bold; font-size: 18px; margin: 0;">${today}</p>
                                <p style="font-size: 14px; color: #888;">Fecha de Emisión</p>
                            </div>
                        </div>
                    </div>
                    <script>
                        // Activa el cuadro de impresión automáticamente
                        setTimeout(() => window.print(), 500);
                    </script>
                </body></html>
            `;
            
            // Abrimos el diploma en una pestaña nueva
            const nuevaPestana = window.open('', '_blank');
            nuevaPestana.document.write(diplomaHTML);
            nuevaPestana.document.close();
        });
    }
});