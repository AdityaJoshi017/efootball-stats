import { Player } from '../src/models';
import { sequelize } from '../src/db';
import { computeStatsFromAggregates } from '../src/utils/stats';

// Sample player data (you can replace this with your actual playersData)
const samplePlayers = [
  {
    name: "lionel messi",
    team: "barcelona",
    position: "CF",
    age: 34,
    cardType: "epic-big time",
    apps: 1426,
    goal: 1002,
    assists: 445,
    image: "/1.jpg"
  },
  {
    name: "lionel messi",
    team: "NAN",
    position: "AMF",
    age: 26,
    cardType: "epic",
    apps: 940,
    goal: 217,
    assists: 166,
    image: "/2.jpg"
  },
  {
    name: "lionel messi",
    team: "barcelona",
    position: "RWF",
    age: 19,
    cardType: "epic",
    apps: 300,
    goal: 136,
    assists: 56,
    image: "/3.jpg"
  },
  {
    name: "lionel messi",
    team: "NAN",
    position: "SS",
    age: 35,
    cardType: "epic",
    apps: 1159,
    goal: 572,
    assists: 230,
    image: "/4.jpg"
  },
  {
    name: "antoine griezmann",
    team: "atl madrid",
    position: "SS",
    age: 27,
    cardType: "epic-big time",
    apps: 966,
    goal: 157,
    assists: 135,
    image: "/5.jpg"
  },
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync database
    await sequelize.sync({ force: true }); // This will drop existing tables
    console.log('Database synchronized.');

    // Insert players
    for (const playerData of samplePlayers) {
      const player = await Player.create(playerData);
      const stats = computeStatsFromAggregates(player);
      console.log(`Created player: ${player.name} (ID: ${player.id})`);
      console.log(`Stats: gPm=${stats.gPm}, aPm=${stats.aPm}, gAPm=${stats.gAPm}`);
    }

    console.log(`Successfully seeded ${samplePlayers.length} players.`);
    
    // Verify the seed
    const count = await Player.count();
    console.log(`Total players in database: ${count}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

seedDatabase();
