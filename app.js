'use strict';

const DCI = require('./lib/DCI');

async function main(){
    const events = await DCI.getEvents();
    console.log(events);
}

main();