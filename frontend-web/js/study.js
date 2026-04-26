document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) { window.location.href = 'index.html'; return; }

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');

    if (!courseId) { alert("Curso no válido"); window.location.href = 'catalog.html'; return; }

    // Referencias a elementos del DOM
    const courseTitleNav = document.getElementById('course-title-nav');
    const lessonsList = document.getElementById('lessons-list');
    const lessonTitle = document.getElementById('lesson-title');
    const completeBtn = document.getElementById('complete-btn');
    const progressMsg = document.getElementById('progress-msg');
    const graduationScreen = document.getElementById('graduation-screen');
    
    let currentLessonId = null;

    // --- FUNCIÓN PARA MOSTRAR LA PANTALLA DE GRADUACIÓN ---
    const showGraduation = (title) => {
        // Aseguramos que el título no sea el texto por defecto
        const finalTitle = (title && title !== "Cargando...") ? title : "Curso Completado";
        
        if (courseTitleNav) courseTitleNav.textContent = finalTitle;
        
        // Ocultamos elementos de clase
        document.getElementById('video-player').style.display = 'none';
        document.getElementById('lesson-title').style.display = 'none';
        const lessonDesc = document.getElementById('lesson-desc');
        if (lessonDesc) lessonDesc.style.display = 'none';
        
        document.querySelector('.sidebar').style.display = 'none';
        if (completeBtn) completeBtn.style.display = 'none';
        
        // Mostramos pantalla dorada
        if (graduationScreen) graduationScreen.style.display = 'block';
        
        setupGraduationButtons(courseId, finalTitle);
    };

    // --- LÓGICA DE CARGA INICIAL ---
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const realTitle = data.course.title;

            // Guardamos el título real en el navegador para futuras cargas rápidas
            localStorage.setItem(`courseTitle_${courseId}`, realTitle);
            courseTitleNav.textContent = realTitle;

            // ¿El usuario ya terminó este curso?
            if (localStorage.getItem(`graduated_${courseId}`)) {
                showGraduation(realTitle);
                return; // Detenemos aquí si ya es graduado
            }

            // Carga normal de lecciones si no está graduado
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
        console.error("Error al cargar el curso:", error);
    }

    // Cargar video seleccionado
    window.loadLesson = (id, title) => {
        currentLessonId = id;
        lessonTitle.textContent = title;
        completeBtn.style.display = 'block';
        progressMsg.textContent = '';
        
        document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.lesson-item').forEach(el => {
            if (el.textContent.includes(title)) el.classList.add('active');
        });
    };

    // Botón de marcar como completado
    completeBtn.addEventListener('click', async () => {
        if (!currentLessonId) return;
        progressMsg.textContent = 'Procesando...';
        
        try {
            const response = await fetch(`${API_URL}/student/lessons/${currentLessonId}/complete`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                // Verificamos si es la última lección del curso
                if (data.certificate_url || data.message.includes('terminado') || data.message.includes('Felicidades')) {
                    localStorage.setItem(`graduated_${courseId}`, 'true');
                    localStorage.setItem(`courseTitle_${courseId}`, courseTitleNav.textContent);
                    showGraduation(courseTitleNav.textContent);
                } else {
                    progressMsg.style.color = 'green';
                    progressMsg.textContent = data.message;
                    completeBtn.style.display = 'none';
                }
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    });

    // --- CONFIGURACIÓN DE ESTRELLAS Y DIPLOMA ---
    function setupGraduationButtons(cId, cTitle) {
        const ratingSection = document.querySelector('.rating-section');
        
        // 1. Manejo de Calificación persistente
        if (localStorage.getItem(`rated_${cId}`)) {
            const score = localStorage.getItem(`rated_score_${cId}`);
            if (ratingSection) {
                ratingSection.innerHTML = `<h3 style="color: #2ecc71;">¡Gracias por tus ${score} estrellas! 🌟</h3><p>Tu evaluación ha sido registrada de forma permanente.</p>`;
            }
        } else {
            const submitBtn = document.getElementById('submit-review-btn');
            if (submitBtn) {
                submitBtn.onclick = () => {
                    const score = document.getElementById('course-rating').value;
                    localStorage.setItem(`rated_${cId}`, 'true');
                    localStorage.setItem(`rated_score_${cId}`, score);
                    ratingSection.innerHTML = `<h3 style="color: #2ecc71;">¡Gracias por tus ${score} estrellas! 🌟</h3>`;
                };
            }
        }

        // 2. Generación de Diploma PDF
        const downloadBtn = document.getElementById('download-diploma-btn');
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                const studentName = prompt("Ingresa tu nombre completo para el diploma:", "Martín Téllez") || "Estudiante";
                const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
                
                const diplomaHTML = `
                <html>
                <head><title>Diploma - ${studentName}</title></head>
                <body style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f4f4f4; margin:0; font-family: 'Segoe UI', sans-serif;">
                    <div style="background: white; width: 850px; padding: 50px; text-align: center; border: 15px solid #2c3e50; outline: 5px solid #f1c40f; outline-offset: -20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <h1 style="color: #2c3e50; font-size: 40px; text-transform: uppercase;">Certificado de Finalización</h1>
                        <p style="font-size: 20px; color: #666;">Se otorga con orgullo a:</p>
                        <h2 style="color: #2c3e50; font-size: 45px; text-transform: capitalize; margin: 20px 0;">${studentName}</h2>
                        <p style="font-size: 18px; color: #666;">Por concluir exitosamente el curso de:</p>
                        <h3 style="color: #3498db; font-size: 32px; border-bottom: 2px solid #3498db; display: inline-block; padding-bottom: 5px;">${cTitle}</h3>
                        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
                            <div style="text-align: left;">
                                <p style="font-weight: bold; margin: 0;">MAGNET EduPlatform</p>
                                <p style="font-size: 14px; color: #999;">Institución Educativa</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="font-weight: bold; margin: 0;">${date}</p>
                                <p style="font-size: 14px; color: #999;">Fecha de Emisión</p>
                            </div>
                        </div>
                    </div>
                    <script>setTimeout(() => { window.print(); window.close(); }, 700);</script>
                </body>
                </html>`;

                const win = window.open('', '_blank');
                win.document.write(diplomaHTML);
                win.document.close();
            };
        }
    }
});