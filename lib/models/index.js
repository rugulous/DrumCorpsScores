'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

module.exports = async (sequelize) => {
	const db = {};

	const files = fs.readdirSync(__dirname)
		.filter(file => {
            console.log(file);
			return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
		});

	for (const file of files){
		const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
		db[model.name] = model;
	}

	//sometimes we get errors creating tables, because they depend on also non-existent tables
	//let's fix that...
	const failedCreates = [];
	const models = Object.keys(db);

	for (let i = 0; i < models.length; i++){
		const modelName = models[i];
		console.log(`Found ${modelName}`);

		if (db[modelName].associate) {
			db[modelName].associate(db);
		}

		try {
			await db[modelName].sync({alter: true});
		} catch (ex){
			console.log(`Failed to sync ${modelName}`);
			failedCreates.push(modelName);
		}
	}

	while (failedCreates.length > 0){
		for (let i = failedCreates.length - 1; i >= 0; i--){
			try {
				db[failedCreates[i]].associate(db);
				await db[failedCreates[i]].sync({alter: true});
				failedCreates.splice(i,1);
			} catch (ex){
				console.log(`Failed to sync ${failedCreates[i]}`);
			}
		}
	}

	db.sequelize = sequelize;
	db.Sequelize = Sequelize;

	return db;
};
