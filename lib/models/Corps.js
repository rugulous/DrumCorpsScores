'use strict';

const {
	Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Corps extends Model {
	}

	Corps.init({
		Name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		Slug: {
			type: DataTypes.STRING(300),
			allowNull: false
		},
		ExternalID: {
			type: DataTypes.STRING,
			allowNull: false
		},
	}, {
		sequelize,
		modelName: 'Corps',
	});

	return Corps;
};
