import { sequelize } from '../src/db';
import { Player } from '../src/models';

/**
 * This script generates a template file with all current players
 * showing their ID, name, team, and position so you can easily fill in OVR ratings
 * 
 * Run: npx ts-node scripts/generate-ovr-template.ts
 */

async function generateOVRTemplate() {
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

    // Generate JSON template
    const template = players.map(player => ({
      id: player.id,
      name: player.name,
      team: player.team,
      position: player.position,
      cardType: player.cardType,
      ovrRating: null // Fill this in with the actual rating
    }));

    // Generate Excel-friendly format
    let excelTemplate = 'ID\tName\tTeam\tPosition\tCard Type\tOVR Rating\n';
    excelTemplate += '===\t====\t====\t========\t=========\t==========\n';
    
    players.forEach(player => {
      excelTemplate += `${player.id}\t${player.name}\t${player.team}\t${player.position}\t${player.cardType}\t\n`;
    });

    // Write files
    const fs = require('fs');
    const path = require('path');

    // JSON template
    const jsonPath = path.join(__dirname, 'ovr-template.json');
    fs.writeFileSync(jsonPath, JSON.stringify(template, null, 2));
    console.log(`✅ JSON template saved to: ${jsonPath}`);

    // Excel template (tab-separated)
    const excelPath = path.join(__dirname, 'ovr-template-excel.txt');
    fs.writeFileSync(excelPath, excelTemplate);
    console.log(`✅ Excel template saved to: ${excelPath}`);

    console.log('\n📋 INSTRUCTIONS:');
    console.log('1. Open ovr-template-excel.txt in Excel');
    console.log('2. Fill in the OVR Rating column (1-120)');
    console.log('3. Save as tab-separated text file');
    console.log('4. Run the bulk update script');
    console.log('\n📋 OR use the JSON template:');
    console.log('1. Open ovr-template.json');
    console.log('2. Fill in the ovrRating field for each player');
    console.log('3. Run the bulk update script');

  } catch (error) {
    console.error('❌ Error generating template:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

generateOVRTemplate();