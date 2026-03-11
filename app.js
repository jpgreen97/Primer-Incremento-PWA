// --- 1. CONFIGURACIÓN DE BASE DE DATOS (IndexedDB) ---
    [cite_start]// Usamos esto para guardar las revisiones grandes offline [cite: 22, 73]
    let db;
    const request = indexedDB.open("SistemaRevisionMVP", 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        // Crea un "almacén" para guardar las evaluaciones
        if (!db.objectStoreNames.contains('evaluaciones')) {
            db.createObjectStore('evaluaciones', { keyPath: 'id', autoIncrement: true });
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("Base de datos lista para trabajar Offline");
        cargarRevisionesGuardadas(); // Cargar datos al abrir
    };

    [cite_start]
    // --- 2. LÓGICA EDITOR (LocalStorage) ---
    function addArticle() {
        const titleInput = document.getElementById('new-article-title');
        const fileInput = document.getElementById('new-article-file');
        
        const title = titleInput.value.trim();
        const file = fileInput.files[0]; // Capturamos el archivo PDF

        if (!title) return alert("Por favor, escribe un título válido para el artículo.");

        let articles = JSON.parse(localStorage.getItem('articulos') || '[]');
        
        // Guardamos los datos, incluyendo el nombre del archivo
        articles.push({ 
            id: Date.now(), 
            title: title, 
            status: 'En Revisión',
            fileName: file ? file.name : 'Sin archivo adjunto' 
        });
        
        localStorage.setItem('articulos', JSON.stringify(articles));
        
        alert("✅ Artículo registrado correctamente.");
        
        // Limpiamos los inputs
        titleInput.value = ""; 
        if (fileInput) fileInput.value = ""; 
        
        renderEditorList(); 
    }

    function renderEditorList() {
        const list = document.getElementById('editor-article-list');
        const articles = JSON.parse(localStorage.getItem('articulos') || '[]');
        
        if (articles.length === 0) {
            list.innerHTML = "<p>No hay artículos registrados.</p>";
            return;
        }

        // Modificamos la lista para que muestre el nombre del PDF
        list.innerHTML = articles.map(art => 
            `<div style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items: center;">
                <div>
                    <strong>${art.title}</strong><br>
                    <small style="color: #666;">📄 ${art.fileName || 'Sin archivo'}</small>
                </div>
                <span class="status-badge">${art.status}</span>
             </div>`
        ).join('');
    }

    [cite_start]// --- 3. LÓGICA DEL REVISOR (Usa IndexedDB - Offline Real) [cite: 73] ---
    function saveReviewOffline() {
        const article = document.getElementById('review-article-select').value;
        const comments = document.getElementById('review-comments').value;
        const decision = document.getElementById('review-decision').value;

        if (!article) return alert("Selecciona un artículo");

        const transaction = db.transaction(['evaluaciones'], 'readwrite');
        const store = transaction.objectStore('evaluaciones');
        
        const review = {
            articulo: article,
            comentarios: comments,
            decision: decision,
            fecha: new Date().toLocaleTimeString()
        };

        store.add(review); // ¡Aquí ocurre la magia offline!

        transaction.oncomplete = function() {
            alert("Borrador guardado en el dispositivo (IndexedDB).");
            document.getElementById('review-comments').value = ""; // Limpiar
        };
    }

    // Función extra para ver que sí se guardó (Simulación de sincronización)
    function syncReviews() {
        const transaction = db.transaction(['evaluaciones'], 'readonly');
        const store = transaction.objectStore('evaluaciones');
        const getAll = store.getAll();
        getAll.onsuccess = function() {
            console.log("Datos listos para enviar al servidor:", getAll.result);
            alert(`Hay ${getAll.result.length} revisiones guardadas localmente listas para enviarse.`);
        };
    }

    // --- 4. NAVEGACIÓN (Lo q.htmlue ya tenías) ---
    function navigate(viewName) {
        document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
        document.getElementById('role-selector').classList.add('hidden');
        
        if (viewName === 'home') {
            document.getElementById('role-selector').classList.remove('hidden');
        } else {
            const el = document.getElementById(`view-${viewName}`);
            if (el) el.classList.remove('hidden');
            if (viewName === 'editor') renderEditorList(); // Cargar lista al entrar
        }
    }

    function cargarRevisionesGuardadas() {
        // Solo para debug: muestra en consola si hay datos antiguos
        const transaction = db.transaction(['evaluaciones'], 'readonly');
        const store = transaction.objectStore('evaluaciones');
        store.count().onsuccess = (e) => {
            if(e.target.result > 0) console.log(`¡Tienes ${e.target.result} borradores guardados!`);
        };
    }