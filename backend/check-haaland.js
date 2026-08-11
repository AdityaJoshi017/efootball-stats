const http = require('http');

const ADMIN_TOKEN = 'dev-secret-token-change-in-production';

// Test adding duplicate Haaland cards
function testAddDuplicateHaaland() {
  const playerData = JSON.stringify({
    name: 'Erling Haaland',
    team: 'man city',
    position: 'CF',
    age: 25,
    cardType: 'epic-big time',
    apps: 102,
    goal: 94,
    assists: 14
  });

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/players',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(playerData),
      'x-admin-token': ADMIN_TOKEN
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 201) {
        const result = JSON.parse(data);
        console.log('✓ Haaland card created successfully!');
        console.log('  ID:', result.player.id);
        console.log('  Card Slug:', result.player.cardSlug);
        console.log('  Display Name:', result.player.displayName);
      } else {
        console.log('✗ Failed to create Haaland card:', res.statusCode, data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('Error:', err.message);
  });
  req.write(playerData);
  req.end();
}

// Get all Haaland cards
function getHaalandCards() {
  http.get('http://localhost:8000/api/players', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const players = JSON.parse(data);
      const haalandCards = players.filter(p => p.name.toLowerCase().includes('haaland'));
      
      console.log('\nFound', haalandCards.length, 'Haaland cards:');
      haalandCards.forEach(card => {
        console.log(`\nID: ${card.id}`);
        console.log(`Name: ${card.displayName}`);
        console.log(`Card Slug: ${card.cardSlug}`);
        console.log(`Team: ${card.team} | Position: ${card.position} | Age: ${card.age} | Card Type: ${card.cardType}`);
        console.log(`Stats: Apps: ${card.apps}, Goals: ${card.goal}, Assists: ${card.assists}`);
      });
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

console.log('Testing duplicate player card creation...\n');

// Add the same Haaland card twice
testAddDuplicateHaaland();
setTimeout(() => testAddDuplicateHaaland(), 1000); // Add second duplicate after 1 second

// Check all Haaland cards after 2 seconds
setTimeout(() => getHaalandCards(), 2000);
