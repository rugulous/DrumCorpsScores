'use strict';

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite'
});

sequelize.sync();

module.exports = sequelize;