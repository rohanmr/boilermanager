const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'boiler_data.json');

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve static files from public directory

// Initialize data file if it doesn't exist
async function initializeDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch (error) {
        // File doesn't exist, create it with default structure
        const defaultData = {
            dailyLog: [],
            maintenance: [],
            inventory: [],
            efficiency: [],
            lastUpdated: new Date().toISOString()
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
        console.log('Created default data file');
    }
}

// Helper function to read data from JSON file
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        throw error;
    }
}

// Helper function to write data to JSON file
async function writeData(data) {
    try {
        data.lastUpdated = new Date().toISOString();
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data file:', error);
        throw error;
    }
}

// API Routes

// Get all data
app.get('/api/data', async (req, res) => {
    try {
        const data = await readData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Get specific section data
app.get('/api/data/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const data = await readData();
        
        if (data[section]) {
            res.json(data[section]);
        } else {
            res.status(404).json({ error: 'Section not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Save data for a specific section
app.post('/api/data/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const newData = req.body;
        
        const data = await readData();
        data[section] = newData;
        
        await writeData(data);
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Add new record to a specific section
app.post('/api/data/:section/add', async (req, res) => {
    try {
        const { section } = req.params;
        const newRecord = req.body;
        
        const data = await readData();
        
        if (!data[section]) {
            data[section] = [];
        }
        
        // Add timestamp and ID if not present
        if (!newRecord.id) {
            newRecord.id = Date.now().toString();
        }
        newRecord.createdAt = new Date().toISOString();
        
        data[section].push(newRecord);
        
        await writeData(data);
        res.json({ success: true, message: 'Record added successfully', id: newRecord.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add record' });
    }
});

// Update a specific record
app.put('/api/data/:section/:id', async (req, res) => {
    try {
        const { section, id } = req.params;
        const updatedRecord = req.body;
        
        const data = await readData();
        
        if (!data[section]) {
            return res.status(404).json({ error: 'Section not found' });
        }
        
        const recordIndex = data[section].findIndex(record => record.id === id);
        
        if (recordIndex === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        data[section][recordIndex] = { ...data[section][recordIndex], ...updatedRecord };
        data[section][recordIndex].updatedAt = new Date().toISOString();
        
        await writeData(data);
        res.json({ success: true, message: 'Record updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update record' });
    }
});

// Delete a specific record
app.delete('/api/data/:section/:id', async (req, res) => {
    try {
        const { section, id } = req.params;
        
        const data = await readData();
        
        if (!data[section]) {
            return res.status(404).json({ error: 'Section not found' });
        }
        
        const recordIndex = data[section].findIndex(record => record.id === id);
        
        if (recordIndex === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        data[section].splice(recordIndex, 1);
        
        await writeData(data);
        res.json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete record' });
    }
});

// Backup data
app.get('/api/backup', async (req, res) => {
    try {
        const data = await readData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilename = `boiler_backup_${timestamp}.json`;
        
        res.setHeader('Content-Disposition', `attachment; filename="${backupFilename}"`);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data, null, 2));
    } catch (error) {
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// Import data
app.post('/api/import', async (req, res) => {
    try {
        const importedData = req.body;
        
        // Validate data structure
        const requiredSections = ['dailyLog', 'maintenance', 'inventory', 'efficiency'];
        const hasAllSections = requiredSections.every(section => 
            importedData.hasOwnProperty(section) && Array.isArray(importedData[section])
        );
        
        if (!hasAllSections) {
            return res.status(400).json({ error: 'Invalid data structure' });
        }
        
        await writeData(importedData);
        res.json({ success: true, message: 'Data imported successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to import data' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
    await initializeDataFile();
    app.listen(PORT, () => {
        console.log(`Boiler Management Server running on port ${PORT}`);
        console.log(`Data file: ${DATA_FILE}`);
    });
}

startServer().catch(console.error);