class FB{
	#token = null;
	#pageID = null;

	constructor(token, pageID){
		this.#token = token;
		this.#pageID = pageID;
	}

	doPost(content){
		content = encodeURIComponent(content);
		return fetch(`https://graph.facebook.com/${this.#pageID}/feed?message=${content}&access_token=${this.#token}`, {
			method: 'POST'
		});
	}
}

module.exports = FB;