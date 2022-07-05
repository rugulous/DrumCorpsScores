'use strict';

const baseURL = 'https://api.dci.org/api/v1/';

function doRequest(url){
    url = `${baseURL}${url}`;
    console.log(`Requesting ${url}...`);
    return fetch(url).then(res => res.json());
}

module.exports = {
    getEvents: async function(){
        const data = await doRequest("events?sort=startDate&startDate=%3E2022-07-05&limit=3&page=1");
        return data;
    },
    
    getCorps: async function(types = []){
        types = types.join(",");

        let url = "corps";
        if(types.trim().length > 0){
            url += `?type=${types}`;
        }

        const corps = await doRequest(url);
        return corps;
    }
};