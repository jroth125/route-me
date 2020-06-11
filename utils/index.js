require('../secrets')
const {computeDestinationPoint} = require('geolib')
const axios = require('axios')

const milesToMeters = (miles) => {
  return miles / 0.00062137
}

const getRandomPointsInRadius = async (
  startingLat,
  startingLong,
  milesToRun
) => {
  let firstPoint, secondPoint, centroidPoint
  const metersToRun = milesToMeters(milesToRun)
  const triangleRatio = 0.2928932188134525
  const radius = metersToRun * 0.8 * triangleRatio //.623
  const angle = Math.random() * 360
  const angleForSecondPoint = angle - 90
  const angleForCentroidPoint = angle - 45

  firstPoint = computeDestinationPoint(
    {latitude: startingLat, longitude: startingLong},
    radius,
    angle
  )
  secondPoint = computeDestinationPoint(
    {latitude: startingLat, longitude: startingLong},
    radius,
    angleForSecondPoint
  )

  centroidPoint = computeDestinationPoint(
    {latitude: startingLat, longitude: startingLong},
    radius / 2,
    angleForCentroidPoint
  )

  return [firstPoint, secondPoint, centroidPoint]
}

const isInWater = async (point1, point2) => {
  return false
  // const res1 = await axios.get(`https://api.onwater.io/api/v1/results/${point1.latitude},${point1.longitude}?access_token=${process.env.ON_WATER}`)
  // const res2 = await axios.get(`https://api.onwater.io/api/v1/results/${point2.latitude},${point2.longitude}?access_token=${process.env.ON_WATER}`)
  // return !res1.data.water && !res2.data.water
}

module.exports = {getRandomPointsInRadius, milesToMeters}
