import { Player, generateCardSlug, generateDisplayName } from '../src/models';
import { sequelize } from '../src/db';
import { computeStatsFromAggregates } from '../src/utils/stats';
import * as fs from 'fs';
import * as path from 'path';

// All 51 player cards from your dataset
const playersToImport = [
  {
    "name": "lionel messi",
    "team": "barcelona",
    "position": "CF",
    "age": 34,
    "cardType": "epic-big time",
    "apps": 1426,
    "goal": 1002,
    "assists": 445,
    "image": "/1.jpg"
  },
  {
    "name": "lionel messi",
    "team": "NAN",
    "position": "AMF",
    "age": 26,
    "cardType": "epic",
    "apps": 940,
    "goal": 217,
    "assists": 166,
    "image": "/2.jpg"
  },
  {
    "name": "lionel messi",
    "team": "barcelona",
    "position": "RWF",
    "age": 19,
    "cardType": "epic",
    "apps": 300,
    "goal": 136,
    "assists": 56,
    "image": "/3.jpg"
  },
  {
    "name": "lionel messi",
    "team": "NAN",
    "position": "SS",
    "age": 35,
    "cardType": "epic",
    "apps": 1159,
    "goal": 572,
    "assists": 230,
    "image": "/4.jpg"
  },
  {
    "name": "antoine griezmann",
    "team": "atl madrid",
    "position": "SS",
    "age": 27,
    "cardType": "epic-big time",
    "apps": 966,
    "goal": 157,
    "assists": 135,
    "image": "/5.jpg"
  },
  {
    "name": "gabriel batistuta",
    "team": "fiorentina",
    "position": "CF",
    "age": 26,
    "cardType": "epic",
    "apps": 479,
    "goal": 156,
    "assists": 36,
    "image": "/6.jpg"
  },
  {
    "name": "david villa",
    "team": "valencia",
    "position": "CF",
    "age": 25,
    "cardType": "epic",
    "apps": 815,
    "goal": 228,
    "assists": 86,
    "image": "/7.jpg"
  },
  {
    "name": "neymar jr",
    "team": "barcelona",
    "position": "LWF",
    "age": 22,
    "cardType": "epic",
    "apps": 1003,
    "goal": 192,
    "assists": 179,
    "image": "/8.jpg"
  },
  {
    "name": "guti",
    "team": "real madrid",
    "position": "AMF",
    "age": 26,
    "cardType": "epic",
    "apps": 822,
    "goal": 75,
    "assists": 99,
    "image": "/9.jpg"
  },
  {
    "name": "a. del piero",
    "team": "juventus",
    "position": "SS",
    "age": 21,
    "cardType": "epic",
    "apps": 948,
    "goal": 236,
    "assists": 146,
    "image": "/10.jpg"
  },
  {
    "name": "fernando torres",
    "team": "chelsea",
    "position": "CF",
    "age": 29,
    "cardType": "epic",
    "apps": 1082,
    "goal": 273,
    "assists": 119,
    "image": "/11.jpg"
  },
  {
    "name": "johan cruyff",
    "team": "barcelona",
    "position": "SS",
    "age": 28,
    "cardType": "legendary",
    "apps": 1873,
    "goal": 275,
    "assists": 274,
    "image": "/12.jpg"
  },
  {
    "name": "desire doue",
    "team": "psg",
    "position": "SS",
    "age": 19,
    "cardType": "show-time",
    "apps": 431,
    "goal": 105,
    "assists": 46,
    "image": "/13.jpg"
  },
  {
    "name": "viktor gyokeres",
    "team": "sporting-cp",
    "position": "CF",
    "age": 26,
    "cardType": "show-time",
    "apps": 247,
    "goal": 79,
    "assists": 27,
    "image": "/14.jpg"
  },
  {
    "name": "jude bellingham",
    "team": "real madrid",
    "position": "AMF",
    "age": 20,
    "cardType": "highlight",
    "apps": 847,
    "goal": 79,
    "assists": 99,
    "image": "/15.jpg"
  },
  {
    "name": "mo salah",
    "team": "liverpool",
    "position": "RWF",
    "age": 29,
    "cardType": "featured",
    "apps": 687,
    "goal": 147,
    "assists": 86,
    "image": "/16.jpg"
  },
  {
    "name": "omar marmoush",
    "team": "man city",
    "position": "LMF",
    "age": 25,
    "cardType": "show-time",
    "apps": 295,
    "goal": 61,
    "assists": 45,
    "image": "/17.jpg"
  },
  {
    "name": "kylian mbappe",
    "team": "NAN",
    "position": "LWF",
    "age": 25,
    "cardType": "potw",
    "apps": 1351,
    "goal": 443,
    "assists": 190,
    "image": "/18.jpg"
  },
  {
    "name": "kylian mbappe",
    "team": "psg",
    "position": "CF",
    "age": 24,
    "cardType": "potw",
    "apps": 836,
    "goal": 225,
    "assists": 116,
    "image": "/19.jpg"
  },
  {
    "name": "kylian mbappe",
    "team": "NAN",
    "position": "CF",
    "age": 24,
    "cardType": "highlight",
    "apps": 856,
    "goal": 229,
    "assists": 104,
    "image": "/20.jpg"
  },
  {
    "name": "kylian mbappe",
    "team": "psg",
    "position": "CF",
    "age": 25,
    "cardType": "highlight",
    "apps": 109,
    "goal": 39,
    "assists": 16,
    "image": "/21.jpg"
  },
  {
    "name": "kevin de bruyne",
    "team": "man city",
    "position": "AMF",
    "age": 32,
    "cardType": "highlight",
    "apps": 586,
    "goal": 62,
    "assists": 79,
    "image": "/22.jpg"
  },
  {
    "name": "erling haaland",
    "team": "man city",
    "position": "CF",
    "age": 24,
    "cardType": "highlight",
    "apps": 569,
    "goal": 178,
    "assists": 47,
    "image": "/23.jpg"
  },
  {
    "name": "vinicius jr",
    "team": "real madrid",
    "position": "LWF",
    "age": 24,
    "cardType": "potw",
    "apps": 437,
    "goal": 74,
    "assists": 46,
    "image": "/24.jpg"
  },
  {
    "name": "mo salah",
    "team": "liverpool",
    "position": "CF",
    "age": 29,
    "cardType": "potw",
    "apps": 1298,
    "goal": 315,
    "assists": 171,
    "image": "/25.jpg"
  },
  {
    "name": "neymar jr",
    "team": "NAN",
    "position": "SS",
    "age": 30,
    "cardType": "show-time",
    "apps": 460,
    "goal": 81,
    "assists": 57,
    "image": "/26.jpg"
  },
  {
    "name": "phil foden",
    "team": "man city",
    "position": "RWF",
    "age": 23,
    "cardType": "highlight",
    "apps": 411,
    "goal": 69,
    "assists": 51,
    "image": "/27.jpg"
  },
  {
    "name": "cristiano ronaldo",
    "team": "NAN",
    "position": "CF",
    "age": 38,
    "cardType": "highlight",
    "apps": 359,
    "goal": 116,
    "assists": 58,
    "image": "/28.jpg"
  },
  {
    "name": "robert lewandowski",
    "team": "barcelona",
    "position": "CF",
    "age": 35,
    "cardType": "highlight",
    "apps": 1125,
    "goal": 268,
    "assists": 109,
    "image": "/29.jpg"
  },
  {
    "name": "jude bellingham",
    "team": "real madrid",
    "position": "CMF",
    "age": 20,
    "cardType": "highlight",
    "apps": 743,
    "goal": 50,
    "assists": 83,
    "image": "/30.jpg"
  },
  {
    "name": "ciro immobile",
    "team": "ss lazio",
    "position": "CF",
    "age": 32,
    "cardType": "highlight",
    "apps": 378,
    "goal": 111,
    "assists": 41,
    "image": "/31.jpg"
  },
  {
    "name": "alphonso davies",
    "team": "bayern munich",
    "position": "LB",
    "age": 22,
    "cardType": "highlight",
    "apps": 1054,
    "goal": 34,
    "assists": 72,
    "image": "/32.jpg"
  },
  {
    "name": "bernardo silva",
    "team": "man city",
    "position": "AMF",
    "age": 28,
    "cardType": "highlight",
    "apps": 612,
    "goal": 45,
    "assists": 71,
    "image": "/33.jpg"
  },
  {
    "name": "dusan vlahovic",
    "team": "NAN",
    "position": "CF",
    "age": 25,
    "cardType": "highlight",
    "apps": 438,
    "goal": 103,
    "assists": 36,
    "image": "/34.jpg"
  },
  {
    "name": "thomas muller",
    "team": "bayern munich",
    "position": "SS",
    "age": 33,
    "cardType": "highlight",
    "apps": 416,
    "goal": 48,
    "assists": 54,
    "image": "/35.jpg"
  },
  {
    "name": "mikel oyarzabal",
    "team": "real sociedad",
    "position": "LMF",
    "age": 24,
    "cardType": "highlight",
    "apps": 589,
    "goal": 80,
    "assists": 75,
    "image": "/36.jpg"
  },
  {
    "name": "gaizka mendieta",
    "team": "barcelona",
    "position": "RMF",
    "age": 29,
    "cardType": "epic",
    "apps": 832,
    "goal": 72,
    "assists": 94,
    "image": "/37.jpg"
  },
  {
    "name": "diego maradona",
    "team": "barcelona",
    "position": "SS",
    "age": 23,
    "cardType": "epic",
    "apps": 750,
    "goal": 133,
    "assists": 108,
    "image": "/38.jpg"
  },
  {
    "name": "dwight yorke",
    "team": "man united",
    "position": "CF",
    "age": 29,
    "cardType": "epic",
    "apps": 330,
    "goal": 125,
    "assists": 61,
    "image": "/39.jpg"
  },
  {
    "name": "neymar jr",
    "team": "santos",
    "position": "CF",
    "age": 19,
    "cardType": "epic",
    "apps": 826,
    "goal": 192,
    "assists": 124,
    "image": "/40.jpg"
  },
  {
    "name": "bukayo saka",
    "team": "arsenal",
    "position": "RWF",
    "age": 22,
    "cardType": "potw",
    "apps": 555,
    "goal": 69,
    "assists": 70,
    "image": "/41.jpg"
  },
  {
    "name": "kevin de bruyne",
    "team": "man city",
    "position": "AMF",
    "age": 31,
    "cardType": "potw",
    "apps": 1233,
    "goal": 137,
    "assists": 213,
    "image": "/42.jpg"
  },
  {
    "name": "cristiano ronaldo",
    "team": "NAN",
    "position": "CF",
    "age": 37,
    "cardType": "potw",
    "apps": 532,
    "goal": 130,
    "assists": 34,
    "image": "/43.jpg"
  },
  {
    "name": "erling haaland",
    "team": "man city",
    "position": "CF",
    "age": 21,
    "cardType": "potw",
    "apps": 1458,
    "goal": 500,
    "assists": 154,
    "image": "/44.jpg"
  },
  {
    "name": "dejan kulusevski",
    "team": "tottenham",
    "position": "RWF",
    "age": 23,
    "cardType": "highlight",
    "apps": 729,
    "goal": 146,
    "assists": 127,
    "image": "/45.jpg"
  },
  {
    "name": "randal kolo muani",
    "team": "psg",
    "position": "CF",
    "age": 25,
    "cardType": "highlight",
    "apps": 312,
    "goal": 115,
    "assists": 50,
    "image": "/46.jpg"
  },
  {
    "name": "neymar jr",
    "team": "psg",
    "position": "LWF",
    "age": 29,
    "cardType": "potw",
    "apps": 350,
    "goal": 64,
    "assists": 35,
    "image": "/47.jpg"
  },
  {
    "name": "victor osimhen",
    "team": "napoli",
    "position": "CF",
    "age": 25,
    "cardType": "potw",
    "apps": 265,
    "goal": 97,
    "assists": 37,
    "image": "/48.jpg"
  },
  {
    "name": "son heung min",
    "team": "tottenham",
    "position": "LWF",
    "age": 30,
    "cardType": "potw",
    "apps": 182,
    "goal": 42,
    "assists": 16,
    "image": "/49.jpg"
  },
  {
    "name": "federico chiesa",
    "team": "juventus",
    "position": "RWF",
    "age": 25,
    "cardType": "highlight",
    "apps": 581,
    "goal": 95,
    "assists": 86,
    "image": "/50.jpg"
  },
  {
    "name": "ruud van nistelrooy",
    "team": "man united",
    "position": "CF",
    "age": 25,
    "cardType": "epic",
    "apps": 341,
    "goal": 121,
    "assists": 21,
    "image": "/51.jpg"
  }
];

const importPlayers = async () => {
  try {
    console.log('Starting player import...');
    console.log(`Players to import: ${playersToImport.length}`);
    
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync database (with force to start fresh)
    await sequelize.sync({ force: true });
    console.log('Database synchronized (fresh start).');

    // Import players
    let successCount = 0;
    let errorCount = 0;

    for (const playerData of playersToImport) {
      try {
        // Generate unique identifiers for each card
        const cardSlug = generateCardSlug(
          playerData.name,
          playerData.team || 'N/A',
          playerData.position || 'Unknown',
          playerData.age,
          playerData.cardType
        );
        const displayName = generateDisplayName(
          playerData.name,
          playerData.team || 'N/A',
          playerData.position || 'Unknown',
          playerData.cardType
        );

        const player = await Player.create({
          name: playerData.name,
          team: playerData.team || 'N/A',
          position: playerData.position,
          age: playerData.age,
          cardType: playerData.cardType,
          cardSlug,
          displayName,
          apps: playerData.apps || 0,
          goal: playerData.goal || 0,
          assists: playerData.assists || 0,
          image: playerData.image,
        });

        const stats = computeStatsFromAggregates(player);
        
        console.log(`✓ ${successCount + 1}. ${player.displayName} - gPm: ${stats.gPm.toFixed(3)}, aPm: ${stats.aPm.toFixed(3)}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to import ${playerData.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n✅ Import completed:`);
    console.log(`✓ Successfully imported: ${successCount} players`);
    if (errorCount > 0) {
      console.log(`✗ Failed: ${errorCount} players`);
    }
    
    // Verify the import
    const totalCount = await Player.count();
    console.log(`\nTotal players in database: ${totalCount}`);
    
    // Show sample data with stats
    console.log('\n📊 Sample players with auto-calculated stats:');
    const samplePlayers = await Player.findAll({ limit: 5 });
    samplePlayers.forEach(player => {
      const stats = computeStatsFromAggregates(player);
      console.log(`\n🎮 ${player.displayName}`);
      console.log(`   🆔 Card Slug: ${player.cardSlug}`);
      console.log(`   Team: ${player.team} | Position: ${player.position} | Age: ${player.age}`);
      console.log(`   Apps: ${stats.apps} | Goals: ${stats.goals} | Assists: ${stats.assists}`);
      console.log(`   G+A: ${stats.gPlusA} | G/match: ${stats.gPm.toFixed(3)} | A/match: ${stats.aPm.toFixed(3)} | G+A/match: ${stats.gAPm.toFixed(3)}`);
    });
    
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
};

importPlayers();
