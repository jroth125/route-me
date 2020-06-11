import React, {Component} from 'react'
import {LoadScript, GoogleMap, fitBounds} from '@react-google-maps/api'
import mapboxgl, {Marker} from 'mapbox-gl'
import {getDistance, computeDestinationPoint} from 'geolib'
import {getRandomPointsInRadius, milesToMeters} from '../../utils'
import {connect} from 'react-redux'
import {createNewRouteThunk} from '../store/routes'
import uniqid from 'uniqid'
import axios from 'axios'
import '../../secrets'

import PlacesAutocomplete from './PlacesAutocomplete'

mapboxgl.accessToken = process.env.MAPBOX
// create a function to make a directions request

class HomeMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lng: -73.952793,
      lat: 40.672555,
      zoom: 15,
      origin: '',
      destination: '',
      prefMiles: 3,
      map: {},
      homeMarker: '',
      routeMiles: 0,
      curRoute: [],
      state: '',
      city: '',
      country: ''
    }
    this.plus = this.plus.bind(this)
    this.minus = this.plus.bind(this)
    this.changeLtLng = this.changeLtLng.bind(this)
  }
  async componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
    })

    this.setState({map})

    const start = [-73.952793, 40.672555]
  }

  minus(e) {
    e.preventDefault()
    this.setState({prefMiles: -1 + this.state.prefMiles})
    console.log('im in the minus')
  }

  plus(e) {
    e.preventDefault()
    this.setState({prefMiles: this.state.prefMiles + 1})
  }

  changeLtLng(lng, lat, state, city, country) {
    if (this.state.homeMarker) {
      this.state.homeMarker.remove()
    }
    const homeMarker = new Marker().setLngLat([lng, lat]).addTo(this.state.map)

    this.setState({lng, lat, homeMarker, state, city, country})

    this.state.map.flyTo({
      center: [lng, lat],
      minZoom: 3,
      essential: true, // this animation is considered essential with respect to prefers-reduced-motion
    })
  }

  async createRoute(e, state, destination) {
    e.preventDefault()
    const waypoints = await getRandomPointsInRadius(
      state.lat,
      state.lng,
      state.prefMiles
    )
    const milesToMeters = (miles) => {
      return miles / 0.00062137
    }
    const {map} = state
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    console.log('start is', state.lng, state.lng)
    const url =
      'https://api.mapbox.com/directions/v5/mapbox/walking/' +
      state.lng +
      ',' +
      state.lat +
      ';' +
      waypoints[0].longitude +
      ',' +
      waypoints[0].latitude +
      ';' +
      waypoints[1].longitude +
      ',' +
      waypoints[1].latitude +
      ';' +
      state.lng +
      ',' +
      state.lat +
      '?steps=true&geometries=geojson&access_token=' +
      mapboxgl.accessToken

    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    const req = new XMLHttpRequest()
    req.open('GET', url, true)
    req.onload = () => {
      let json = JSON.parse(req.response)
      let data = json.routes[0]
      let route = data.geometry.coordinates
      console.log('this is the data', data)
      let miles = data.distance * 0.00062137
      console.log(
        'these are the miles!!!!:',
        data.distance * 0.00062137,
        miles / state.prefMiles
      )

      let geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      }
      this.setState({routeMiles: miles, curRoute: geojson.geometry.coordinates})
      // if the route already exists on the map, reset it using setData
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson)
        console.log('geojson is>>', geojson)
      } else {
        console.log('lol there is none')
        // otherwise, make a new request
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
                coordinates: geojson,
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
        map.getSource('route').setData(geojson)
      }
      // add turn instructions here at the end
    }
    req.send()
    map.flyTo({
      center: [waypoints[2].longitude, waypoints[2].latitude],
      zoom: state.prefMiles > 3 ? 13 : 15,
      essential: true, // this animation is considered essential with respect to prefers-reduced-motion
    })
  }

  render() {
    const miles = this.state.prefMiles
    return (
      <div>
        <div className="map-container">
          <div className="mapChild">
            Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom:{' '}
            {this.state.zoom}
          </div>
        </div>
        <div
          ref={(el) => (this.mapContainer = el)}
          className="mapContainer mapChild"
        />
        <div className="mapChild" id="instructions">
          <PlacesAutocomplete changeLtLng={this.changeLtLng} />
          <form>
            <span>{this.state.prefMiles}</span>
            <button
              type="submit"
              onClick={(e) => {
                console.log('I am in the submit event')
                this.createRoute(e, this.state)
                console.log('the state issss>>', this.state)
              }}
            >
              Find route!
            </button>
          </form>
          <div>
          <button
          onClick={this.props.createNewRoute(this.state.curRoute, )}
          >Save route</button>
          </div>
          <button onClick={this.plus}>+</button>
          <button
            onClick={(e) => {
              this.setState({prefMiles: miles - 1})
            }}
            disabled={this.state.prefMiles === 1 ? true : false}
          >
            -
          </button>
          <div>
            <p> This run is: {this.state.routeMiles}</p>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  createNewRoute: (coords, state, city, country) => dispatch(createNewRouteThunk(coords, state, city, country))
})

export default connect(null, mapDispatchToProps)(HomeMap)