import { sequelize } from '../src/db';
import { Player } from '../src/models';
import { DataTypes } from 'sequelize';

/**
 * This script adds the new columns (account_id and ovr_rating) to the database
 * and sets default values for existing players
 * 
 * Run: npx ts-node scripts/migrate-add-new-fields.ts
 */

async function migrateDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('🔄 Running database migration...');
    
    // Add account_id column with default value 1
    console.log('Adding account_id column...');
    await sequelize.getQueryInterface().addColumn('players', 'account_id', {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    });
    console.log('✅ account_id column added');

    // Add ovr_rating column (nullable)
    console.log('Adding ovr_rating column...');
    await sequelize.getQueryInterface().addColumn('players', 'ovr_rating', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    console.log('✅ ovr_rating column added');

    // Update existing players to have account_id = 1
    console.log('Setting account_id = 1 for existing players...');
    const [updateCount] = await sequelize.query(
      "UPDATE players SET account_id = 1 WHERE account_id IS NULL"
    );
    console.log(`✅ Updated ${updateCount} existing players to account_id = 1`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('📋 New columns added:');
    console.log('   - account_id (INTEGER, default 1)');
    console.log('   - ovr_rating (INTEGER, nullable, 1-120 range)');
    console.log('\n📋 All existing players have been assigned to account 1');

  } catch (error) {
    if (error instanceof Error) {
      // Check if columns already exist
      if (error.message.includes('duplicate column') || error.message.includes('already exists')) {
        console.log('⚠️  Columns already exist in database. Migration may have already been run.');
        console.log('✅ No action needed - database is already up to date');
      } else {
        console.error('❌ Migration error:', error);
        process.exit(1);
      }
    } else {
      console.error('❌ Unknown error:', error);
      process.exit(1);
    }
  } finally {
    await sequelize.close();
  }
}

migrateDatabase();