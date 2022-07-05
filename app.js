'use strict';

const DCI = require('./lib/DCI');

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite'
});

async function main() {
    const db = await require('./lib/models')(sequelize);
    
    //we may not have any bands in our table yet
    //let's double-check these at the start!
    const corps = await DCI.getCorps();
    corps.forEach(async (c) => {
        await db.Corps.upsert({
            Name: c.name,
            Slug: c.slug,
            ExternalID: c.id
        });
    })

    const dEvents = await DCI.getEventsForDate(new Date());
    console.log("Today's shows are:");
    dEvents.forEach(e => {
        console.log(`- ${e.eventName}, at ${e.venue.name}`);
    });

    await db.sequelize.close();
}

main();