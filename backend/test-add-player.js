// Simple test script to add a player with image upload
const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

const ADMIN_TOKEN = 'dev-secret-token-change-in-production';

// Test data for new player
const playerData = {
  name: 'Cristiano Ronaldo',
  team: 'real madrid',
  position: 'LWF',
  age: 32,
  cardType: 'epic-big time',
  apps: 850,
  goal: 450,
  assists: 120
};

// Create form data
const form = new FormData();
Object.keys(playerData).forEach(key => {
  form.append(key, playerData[key]);
});

// Add a dummy image file (you can replace with real image)
const dummyImagePath = 'test-image.jpg';
fs.writeFileSync(dummyImagePath, 'dummy image content');
form.append('image', fs.createReadStream(dummyImagePath));

// Make request
const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/players',
  method: 'POST',
  headers: {
    'x-admin-token': ADMIN_TOKEN,
    ...form.getHeaders()
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', JSON.stringify(JSON.parse(data), null, 2));
    
    // Clean up
    fs.unlinkSync(dummyImagePath);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
  fs.unlinkSync(dummyImagePath);
});

form.pipe(req);
