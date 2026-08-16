import { sequelize } from '../src/db';
import { Player } from '../src/models';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This script reads your filled OVR ratings and updates the database
 * Supports both JSON and tab-separated Excel formats
 * 
 * Run: npx ts-node scripts/bulk-update-ovr.ts
 */

interface PlayerOVRUpdate {
  id: number;
  ovrRating: number;
}

async function bulkUpdateOVR() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Try to read JSON file first
    const jsonPath = path.join(__dirname, 'ovr-updates.json');
    let updates: PlayerOVRUpdate[] = [];

    if (fs.existsSync(jsonPath)) {
      console.log('📖 Reading JSON file...');
      const jsonData = fs.readFileSync(jsonPath, 'utf-8');
      updates = JSON.parse(jsonData);
      console.log(`✅ Found ${updates.length} player updates in JSON`);
    } else {
      // Try Excel format
      const excelPath = path.join(__dirname, 'ovr-updates-excel.txt');
      if (fs.existsSync(excelPath)) {
        console.log('📖 Reading Excel file...');
        const excelData = fs.readFileSync(excelPath, 'utf-8');
        const lines = excelData.split('\n').filter(line => line.trim() && !line.startsWith('ID'));
        
        updates = lines.map(line => {
          const [id, , , , , ovrRating] = line.split('\t');
          return {
            id: parseInt(id),
            ovrRating: parseInt(ovrRating)
          };
        }).filter(update => !isNaN(update.id) && !isNaN(update.ovrRating));
        
        console.log(`✅ Found ${updates.length} player updates in Excel file`);
      } else {
        console.error('❌ No update file found. Please create either:');
        console.log('   - ovr-updates.json (JSON format)');
        console.log('   - ovr-updates-excel.txt (Excel tab-separated format)');
        process.exit(1);
      }
    }

    // Validate updates
    console.log('\n🔍 Validating updates...');
    const validUpdates = updates.filter(update => {
      if (update.ovrRating < 1 || update.ovrRating > 120) {
        console.warn(`⚠️  Invalid OVR rating for player ${update.id}: ${update.ovrRating} (must be 1-120)`);
        return false;
      }
      return true;
    });

    console.log(`✅ ${validUpdates.length} valid updates to apply`);

    // Show preview
    console.log('\n📋 Preview of updates:');
    validUpdates.slice(0, 5).forEach(update => {
      console.log(`   Player ${update.id}: OVR ${update.ovrRating}`);
    });
    if (validUpdates.length > 5) {
      console.log(`   ... and ${validUpdates.length - 5} more`);
    }

    // Confirm
    console.log('\n⚠️  This will update player OVR ratings in the database.');
    console.log('Type "yes" to continue, anything else to cancel:');
    
    // For non-interactive environments, you can set a environment variable
    const autoConfirm = process.env.AUTO_CONFIRM === 'true';
    
    if (!autoConfirm) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const confirmation = await new Promise<string>((resolve) => {
        rl.question('', (answer) => {
          rl.close();
          resolve(answer);
        });
      });

      if (confirmation.toLowerCase() !== 'yes') {
        console.log('❌ Update cancelled');
        process.exit(0);
      }
    }

    // Update database
    console.log('\n🔄 Updating database...');
    let successCount = 0;
    let errorCount = 0;

    for (const update of validUpdates) {
      try {
        const result = await Player.update(
          { ovrRating: update.ovrRating },
          { where: { id: update.id } }
        );
        
        if (result[0] > 0) {
          successCount++;
          console.log(`✅ Updated player ${update.id} to OVR ${update.ovrRating}`);
        } else {
          console.warn(`⚠️  Player ${update.id} not found`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating player ${update.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n🎉 Update complete!');
    console.log(`✅ Successfully updated: ${successCount} players`);
    console.log(`❌ Failed updates: ${errorCount} players`);

  } catch (error) {
    console.error('❌ Error during bulk update:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

bulkUpdateOVR();