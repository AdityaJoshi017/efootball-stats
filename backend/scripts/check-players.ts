import { sequelize } from '../src/db';
import { Player } from '../src/models';

async function checkPlayers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const count = await Player.count();
    console.log(`📊 Total players: ${count}`);

    const recentPlayers = await Player.findAll({
      attributes: ['id', 'name', 'createdAt'],
      order: [['id', 'DESC']],
      limit: 10
    });

    console.log('\n📋 Most recent players:');
    recentPlayers.forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}, Created: ${p.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkPlayers();