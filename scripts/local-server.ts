import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

// Serve static files from 'src/services/trade/samples' directory
app.use(express.static(path.join(__dirname, '../src/services/trade/samples')));

app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
});
