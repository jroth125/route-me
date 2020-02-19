require('../secrets')
const {computeDestinationPoint} = require('geolib')
const axios = require('axios')

const milesToMeters = miles => {
  return miles / 0.00062137
}

const getRandomPointsInRadius = (startingLat, startingLong, milesToRun) => {
  let onWater = true
  let firstPoint, secondPoint, centroidPoint;
  while (onWater) {
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
    onWater = isInWater(firstPoint, secondPoint)
  }

  return [firstPoint, secondPoint, centroidPoint]
}

const isInWater = (point1, point2) => {
    const res1 = axios.get(`https://api.onwater.io/api/v1/results/${point1.latitude},${point1.longitude}?access_token=${process.env.ON_WATER}`)
    const res2 =  axios.get(`https://api.onwater.io/api/v1/results/${point2.latitude},${point2.longitude}?access_token=${process.env.ON_WATER}`)
    return res1 && res2
}

module.exports = {getRandomPointsInRadius, milesToMeters}
