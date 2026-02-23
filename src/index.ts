import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "API de Express con TypeScript funcionando 🚀" });
});

// Ruta para que Next.js pida datos
app.get('/api/status', (req: Request, res: Response) => {
  res.json({ 
    status: "online",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});