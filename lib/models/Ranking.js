'use strict';

const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Ranking extends Model {
    }

    Ranking.init({
        Division: {
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
        Rank: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        RankingDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        LastShowDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Ranking',
    });

    return Ranking;
};
