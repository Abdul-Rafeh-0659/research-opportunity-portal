require('dotenv').config();

const express = require('express');
const path = require('path');
const opportunityRoutes = require('./routes/opportunityRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow JSON request bodies
app.use(express.json());

// Register API endpoints
app.use('/api/opportunities', opportunityRoutes);

// Serve frontend files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Handle unknown API endpoints
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
