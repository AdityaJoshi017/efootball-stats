const http = require('http');

const ADMIN_TOKEN = 'dev-secret-token-change-in-production';

// IDs of duplicate Haaland cards to delete
const duplicateIds = [52, 53, 59, 60];

async function deletePlayer(id) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: `/api/players/${id}`,
      method: 'DELETE',
      headers: {
        'x-admin-token': ADMIN_TOKEN
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✓ Deleted player ID ${id}`);
          resolve();
        } else {
          console.log(`✗ Failed to delete player ID ${id}:`, res.statusCode, data);
          reject(new Error(`Failed to delete player ${id}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`Error deleting player ${id}:`, err.message);
      reject(err);
    });
    req.end();
  });
}

async function deleteAllDuplicates() {
  console.log('Deleting duplicate Haaland cards...');
  console.log('IDs to delete:', duplicateIds);
  
  for (const id of duplicateIds) {
    try {
      await deletePlayer(id);
    } catch (error) {
      console.error(`Failed to delete ${id}, continuing...`);
    }
  }
  
  console.log('\n✅ Deletion process completed');
}

deleteAllDuplicates();