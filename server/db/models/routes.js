const db = require('../db')
const Sequelize = require('sequelize')

const Route = db.define('route', {
    coords: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    city: {
        type: Sequelize.STRING,
        allowNull: true
    },
    state: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            len: [2, 2]
        }
    },
    country: {
        type: Sequelize.STRING,
        allowNull: true
    },
    isComplete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
})

Route.getAllRoutes = function(userId) {
    console.log('user id is----------><><><>', userId)
    const allRunRoutes = Route.findAll({
        where: {
            userId
        }
    })
    return allRunRoutes
}

module.exports = Route