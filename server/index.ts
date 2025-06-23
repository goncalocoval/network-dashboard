// index.ts
import app from './src/app';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend ativo na porta ${PORT}`);
});
