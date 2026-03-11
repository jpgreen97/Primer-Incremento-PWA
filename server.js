// server.js - Backend para la Meta 1.9
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());

//  Aumentamos el límite a 50MB para que acepte los PDFs en Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuración de conexión a MariaDB
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // usuario de XAMPP/MariaDB
    password: '',      // contraseña
    database: 'sistema_revisiones'
});

// ---------------------------------------------------------
// 1. RUTA PARA OBTENER LOS ARTÍCULOS (PULL - Para tu Laptop)
// ---------------------------------------------------------
app.get('/api/articulos', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM articulos');
        connection.release();
        
        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Error al obtener artículos:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ---------------------------------------------------------
// 2. RUTA PARA GUARDAR UN NUEVO ARTÍCULO (PUSH - Desde el celular)
// ---------------------------------------------------------
app.post('/api/articulos', async (req, res) => {
    const art = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        await connection.execute(
            'INSERT INTO articulos (id, title, fileName, fileData, status, revisorComments, revisorDecision, editorComments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [art.id, art.title, art.fileName, art.fileData, art.status, art.revisorComments, art.revisorDecision, art.editorComments]
        );
        
        connection.release();
        console.log(`✅ Artículo "${art.title}" guardado en la BD.`);
        res.status(200).json({ message: 'Artículo guardado en BD' });
        
    } catch (error) {
        console.error("❌ Error al guardar el artículo:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ---------------------------------------------------------
// 3. RUTA ORIGINAL PARA LAS REVISIONES DEL REVISOR
// ---------------------------------------------------------
app.post('/api/sync', async (req, res) => {
    const revisiones = req.body.reviews ? req.body.reviews : req.body; 
    
    try {
        const connection = await pool.getConnection();
        
        for (const rev of revisiones) {
            // Guardamos la evaluación
            await connection.execute(
                'INSERT INTO evaluaciones (articulo_id, comentarios, decision, fecha) VALUES (?, ?, ?, ?)',
                [rev.articulo_id, rev.comentarios, rev.decision, rev.fecha]
            );
            
            // Opcional pero recomendado: Actualizar el estado del artículo a "Revisado"
            await connection.execute(
                'UPDATE articulos SET status = ?, revisorComments = ?, revisorDecision = ? WHERE id = ?',
                ['Revisado', rev.comentarios, rev.decision, rev.articulo_id]
            );
        }
        
        connection.release();
        console.log(`✅ Se sincronizaron ${revisiones.length} revisiones del Revisor.`);
        res.status(200).json({ message: 'Sincronización completa' });
        
    } catch (error) {
        console.error("❌ Error en BD:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ---------------------------------------------------------
// 4. RUTA PARA ACTUALIZAR LA DECISIÓN DEL EDITOR
// ---------------------------------------------------------
app.put('/api/articulos/:id', async (req, res) => {
    const { status, editorComments } = req.body;
    try {
        const connection = await pool.getConnection();
        // Actualizamos solo el estado y el comentario final del artículo
        await connection.execute(
            'UPDATE articulos SET status = ?, editorComments = ? WHERE id = ?',
            [status, editorComments, req.params.id]
        );
        connection.release();
        console.log(`✅ Decisión del Editor guardada para el artículo ${req.params.id}`);
        res.status(200).json({ message: 'Decisión del editor guardada en BD' });
    } catch (error) {
        console.error("❌ Error al actualizar editor:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(3000, () => {
    console.log('🚀 Servidor Node.js corriendo en http://localhost:3000');
});