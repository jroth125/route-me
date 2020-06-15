const router = require('express').Router()
const {Route, User} = require('../db/models')

//eventually will want to add query params here to get completed and non-complete run routes


router.get('/:runId', async (req, res, next) => {
    try {
        const run = await Route.findByPK(req.params.runId)
        res.status(200).send(run)
    } catch (error) {
        next(error)
    }
})

router.get('/allroutes/:userId', async (req, res, next) => {
    try {
        console.log('------------>id', req.params)
        const allRunRoutes = await Route.getAllRoutes(req.params.userId)
        res.status(200).send(allRunRoutes)
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        console.log("req.body is---------------->", req.body)
        const {country, coords, city, state, userId} = req.body
        const newRun = await Route.create({country, coords, city, state, userId})
        if (newRun) res.send(newRun)
        else res.status(404).send('not created')
    } catch (error) {
        next(error)
    }
})
module.exports = router