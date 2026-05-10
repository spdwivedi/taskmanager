import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the compiled Vite files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// The Ultimate Catch-All: Bypasses Express 5's broken regex engine entirely
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend Express server running securely on port ${PORT}`);
});