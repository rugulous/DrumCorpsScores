'use strict';

const DCI = require('./lib/DCI');

async function main(){
    const corps = await DCI.getCorps();
    console.log(corps);

    console.log("");

    const events = await DCI.getEvents();
    console.log(events);
}

main();