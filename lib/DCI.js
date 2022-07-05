'use strict';

module.exports = {
    getEvents: async function(){
        const data = await fetch("https://api.dci.org/api/v1/events?sort=startDate&startDate=%3E2022-07-05&limit=3&page=1").then(res => res.json());
        return data;
    }
};