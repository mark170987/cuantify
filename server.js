// server.js - Backend simple para reemplazar Firebase
// Instalar dependencias: npm install express pg cors body-parser

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la Base de Datos (PostgreSQL)
// Estas variables las inyecta Coolify automáticamente o las defines tú
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  // O configuración manual:
  // user: process.env.POSTGRES_USER,
  // host: process.env.POSTGRES_HOST,
  // database: process.env.POSTGRES_DB,
  // password: process.env.POSTGRES_PASSWORD,
  // port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// --- INICIALIZACIÓN DE TABLAS (Solo primera vez) ---
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS catalogo (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        unidad TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS matrices (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        unidad TEXT NOT NULL,
        insumos JSONB -- Guardamos los insumos como JSON para facilitar la migración
      );
    `);
    console.log("Tablas verificadas/creadas correctamente.");
  } catch (err) {
    console.error("Error iniciando DB:", err);
  }
};
initDB();

// --- RUTAS API (Endpoints que llamará tu React) ---

// 1. CATÁLOGO
app.get('/api/catalogo', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM catalogo ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/catalogo', async (req, res) => {
  const { nombre, unidad } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO catalogo (nombre, unidad) VALUES ($1, $2) RETURNING *',
      [nombre, unidad]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).send(err.message); }
});

app.delete('/api/catalogo/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM catalogo WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).send(err.message); }
});

// 2. MATRICES
app.get('/api/matrices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM matrices ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/matrices', async (req, res) => {
  const { nombre, unidad, insumos } = req.body;
  try {
    // Guardamos el array de insumos directamente como un objeto JSON
    const result = await pool.query(
      'INSERT INTO matrices (nombre, unidad, insumos) VALUES ($1, $2, $3) RETURNING *',
      [nombre, unidad, JSON.stringify(insumos)]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).send(err.message); }
});

app.put('/api/matrices/:id', async (req, res) => {
  const { nombre, unidad, insumos } = req.body;
  try {
    const result = await pool.query(
      'UPDATE matrices SET nombre=$1, unidad=$2, insumos=$3 WHERE id=$4 RETURNING *',
      [nombre, unidad, JSON.stringify(insumos), req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).send(err.message); }
});

app.delete('/api/matrices/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM matrices WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).send(err.message); }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Backend corriendo en puerto ${port}`);
});