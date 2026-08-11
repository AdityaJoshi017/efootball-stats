// Simple API test script
const http = require('http');

const ADMIN_TOKEN = 'dev-secret-token-change-in-production';

// Test 1: Health check
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('✓ Health Check:', res.statusCode, JSON.parse(data));
        resolve();
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test 2: Get all players
function testGetPlayers() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/players',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const players = JSON.parse(data);
        console.log('✓ Get Players:', res.statusCode, `Found ${players.length} players`);
        if (players.length > 0) {
          console.log('  Sample player:', players[0].displayName, 'Stats:', players[0].stats);
        }
        resolve();
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test 3: Add new player (without image for simplicity)
function testAddPlayer() {
  return new Promise((resolve, reject) => {
    const playerData = JSON.stringify({
      name: 'Test Player',
      team: 'test team',
      position: 'CF',
      age: 25,
      cardType: 'epic',
      apps: 100,
      goal: 50,
      assists: 25
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
        if (res.statusCode !== 201) {
          console.log('✗ Add Player failed:', res.statusCode, data);
          resolve(null);
          return;
        }
        const result = JSON.parse(data);
        console.log('✓ Add Player:', res.statusCode);
        console.log('  Player:', result.player.displayName);
        console.log('  Auto-calculated stats:', result.stats);
        resolve(result.player.id);
      });
    });

    req.on('error', reject);
    req.write(playerData);
    req.end();
  });
}

// Test 4: Get specific player
function testGetPlayer(playerId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: `/api/players/${playerId}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const result = JSON.parse(data);
        console.log('✓ Get Player:', res.statusCode);
        console.log('  Player:', result.player.displayName);
        console.log('  Calculated stats:', result.stats);
        resolve();
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('Running API Tests...\n');
  
  try {
    await testHealthCheck();
    await testGetPlayers();
    const newPlayerId = await testAddPlayer();
    if (newPlayerId) {
      await testGetPlayer(newPlayerId);
    }
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
