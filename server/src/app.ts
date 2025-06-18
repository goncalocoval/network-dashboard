// src/app.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import deviceRoutes from './routes/deviceRoutes';
import logsRoutes from './routes/logsRoutes';
import vpnRoutes from './routes/vpnRoutes';
import sshRoutes from './routes/sshRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/vpn', vpnRoutes);
app.use('/api/ssh', sshRoutes);

app.get('/', (req, res) => {
  res.send('API da dashboard ativa!');
});

export default app;