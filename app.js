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

    const date = new Date("2022-07-02");

    const events = await DCI.getEventsForDate(date);
    console.log("Today's shows are:");
    for(let i = 0; i < events.length; i++){
        const e = events[i];
        console.log(e.name);

        await db.Show.upsert({
            Name: e.name,
            Date: e.startDate,
            Slug: e.slug,
            ExternalID: e.id
        });
    }

    await db.sequelize.close();
}

main();