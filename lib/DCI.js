'use strict';

const baseURL = 'https://api.dci.org/api/v1/';

function doRequest(url){
    url = `${baseURL}${url}`;
    console.log(`Requesting ${url}...`);
    return fetch(url).then(res => res.json());
}

module.exports = {
    getEvents: async function(sort = "startDate", startDate = "", limit = 10, page = -1){
        const params = [];

        if(sort.trim().length > 0){
            params.push(`sort=${sort}`);
        }

        if(startDate.trim().length > 0){
            params.push(`startDate=${startDate}`);
        }

        if(limit > 0){
            params.push(`limit=${limit}`);
        }

        if(page > 1){
            params.push(`page=${page}`);
        }

        const query = params.join("&");
        let url = "events";
        if(query.length > 0){
            url += `?${query}`;
        }

        const data = await doRequest(url);
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