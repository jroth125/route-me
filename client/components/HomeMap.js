import React, {Component} from 'react'
import mapboxgl, {Marker} from 'mapbox-gl'
import {getRandomPointsInRadius, milesToMeters} from '../../utils'
import {connect} from 'react-redux'
import {createNewRouteThunk} from '../store/routes'
import {me} from '../store/user'

import PlacesAutocomplete from './PlacesAutocomplete'
import '../../secrets'

mapboxgl.accessToken = process.env.MAPBOX

//used inside create route method (taken out to remove fluff)
const addLayerToMap = (map, geojson) => {
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
}

class HomeMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lng: -73.986287,
      lat: 40.748538,
      zoom: 15,
      origin: '',
      destination: '',
      prefMiles: 3,
      runName: '',
      map: {},
      homeMarker: '',
      routeMiles: 0,
      curRoute: [],
      state: '',
      city: '',
      country: '',
      routeOnScreen: false,
    }
    this.plus = this.plus.bind(this)
    this.minus = this.plus.bind(this)
    this.changeLtLng = this.changeLtLng.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }
  async componentDidMount() {
    this.props.getUser()
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
    })

    this.setState({map})
  }

  minus(e) {
    e.preventDefault()
    this.setState({prefMiles: -1 + this.state.prefMiles})
  }

  plus(e) {
    e.preventDefault()
    this.setState({prefMiles: this.state.prefMiles + 1})
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value})
  }

  changeLtLng(lng, lat, city, state, country) {
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

  async createRoute(e, state) {
    e.preventDefault()
    const waypoints = await getRandomPointsInRadius(
      state.lat,
      state.lng,
      state.prefMiles
    )
    const {map} = state
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${state.lng},${state.lat};${waypoints[0].longitude},${waypoints[0].latitude};${waypoints[1].longitude},${waypoints[1].latitude};${state.lng},${state.lat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
    const req = new XMLHttpRequest()

    req.open('GET', url, true)
    req.onload = () => {
      let json = JSON.parse(req.response)
      let data = json.routes[0]
      let route = data.geometry.coordinates
      let miles = data.distance * 0.00062137
      let geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      }
      this.setState({routeMiles: miles, curRoute: geojson.geometry.coordinates})
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson)
      } else {
        addLayerToMap(map, geojson)
        map.getSource('route').setData(geojson)
      }
    }
    req.send()
    map.flyTo({
      center: [waypoints[2].longitude, waypoints[2].latitude],
      zoom: state.prefMiles > 3 ? 13 : 14,
      essential: true, // this animation is considered essential with respect to prefers-reduced-motion
    })
    this.setState({routeOnScreen: true})
  }

  render() {
    const miles = this.state.prefMiles
    return (
      <div>
        <div
          ref={(el) => (this.mapContainer = el)}
          className="mapContainer mapChild"
        />
        <div className="mapChild" id="instructions">
          <div id="search-bar">
            <PlacesAutocomplete changeLtLng={this.changeLtLng} />
          </div>
          <div className="route-set-container">
            <div className="plus-minus-buttons route-set-container-child">
              <button className="plus-minus" onClick={this.plus}>+</button>
              <span id="miles">{this.state.prefMiles} mi</span>
              <button
                className="plus-minus"
                onClick={(e) => {
                  this.setState({prefMiles: miles - 1})
                }}
                disabled={this.state.prefMiles === 1 ? true : false}
              >
                -
              </button>
            </div>
            <div className="route-set-container-child">
              <button
                className="route-button"
                type="submit"
                onClick={(e) => {
                  this.createRoute(e, this.state)
                }}
              >
                Find route!
              </button>
            </div>
          </div>
          <form>
            <label htmlFor="runName">Name your run:</label>
            <input
              type="text"
              name="runName"
              value={this.state.runName}
              disabled={!this.state.routeOnScreen}
              onChange={(e) => this.handleChange(e)}
            />
          </form>
          <div>
            <button
              onClick={(e) => {
                const stringifiedRoute = JSON.stringify(this.state.curRoute)
                this.props.createNewRoute(
                  stringifiedRoute,
                  this.state.runName,
                  this.state.state,
                  this.state.city,
                  this.state.country,
                  this.state.routeMiles,
                  this.props.userId
                )
                this.setState({runName: '', routeOnScreen: false})
              }}
              disabled={!this.state.routeOnScreen || !this.state.runName}
            >
              Save route
            </button>
          </div>
          <div>
            <p> This run is: {this.state.routeMiles.toFixed(3)} miles</p>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  userId: state.user.id,
})
const mapDispatchToProps = (dispatch) => ({
  createNewRoute: (coords, name, state, city, country, distance, userId) =>
    dispatch(createNewRouteThunk(coords, name, state, city, country, distance, userId)),
  getUser: () => dispatch(me()),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeMap)
