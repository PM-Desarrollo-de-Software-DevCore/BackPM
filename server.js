const express = require('express');
const cors = require('cors');
const { connectDB, sql } = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend de DevCore funcionando');
});

app.get('/proyectos', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM Proyecto');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error real en /proyectos:', error);
    res.status(500).json({ error: error.message });
  }
});

async function start() {
  try {
    await connectDB();
    app.listen(3001, () => {
      console.log('Servidor corriendo en http://localhost:3001');
    });
  } catch (error) {
    console.error('No se pudo iniciar por error de conexión a BD:', error);
  }
}

start();