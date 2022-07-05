'use strict';

const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Performance extends Model {
    }

    Performance.init({
        ShowID: {
            type: DataTypes.STRING,
            allowNull: false
        },
        CorpsID: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Score: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        Division: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Performance',
    });

    return Performance;
};
