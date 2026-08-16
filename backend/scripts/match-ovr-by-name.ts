import * as fs from 'fs';
import * as path from 'path';

/**
 * This script matches OVR ratings from your old file to the new template by player name
 * Run: npx ts-node scripts/match-ovr-by-name.ts
 */

interface PlayerOVR {
  id: number;
  name: string;
  team: string;
  position: string;
  cardType: string;
  ovrRating?: number | null;
}

async function matchOVRByName() {
  try {
    const templatePath = path.join(__dirname, 'ovr-template.json');
    const updatesPath = path.join(__dirname, 'ovr-updates.json');
    const outputPath = path.join(__dirname, 'ovr-updates-matched.json');

    // Read files
    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8')) as PlayerOVR[];
    const updatesData = JSON.parse(fs.readFileSync(updatesPath, 'utf-8')) as PlayerOVR[];

    console.log(`📖 Template: ${templateData.length} players`);
    console.log(`📖 Updates: ${updatesData.length} players`);

    // Create a map of player name -> OVR rating from the old data
    const ovrMap = new Map<string, number>();
    updatesData.forEach(player => {
      if (player.ovrRating !== null && player.ovrRating !== undefined) {
        ovrMap.set(player.name.toLowerCase(), player.ovrRating);
      }
    });

    console.log(`📊 Found ${ovrMap.size} players with OVR ratings in old data`);

    // Match OVR ratings to new template by name
    const matchedData = templateData.map(player => {
      const matchedOVR = ovrMap.get(player.name.toLowerCase());
      return {
        id: player.id, // Use ID from template (correct database IDs)
        name: player.name,
        team: player.team,
        position: player.position,
        cardType: player.cardType,
        ovrRating: matchedOVR !== undefined ? matchedOVR : null
      };
    });

    // Count matches
    const matchedCount = matchedData.filter(p => p.ovrRating !== null).length;
    const unmatchedCount = matchedData.length - matchedCount;

    console.log(`✅ Matched ${matchedCount} players by name`);
    console.log(`⚠️  ${unmatchedCount} players without OVR data`);

    // Show unmatched players
    if (unmatchedCount > 0) {
      console.log('\n📋 Unmatched players:');
      matchedData
        .filter(p => p.ovrRating === null)
        .forEach(p => console.log(`   - ${p.name}`));
    }

    // Save matched data
    fs.writeFileSync(outputPath, JSON.stringify(matchedData, null, 2));
    console.log(`\n✅ Matched data saved to: ${outputPath}`);

    console.log('\n📋 Next steps:');
    console.log('1. Review ovr-updates-matched.json');
    console.log('2. Fill in OVR ratings for unmatched players if needed');
    console.log('3. Save as ovr-updates.json');
    console.log('4. Run: npx ts-node scripts/bulk-update-ovr.ts');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

matchOVRByName();