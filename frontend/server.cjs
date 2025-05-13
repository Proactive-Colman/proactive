const express = require('express');
const path = require('path');
const app = express();

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// For client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
