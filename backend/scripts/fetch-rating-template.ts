import { sequelize } from '../src/db';
import { Player } from '../src/models';

async function fetchRatingTemplate() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('Fetching all players...');
    const players = await Player.findAll({
      attributes: ['id', 'name', 'age', 'ovr_rating'],
      order: [['id', 'ASC']]
    });

    console.log(`Found ${players.length} players in database`);

    // Format for JSON output
    const template = players.map(player => ({
      id: player.id,
      name: player.name,
      age: player.age,
      ovrRating: player.ovr_rating
    }));

    // Count players with and without ratings
    const withRating = template.filter(p => p.ovrRating !== null).length;
    const withoutRating = template.filter(p => p.ovrRating === null).length;

    console.log(`\n📊 Summary:`);
    console.log(`- Total players: ${players.length}`);
    console.log(`- Players with ratings: ${withRating}`);
    console.log(`- Players without ratings: ${withoutRating}`);

    // Write to JSON file
    const fs = require('fs');
    const outputPath = 'scripts/rating-template.json';
    fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));
    console.log(`\n✅ Template saved to: ${outputPath}`);

    // Show sample of players without ratings
    const playersNeedingRatings = template.filter(p => p.ovrRating === null);
    if (playersNeedingRatings.length > 0) {
      console.log(`\n📋 First 10 players needing ratings:`);
      playersNeedingRatings.slice(0, 10).forEach(p => {
        console.log(`  ID ${p.id}: ${p.name} (Age: ${p.age})`);
      });
      if (playersNeedingRatings.length > 10) {
        console.log(`  ... and ${playersNeedingRatings.length - 10} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed');
  }
}

fetchRatingTemplate();
