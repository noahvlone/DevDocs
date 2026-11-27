import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT || 3001);

app.listen(PORT, () => {
  console.log(`[DevDocs Server] Backend API running at http://localhost:${PORT}`);
});
