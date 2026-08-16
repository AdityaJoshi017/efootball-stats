import { sequelize } from '../src/db';
import { Player } from '../src/models';

async function checkMissingIds() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const allPlayers = await Player.findAll({
      attributes: ['id', 'name'],
      order: [['id', 'ASC']]
    });

    const allIds = allPlayers.map(p => p.id);
    const maxId = Math.max(...allIds);
    
    console.log(`📊 Total players: ${allPlayers.length}`);
    console.log(`📊 Highest ID: ${maxId}`);
    
    const missingIds = [];
    for (let i = 1; i <= maxId; i++) {
      if (!allIds.includes(i)) {
        missingIds.push(i);
      }
    }

    if (missingIds.length > 0) {
      console.log(`\n⚠️  Missing IDs (${missingIds.length}):`);
      console.log(missingIds.join(', '));
    } else {
      console.log('\n✅ No missing IDs - all IDs from 1 to max are present');
    }

    console.log('\n📋 All current players:');
    allPlayers.forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkMissingIds();