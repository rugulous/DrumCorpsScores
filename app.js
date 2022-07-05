'use strict';

const DCI = require('./lib/DCI');

async function main(){
    const corps = await DCI.getCorps();
    console.log(corps);

    console.log("");

    const events = await DCI.getEvents();
    console.log(events);

    const dEvents = await DCI.getEventsForDate(new Date());
    console.log("Today's shows are:");
    dEvents.forEach(e => {
        console.log(`- ${e.eventName}, at ${e.venue.name}`);
    })
}

main();