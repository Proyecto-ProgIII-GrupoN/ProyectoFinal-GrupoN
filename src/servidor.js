import app from './reservas.js';
import dotenv from 'dotenv';

dotenv.config(); 

const PORT = Number(process.env.PUERTO) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor levantado en puerto --> ${PORT}`);
});
