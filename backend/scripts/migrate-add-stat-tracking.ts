import { sequelize } from '../src/db';
import { PlayerStatUpdate, PlayerStatSnapshot } from '../src/models';

/**
 * This script creates the new tables for stat tracking:
 * - player_stat_updates: logs all stat changes (goals, assists, apps)
 * - player_stat_snapshots: stores snapshots of player stats
 *
 * Run: npx ts-node scripts/migrate-add-stat-tracking.ts
 */

async function migrateDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('🔄 Running database migration...');

    // Create player_stat_updates table
    console.log('Creating player_stat_updates table...');
    await PlayerStatUpdate.sync({ alter: true });
    console.log('✅ player_stat_updates table created');

    // Create player_stat_snapshots table
    console.log('Creating player_stat_snapshots table...');
    await PlayerStatSnapshot.sync({ alter: true });
    console.log('✅ player_stat_snapshots table created');

    console.log('\n🎉 Migration completed successfully!');
    console.log('📋 New tables added:');
    console.log('   - player_stat_updates (tracks stat changes)');
    console.log('   - player_stat_snapshots (stores stat snapshots)');
    console.log('\n📋 Tables support tracking for: goals, assists, apps');

  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Migration error:', error.message);
      console.error(error.stack);
    } else {
      console.error('❌ Unknown error:', error);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrateDatabase();
