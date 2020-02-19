const {computeDestinationPoint} = require('geolib')

  const milesToMeters = miles => {
    return miles / 0.00062137;
  };

  const getRandomPointsInRadius = (startingLat, startingLong, milesToRun) => {
    const metersToRun = milesToMeters(milesToRun);
    const triangleRatio = 0.2928932188134525;
    const radius = metersToRun * 0.8 * triangleRatio; //.623
    const angle = Math.random() * 360;
    const angleForSecondPoint = angle - 90;
    const angleForCentroidPoint = angle - 45
    const firstPoint = computeDestinationPoint(
      { latitude: startingLat, longitude: startingLong },
      radius,
      angle
    );
    const secondPoint = computeDestinationPoint(
      { latitude: startingLat, longitude: startingLong },
      radius,
      angleForSecondPoint
    );

    const centroidPoint = computeDestinationPoint(
        { latitude: startingLat, longitude: startingLong },
        radius/2,
        angleForCentroidPoint
      );
    
    return [firstPoint, secondPoint, centroidPoint];
  };

module.exports = {getRandomPointsInRadius, milesToMeters}