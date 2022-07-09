'use strict';

const fs = require('fs');

const DCI = require('./lib/DCI');
const FB = require('./lib/FB');

const dbPath = './db.sqlite';

const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
});

const util = require('./lib/util');

const date = new Date();
date.setDate(date.getDate() - 1);

const dateStr = util.dateToString(date);
const year = String(date.getFullYear());

async function saveEvent(db, e){
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

async function populateData(db) {
    const events = await DCI.getEventsForDate(date); //DCI.getEvents('<2022-07-05', 100, -1, "-startDate"); <- use this for initial population
    console.log("Today's shows are:");
    for (let i = 0; i < events.length; i++) {
        const e = events[i];
        console.log(e.name);
        await saveEvent(db, e);
    }
}

async function updateRankings(db) {
    let exists = await db.Ranking.findOne({
        where: sequelize.where(sequelize.fn('date', sequelize.col('RankingDate')), dateStr)
    });

    if (exists != null) {
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
        bind: [year],
        type: QueryTypes.SELECT
    });

    let divCount = {};
    for (let i = 0; i < ranks.length; i++) {
        if (divCount.hasOwnProperty(ranks[i].Division)) {
            divCount[ranks[i].Division]++;
        } else {
            divCount[ranks[i].Division] = 1;
        }

        await db.Ranking.create({
            Division: ranks[i].Division,
            CorpsID: ranks[i].ExternalID,
            Score: ranks[i].Score,
            Rank: divCount[ranks[i].Division],
            RankingDate: dateStr,
            LastShowDate: ranks[i].Date
        });
    }
}

async function doPost(db) {
    const token = require('./token');
    const fb = new FB(token.fb, 107737871999955);

    let post = "Latest DCI ranks:";

    const results = await db.Ranking.findAll({
        where: sequelize.where(sequelize.fn('date', sequelize.col('RankingDate')), dateStr),
        order: [
            ['Division', 'DESC'],
            ['Rank']
        ]
    });

    let div = '';
    for(let i = 0; i < results.length; i++){
        const r = results[i];
        if(r.Division !== div){
            post += `\r\n\r\n\r\n${r.Division}\r\n`;
            post += "".padStart(r.Division.length * 1.2, "-") + "\r\n";

            div = r.Division
        }

        const corps = await db.Corps.findOne({
            where: {
                ExternalID: r.CorpsID
            }
        });
        const d = new Date(r.LastShowDate);

        post += `${r.Rank}. ${corps.Name} - ${String(r.Score).padEnd(5, '0')} (${util.dateToString(d, false)})\r\n`;
    }

    post += `\r\nN.B. all scores are taken from the DCI website and are correct at time of posting`;

    const res = await fb.doPost(post).then(res => res.json());
    console.log(`The post is available at https://facebook.com/${res.id}`);
}

async function initialise(db){
    console.log("Initialising...");

    //load bands
    const corps = await DCI.getCorps();
    corps.forEach(async (c) => {
        await db.Corps.upsert({
            Name: c.name,
            Slug: c.slug,
            ExternalID: c.id
        });
    });

    //load previous shows
    const events = await DCI.getEvents(`<${dateStr}`, 100, -1, "-startDate");
    console.log("Today's shows are:");
    for (let i = 0; i < events.length; i++) {
        const e = events[i];
        console.log(e.name);
        await saveEvent(db, e);
    }
}

async function main() {
    const setup = fs.existsSync(dbPath);
    const db = await require('./lib/models')(sequelize);

    if(!setup){
        await initialise(db);
    }

    await populateData(db);
    await updateRankings(db);
    await doPost(db);

    await db.sequelize.close();
}

main();