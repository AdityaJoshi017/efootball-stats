import { sequelize } from '../src/db';
import { Player } from '../src/models';

async function debugDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('\n🔍 Checking database type...');
    console.log('Dialect:', sequelize.getDialect());
    console.log('Database name:', sequelize.getDatabaseName());

    console.log('\n🔍 Testing Player.findById...');
    const player1 = await Player.findByPk(1);
    console.log('Player 1:', player1 ? `Found: ${player1.name}` : 'Not found');

    console.log('\n🔍 Testing Player.findAll...');
    const allPlayers = await Player.findAll({ limit: 5 });
    console.log('First 5 players:');
    allPlayers.forEach(p => console.log(`   ID: ${p.id}, Name: ${p.name}`));

    console.log('\n🔍 Testing Player.update...');
    const testUpdate = await Player.update(
      { ovr_rating: 99 },
      { where: { id: 1 } }
    );
    console.log('Update result:', testUpdate);

    // Revert the test update
    await Player.update(
      { ovr_rating: null },
      { where: { id: 1 } }
    );
    console.log('✅ Test update reverted');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

debugDatabase();