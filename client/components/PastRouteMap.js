import React, {Component} from 'react'
import mapboxgl, {Marker} from 'mapbox-gl'
import {connect} from 'react-redux'
import {createNewRouteThunk, getCurrentRouteThunk} from '../store/routes'

import '../../secrets'

import PlacesAutocomplete from './PlacesAutocomplete'

mapboxgl.accessToken = process.env.MAPBOX
// create a function to make a directions request

class PastRouteMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      curRouteCoords: [],
      map: {},
      zoom: 15,
      lng: -73.966645,
      lat: 40.781358,
    }
  }

  async componentDidMount() {
    console.log('do we have a cuyr Route? ', this.props.curRoute)
    if (this.props.curRoute.id) {
      const rawCoords = this.props.curRoute.coords
      const coords = JSON.parse(rawCoords)
      const mid = Math.floor(coords.length / 4)
      const map = new mapboxgl.Map({
        container: this.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coords[mid],
        zoom: 13,
      })
      map.on('load', () => {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coords,
              },
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': 'purple',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        })
      })
    } else {
      this.props.getCurRoute(this.props.match.params.routeId)
      console.log('the curRoute is', this.props.coords)
      const map = new mapboxgl.Map({
        container: this.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-73.966645, 40.781358],
        zoom: this.state.zoom,
      })

      this.setState({map})
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.coords !== prevProps.coords) {
      let {map} = this.state
      let {coords} = this.props
      let mid = Math.floor(this.props.coords.length / 2)
      map.on('load', () => {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coords,
              },
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': 'purple',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        })
        map.flyTo({center: coords[mid], zoom: 14, essential: false})
      })
    }
  }

  render() {
    const miles = this.state.prefMiles
    return (
      <div>
        <div className="map-container"></div>
        <div
          ref={(el) => (this.mapContainer = el)}
          className="mapContainer mapChild"
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    coords: state.routes.curRoute,
    curRoute: state.routes.curRoute,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    getCurRoute: (id) => dispatch(getCurrentRouteThunk(id)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PastRouteMap)
