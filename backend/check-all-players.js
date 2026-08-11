const http = require('http');

http.get('http://localhost:8000/api/players', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const players = JSON.parse(data);
    
    console.log('Total players in database:', players.length);
    console.log('\nPlayers with images:');
    players.forEach(card => {
      if (card.image) {
        console.log(`ID: ${card.id} - ${card.displayName} - Image: ${card.image}`);
      }
    });
    
    console.log('\nPlayers without images:');
    players.forEach(card => {
      if (!card.image) {
        console.log(`ID: ${card.id} - ${card.displayName} - No image`);
      }
    });
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});