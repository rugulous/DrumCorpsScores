'use strict';

const DCI = require('./lib/DCI');

const { Sequelize, QueryTypes } = require('sequelize');
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
    const date = new Date('2022-07-02');

    let exists = await db.Ranking.findOne({
        where: {
            RankingDate: date
        }
    });

    if(exists != null){
        console.log("Ranking already created!");
        return;
    }

    const ranks = await sequelize.query(`
    SELECT c.Name, p.Division, c.ExternalID, p.Score, s.Date 
    FROM Corps c
    INNER JOIN Performances p ON p.id = (
	    SELECT p1.id
	    FROM Performances p1
	    INNER JOIN Shows s ON s.ExternalID = p1.ShowID
	    WHERE p1.CorpsID = c.ExternalID
	    AND p1.Score > 0
	    AND strftime('%Y', s.Date) = $1
	    ORDER BY s.Date DESC
	    LIMIT 1
    )
    INNER JOIN Shows s ON s.ExternalID = p.ShowID

    ORDER BY p.Score DESC
    `, {
        bind: [String(date.getFullYear())],
        type: QueryTypes.SELECT
    });

    let divCount = {};
    for (let i = 0; i < ranks.length; i++) {
        if(divCount.hasOwnProperty(ranks[i].Division)){
            divCount[ranks[i].Division]++;
        } else {
            divCount[ranks[i].Division] = 1;
        }

        console.log(`${divCount[ranks[i].Division]}: ${ranks[i].Name}`);

        await db.Ranking.create({
            Division: ranks[i].Division,
            CorpsID: ranks[i].ExternalID,
            Score: ranks[i].Score,
            Rank: divCount[ranks[i].Division],
            RankingDate: date,
            LastShowDate: ranks[i].Date
        });
    }
}

async function doPost(db) {
    //empty - for now
}

async function main() {
    const db = await require('./lib/models')(sequelize);

    //await populateData(db);
    await updateRankings(db);
    await doPost(db);

    await db.sequelize.close();
}

main();