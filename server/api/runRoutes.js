const router = require('express').Router()
const {Route} = require('../db/models')

//eventually will want to add query params here to get completed and non-complete run routes
router.get('/', async (req, res, next) => {
    try {
        const allRunRoutes = await Route.getAllRoutes(req.user.id)
        res.status(200).send(allRunRoutes)
    } catch (error) {
        next(error)
    }
})

router.get('/:runId', async (req, res, next) => {
    try {
        const run = await Route.findByPK(req.params.runId)
        res.status(200).send(run)
    } catch (error) {
        next(error)
    }
})

module.exports = router