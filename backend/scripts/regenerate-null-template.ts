import { sequelize } from '../src/db';
import { Player } from '../src/models';

/**
 * This script regenerates the template with null OVR values
 * Run: npx ts-node scripts/regenerate-null-template.ts
 */

async function regenerateNullTemplate() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('Fetching all players...');
    const players = await Player.findAll({
      attributes: ['id', 'name', 'team', 'position', 'cardType'],
      order: [['id', 'ASC']]
    });

    console.log(`Found ${players.length} players`);

    // Generate template with null OVR values
    const template = players.map(player => ({
      id: player.id,
      name: player.name,
      team: player.team,
      position: player.position,
      cardType: player.cardType,
      ovrRating: null // Always null in template
    }));

    const fs = require('fs');
    const path = require('path');

    const jsonPath = path.join(__dirname, 'ovr-template.json');
    fs.writeFileSync(jsonPath, JSON.stringify(template, null, 2));
    console.log(`✅ Template regenerated with null OVR values: ${jsonPath}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

regenerateNullTemplate();