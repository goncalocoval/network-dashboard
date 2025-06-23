// src/app.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import logsRoutes from './routes/logsRoutes';
import vpnRoutes from './routes/vpnRoutes';
import sshRoutes from './routes/sshRoutes';
import networkRoutes from './routes/networkRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// CORS dinâmico
const allowedOrigins = [
  'http://localhost:3000',
  'https://network-dashboard-ecru.vercel.app',
  'https://supposedly-trusted-albacore.ngrok-free.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/vpn', vpnRoutes);
app.use('/api/ssh', sshRoutes);
app.use('/api/network', networkRoutes);

app.get('/', (req, res) => {
  res.send('API da dashboard ativa!');
});

export default app;
