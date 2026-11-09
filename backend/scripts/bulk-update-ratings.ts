import { sequelize } from '../src/db';
import { Player } from '../src/models';
import * as fs from 'fs';
import * as path from 'path';

interface RatingUpdate {
  id: number;
  name: string;
  age: number;
  ovrRating: number | null;
}

async function bulkUpdateRatings() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Read the rating updates file
    const ratingUpdatesPath = path.join(__dirname, 'rating-template.json');
    const ratingUpdates: RatingUpdate[] = JSON.parse(fs.readFileSync(ratingUpdatesPath, 'utf-8'));

    console.log(`📖 Loaded ${ratingUpdates.length} players from rating-template.json`);

    // Validate ratings
    const invalidRatings = ratingUpdates.filter(p => {
      if (p.ovrRating === null) return false;
      return p.ovrRating < 1 || p.ovrRating > 120;
    });

    if (invalidRatings.length > 0) {
      console.log('❌ Invalid ratings found (must be 1-120):');
      invalidRatings.forEach(p => {
        console.log(`  ID ${p.id}: ${p.name} - Rating: ${p.ovrRating}`);
      });
      process.exit(1);
    }

    // Filter players that need updates (have non-null ratings)
    const playersToUpdate = ratingUpdates.filter(p => p.ovrRating !== null);
    console.log(`📊 Players to update: ${playersToUpdate.length}`);

    // Preview the updates
    console.log('\n📋 Preview of updates:');
    playersToUpdate.slice(0, 10).forEach(p => {
      console.log(`  ID ${p.id}: ${p.name} → Rating: ${p.ovrRating}`);
    });
    if (playersToUpdate.length > 10) {
      console.log(`  ... and ${playersToUpdate.length - 10} more`);
    }

    // Auto-confirm since we've already validated
    console.log('\n✅ Proceeding with updates...');

    // Apply updates
    console.log('\n🔄 Applying updates...');
    let successCount = 0;
    let failCount = 0;

    for (const update of playersToUpdate) {
      try {
        await Player.update(
          { ovr_rating: update.ovrRating },
          { where: { id: update.id } }
        );
        console.log(`✅ Updated player ${update.id} to OVR ${update.ovrRating}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to update player ${update.id}: ${error}`);
        failCount++;
      }
    }

    console.log('\n🎉 Update complete!');
    console.log(`✅ Successfully updated: ${successCount} players`);
    console.log(`❌ Failed updates: ${failCount} players`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed');
  }
}

bulkUpdateRatings();
