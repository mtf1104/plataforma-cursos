document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) { window.location.href = 'index.html'; return; }

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');

    if (!courseId) { alert("Curso no válido"); window.location.href = 'catalog.html'; return; }

    // --- EL CANDADO: Bloqueo permanente ---
    if (localStorage.getItem(`graduated_${courseId}`)) {
        document.getElementById('video-player').style.display = 'none';
        document.getElementById('lesson-title').style.display = 'none';
        
        const lessonDesc = document.getElementById('lesson-desc');
        if(lessonDesc) lessonDesc.style.display = 'none';
        
        document.querySelector('.sidebar').style.display = 'none';
        document.getElementById('complete-btn').style.display = 'none';
        
        // Recuperamos el nombre del curso para quitar el "Cargando..."
        const savedCourseTitle = localStorage.getItem(`courseTitle_${courseId}`);
        if(savedCourseTitle) {
            const navTitle = document.getElementById('course-title-nav');
            if(navTitle) navTitle.textContent = savedCourseTitle;
        }

        document.getElementById('graduation-screen').style.display = 'block';
        
        setupGraduationButtons(courseId);
        return; // Detenemos la carga
    }
    // ---------------------------------------

    const courseTitleNav = document.getElementById('course-title-nav');
    const lessonsList = document.getElementById('lessons-list');
    const lessonTitle = document.getElementById('lesson-title');
    const completeBtn = document.getElementById('complete-btn');
    const progressMsg = document.getElementById('progress-msg');
    
    let currentLessonId = null;

    window.loadLesson = (id, title) => {
        currentLessonId = id;
        lessonTitle.textContent = title;
        completeBtn.style.display = 'block';
        progressMsg.textContent = '';
        
        const lessonDesc = document.getElementById('lesson-desc');
        if(lessonDesc) lessonDesc.style.display = 'none';

        document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.lesson-item').forEach(el => {
            if(el.textContent.includes(title)) { el.classList.add('active'); }
        });
    };

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
                if (data.certificate_url || data.message.includes('Felicidades') || data.message.includes('terminado')) {
                    
                    // Guardamos el sello y el nombre del curso en el navegador
                    localStorage.setItem(`graduated_${courseId}`, 'true');
                    localStorage.setItem(`courseTitle_${courseId}`, courseTitleNav.textContent);

                    document.getElementById('video-player').style.display = 'none';
                    document.getElementById('lesson-title').style.display = 'none';
                    
                    const lessonDesc = document.getElementById('lesson-desc');
                    if(lessonDesc) lessonDesc.style.display = 'none';
                    
                    document.querySelector('.sidebar').style.display = 'none'; 
                    completeBtn.style.display = 'none';
                    progressMsg.style.display = 'none';

                    document.getElementById('graduation-screen').style.display = 'block';
                    setupGraduationButtons(courseId);
                } else {
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
    });

    // Función que le da vida a las estrellas y al PDF
    function setupGraduationButtons(cId) {
        const ratingSection = document.querySelector('.rating-section');
        
        // Verificamos si ya había calificado antes
        if (localStorage.getItem(`rated_${cId}`)) {
            const savedScore = localStorage.getItem(`rated_score_${cId}`);
            if(ratingSection) {
                ratingSection.innerHTML = `<h3 style="color: #2ecc71;">¡Gracias por tus ${savedScore} estrellas! 🌟</h3><p>Tu evaluación ha sido registrada de forma permanente.</p>`;
            }
        } else {
            const submitReviewBtn = document.getElementById('submit-review-btn');
            if(submitReviewBtn && !submitReviewBtn.dataset.listener) {
                submitReviewBtn.addEventListener('click', () => {
                    const score = document.getElementById('course-rating').value;
                    
                    // Guardamos que ya calificó
                    localStorage.setItem(`rated_${cId}`, 'true');
                    localStorage.setItem(`rated_score_${cId}`, score);
                    
                    ratingSection.innerHTML = `<h3 style="color: #2ecc71;">¡Gracias por tus ${score} estrellas! 🌟</h3><p>Tu evaluación ha sido registrada de forma permanente.</p>`;
                });
                submitReviewBtn.dataset.listener = 'true';
            }
        }

        const downloadDiplomaBtn = document.getElementById('download-diploma-btn');
        if(downloadDiplomaBtn && !downloadDiplomaBtn.dataset.listener) {
            downloadDiplomaBtn.addEventListener('click', () => {
                const courseName = document.getElementById('course-title-nav').textContent || 'Curso Completado';
                
                // Pedimos el nombre para que salga en el diploma
                const studentName = prompt("Ingresa tu nombre completo para el diploma:", "Martin Tellez") || "Estudiante";
                const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
                
                const diplomaHTML = `
                    <html><head><title>Diploma Oficial - ${studentName}</title></head>
                    <body style="display:flex; justify-content:center; align-items:center; height:100vh; background:#555; margin:0; font-family: 'Segoe UI', Tahoma, sans-serif;">
                        <div style="background: white; width: 900px; padding: 60px; text-align: center; border: 15px solid #2c3e50; outline: 5px solid #f1c40f; outline-offset: -20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            <h1 style="color: #2c3e50; font-size: 45px; margin-bottom: 10px; text-transform: uppercase;">Certificado de Finalización</h1>
                            <p style="font-size: 22px; color: #666; margin-bottom: 20px;">Se otorga el presente diploma a:</p>
                            
                            <h2 style="color: #2c3e50; font-size: 40px; margin-top: 0; margin-bottom: 30px; text-transform: capitalize;">${studentName}</h2>
                            
                            <p style="font-size: 20px; color: #666; margin-bottom: 20px;">Por haber concluido satisfactoriamente los requisitos académicos del curso:</p>
                            
                            <h3 style="color: #3498db; font-size: 30px; border-bottom: 2px solid #3498db; display: inline-block; padding-bottom: 10px; margin-bottom: 50px;">${courseName}</h3>
                            
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
                            setTimeout(() => window.print(), 500);
                        </script>
                    </body></html>
                `;
                
                const nuevaPestana = window.open('', '_blank');
                nuevaPestana.document.write(diplomaHTML);
                nuevaPestana.document.close();
            });
            downloadDiplomaBtn.dataset.listener = 'true';
        }
    }
});