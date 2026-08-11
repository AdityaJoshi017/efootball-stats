import { Player } from '../src/models';
import { sequelize } from '../src/db';
import { computeStatsFromAggregates } from '../src/utils/stats';
import * as fs from 'fs';
import * as path from 'path';

// Read the frontend players data file
const frontendDataPath = path.join(__dirname, '../../lib/players-data.ts');

// Simple parser to extract the playersData array from the TypeScript file
function extractPlayersData(fileContent: string): any[] {
  // Find the playersData array
  const match = fileContent.match(/export const playersData: Player\[] = (\[[\s\S]*\]);/);
  if (!match) {
    throw new Error('Could not find playersData in the file');
  }
  
  // Parse the array (this is a simple approach, might need refinement for complex data)
  try {
    // Remove the export statement and parse as JSON after cleaning up
    const arrayString = match[1];
    // Replace TypeScript-specific syntax with JavaScript
    const jsonString = arrayString
      .replace(/'/g, '"')  // Replace single quotes with double quotes
      .replace(/(\w+):/g, '"$1":')  // Add quotes around keys
      .replace(/,\s*}/g, '}')  // Remove trailing commas
      .replace(/,\s*]/g, ']');  // Remove trailing commas in arrays
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing players data:', error);
    throw new Error('Failed to parse players data');
  }
}

const importFrontendData = async () => {
  try {
    console.log('Starting frontend data import...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Read frontend data file
    if (!fs.existsSync(frontendDataPath)) {
      throw new Error(`Frontend data file not found: ${frontendDataPath}`);
    }

    const fileContent = fs.readFileSync(frontendDataPath, 'utf-8');
    console.log('Read frontend data file successfully.');

    // Extract players data
    const playersData = extractPlayersData(fileContent);
    console.log(`Found ${playersData.length} players in frontend data.`);

    // Sync database (without force to preserve existing data)
    await sequelize.sync();
    console.log('Database synchronized.');

    // Count existing players
    const existingCount = await Player.count();
    console.log(`Existing players in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log('Database already contains data. Skipping import to avoid duplicates.');
      console.log('If you want to re-import, drop the database first.');
      return;
    }

    // Import players
    let successCount = 0;
    let errorCount = 0;

    for (const playerData of playersData) {
      try {
        // Map frontend fields to backend fields
        const player = await Player.create({
          name: playerData.name,
          team: playerData.team || 'N/A',
          position: playerData.position,
          age: playerData.age,
          cardType: playerData.cardType,
          apps: playerData.apps || 0,
          goal: playerData.goal || 0,
          assists: playerData.assists || 0,
          image: playerData.image,
        });

        const stats = computeStatsFromAggregates(player);
        
        console.log(`✓ Imported: ${player.name} (${player.position}) - gPm: ${stats.gPm.toFixed(3)}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to import ${playerData.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\nImport completed:`);
    console.log(`✓ Successfully imported: ${successCount} players`);
    console.log(`✗ Failed: ${errorCount} players`);
    
    // Verify the import
    const totalCount = await Player.count();
    console.log(`\nTotal players in database: ${totalCount}`);
    
    // Show sample data
    const samplePlayers = await Player.findAll({ limit: 3 });
    console.log('\nSample imported players:');
    samplePlayers.forEach(player => {
      const stats = computeStatsFromAggregates(player);
      console.log(`- ${player.name} (${player.team}, ${player.position}): gPm=${stats.gPm.toFixed(3)}, aPm=${stats.aPm.toFixed(3)}`);
    });
    
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

// Alternative approach: Import using a JSON file
const importFromJson = async () => {
  try {
    console.log('Starting JSON data import...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Check if JSON file exists
    const jsonPath = path.join(__dirname, 'players-data.json');
    if (!fs.existsSync(jsonPath)) {
      console.log('JSON file not found. Please create players-data.json from your frontend data.');
      console.log('You can copy the playersData array to a JSON file.');
      return;
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const playersData = JSON.parse(jsonData);
    console.log(`Found ${playersData.length} players in JSON file.`);

    // Sync database
    await sequelize.sync({ force: true }); // This will drop existing tables
    console.log('Database synchronized (with force reset).');

    // Import players
    for (const playerData of playersData) {
      const player = await Player.create({
        name: playerData.name,
        team: playerData.team || 'N/A',
        position: playerData.position,
        age: playerData.age,
        cardType: playerData.cardType,
        apps: playerData.apps || 0,
        goal: playerData.goal || 0,
        assists: playerData.assists || 0,
        image: playerData.image,
      });

      const stats = computeStatsFromAggregates(player);
      console.log(`✓ Imported: ${player.name} - gPm: ${stats.gPm.toFixed(3)}`);
    }

    const totalCount = await Player.count();
    console.log(`\nTotal players imported: ${totalCount}`);
    
  } catch (error) {
    console.error('Error during JSON import:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--json')) {
  importFromJson();
} else {
  importFrontendData();
}
