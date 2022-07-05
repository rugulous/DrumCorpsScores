'use strict';

const DCI = require('./lib/DCI');

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite'
});

async function populateData(db) {
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
    for (let i = 0; i < events.length; i++) {
        const e = events[i];
        console.log(e.name);

        await db.Show.upsert({
            Name: e.name,
            Date: e.startDate,
            Slug: e.slug,
            ExternalID: e.id
        });

        const show = await DCI.getShowDetails(e.slug);
        for (let j = 0; j < show.length; j++) {
            const p = show[j];

            const exists = await db.Performance.findOne({
                where: {
                    ShowID: e.id,
                    CorpsID: p.orgGroupIdentifier
                }
            });

            if (exists === null) {
                await db.Performance.create({
                    ShowID: e.id,
                    CorpsID: p.orgGroupIdentifier,
                    Score: p.totalScore,
                    Division: p.divisionName
                });
            }
        }
    }
}

async function updateRankings(db) {
    //empty - for now
}

async function doPost(db) {
    //empty - for now
}

async function main() {
    const db = await require('./lib/models')(sequelize);

    await populateData(db);
    await updateRankings(db);
    await doPost(db);

    await db.sequelize.close();
}

main();