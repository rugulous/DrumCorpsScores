'use strict';

const DCI = require('./lib/DCI');

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite'
});

const db = require('./lib/models')(sequelize);

async function main(){
    const corps = await DCI.getCorps();
    //console.log(corps);

    //console.log("");

    const events = await DCI.getEvents();
    //console.log(events);

    const dEvents = await DCI.getEventsForDate(new Date());
    console.log("Today's shows are:");
    dEvents.forEach(e => {
        console.log(`- ${e.eventName}, at ${e.venue.name}`);
    })
}

main();