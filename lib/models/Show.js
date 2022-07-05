'use strict';

const {
	Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Show extends Model {
	}

	Show.init({
		Name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		Slug: {
			type: DataTypes.STRING(300),
			allowNull: false
		},
		Date: {
			type: DataTypes.DATE,
			allowNull: false
		},
        ExternalID: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
	}, {
		sequelize,
		modelName: 'Show',
	});

	return Show;
};
