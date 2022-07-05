'use strict';

const baseURL = 'https://api.dci.org/api/v1/';

function doRequest(url) {
    url = `${baseURL}${url}`;
    console.log(`Requesting ${url}...`);
    return fetch(url).then(res => res.json());
}

module.exports = {
    getEvents: async function (startDate = "", limit = 10, page = -1, sort = "startDate") {
        const params = [];

        if (sort.trim().length > 0) {
            params.push(`sort=${sort}`);
        }

        if (startDate.trim().length > 0) {
            params.push(`startDate=${startDate}`);
        }

        if (limit > 0) {
            params.push(`limit=${limit}`);
        }

        if (page > 1) {
            params.push(`page=${page}`);
        }

        const query = params.join("&");
        let url = "events";
        if (query.length > 0) {
            url += `?${query}`;
        }

        const data = await doRequest(url);
        return data;
    },

    getEventsForDate: async function (date) {
        const _date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const data = await this.getEvents(_date, 20);
        return data;
    },

    getShowDetails: async function (slug) {
        const data = await doRequest(`competitions/${slug}`);
        return data;
    },

    getCorps: async function (types = []) {
        types = types.join(",");

        let url = "corps";
        if (types.trim().length > 0) {
            url += `?type=${types}`;
        }

        const corps = await doRequest(url);
        return corps;
    }
};