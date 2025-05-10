import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('API online'));
app.listen(3001, () => console.log('Servidor a correr na porta 3001'));