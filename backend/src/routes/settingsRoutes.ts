import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const settingsFilePath = path.join(__dirname, '../../data/columnSettings.json');

// Endpoint to get the settings
router.get('/', (req, res) => {
  fs.readFile(settingsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to read settings');
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to update the settings
router.post('/', (req, res) => {
  const newSettings = req.body;
  fs.writeFile(settingsFilePath, JSON.stringify(newSettings, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to update settings');
    }
    res.send('Settings updated successfully');
  });
});

export default router;