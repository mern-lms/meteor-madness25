const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Frontend server running on http://localhost:${PORT}`);
    console.log(`📡 API server should be running on http://localhost:8080`);
    console.log(`\n🚀 Open http://localhost:${PORT} to view the application`);
});
