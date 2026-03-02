// server.js - Backend para la Meta 1.7
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a MariaDB
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Tu usuario de XAMPP/MariaDB
    password: '',      // Tu contraseña
    database: 'sistema_revisiones'
});

// Endpoint que recibe la sincronización
app.post('/api/sync', async (req, res) => {
    const revisiones = req.body; // Array de evaluaciones pendientes
    
    try {
        const connection = await pool.getConnection();
        
        // Insertar cada revisión en MariaDB
        for (const rev of revisiones) {
            await connection.execute(
                'INSERT INTO evaluaciones (articulo, comentarios, decision, fecha) VALUES (?, ?, ?, ?)',
                [rev.articulo, rev.comentarios, rev.decision, rev.fecha]
            );
        }
        
        connection.release();
        console.log(`Se sincronizaron ${revisiones.length} revisiones.`);
        res.status(200).json({ message: 'Sincronización completa' });
        
    } catch (error) {
        console.error("Error en BD:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(3000, () => {
    console.log('🚀 Servidor Node.js corriendo en http://localhost:3000');
});