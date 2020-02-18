import React, {Component} from 'react'
import {LoadScript, GoogleMap, fitBounds} from '@react-google-maps/api'
import mapboxgl, {Marker} from 'mapbox-gl'
import uniqid from 'uniqid'
import axios from 'axios'
import '../../secrets'

import PlacesAutocomplete from './PlacesAutocomplete'

mapboxgl.accessToken = process.env.MAPBOX
// create a function to make a directions request

export default class HomeMap extends Component {
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
      homeMarker: ''
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
      zoom: this.state.zoom
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

  changeLtLng(lng, lat) {
    if (this.state.homeMarker) {
      this.state.homeMarker.remove()
    }
    const homeMarker = new Marker().setLngLat([lng, lat]).addTo(this.state.map)

    this.setState({lng, lat, homeMarker})

    this.state.map.flyTo({
      center: [lng, lat],
      minZoom: 3,
      essential: true // this animation is considered essential with respect to prefers-reduced-motion
    })
  }

  createRoute(e, state, destination) {
    e.preventDefault()
    console.log('I ran!fsdfsd')
    function getRoute(e, state, destination) {
      const {map} = state
      console.log('I ran!')
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
        -73.958582 +
        ',' +
        40.676386 +
        '?steps=true&geometries=geojson&access_token=' +
        mapboxgl.accessToken

      // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
      const req = new XMLHttpRequest()
      req.open('GET', url, true)
      req.onload = function() {
        let json = JSON.parse(req.response)
        let data = json.routes[0]
        let route = data.geometry.coordinates
        console.log('this is the route', route)
        let geojson = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route
          }
        }
        // if the route already exists on the map, reset it using setData
        if (map.getSource('route')) {
          console.log('already a route! Uh ohh')
          map.getSource('route').setData(geojson)
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
                  coordinates: geojson
                }
              }
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': 'purple',
              'line-width': 5,
              'line-opacity': 0.75
            }
          })
        }
        // add turn instructions here at the end
      }
      req.send()
    }
    getRoute(e, state, destination)

    // const end = {
    //   type: 'FeatureCollection',
    //   features: [
    //     {
    //       type: 'Feature',
    //       properties: {},
    //       geometry: {
    //         type: 'Point',
    //         coordinates: coords
    //       }
    //     }
    //   ]
    // }

    // map.on('click', e => {
    //   if (this.state.destination)
    //     this.setState({origin: e.lngLat, destination: ''})
    //   if (this.state.origin) this.setState({destination: e.lngLat})
    //   else this.setState({origin: e.lngLat})
    //   console.log('the state is', this.state)
    //   let coordsObj = e.lngLat
    //   //   canvas.style.cursor = '';
    //   let coords = Object.keys(coordsObj).map(function(key) {
    //     return coordsObj[key]
    //   })
    //   const end = {
    //     type: 'FeatureCollection',
    //     features: [
    //       {
    //         type: 'Feature',
    //         properties: {},
    //         geometry: {
    //           type: 'Point',
    //           coordinates: coords
    //         }
    //       }
    //     ]
    //   }
    //   if (map.getLayer('end')) {
    //     map.getSource('end').setData(end)
    //   } else {

    //   }
    //   getRoute(coords)
    // })
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
          ref={el => (this.mapContainer = el)}
          className="mapContainer mapChild"
        />
        <div className="mapChild" id="instructions">
          <PlacesAutocomplete changeLtLng={this.changeLtLng} />
          <form>
            <span>{this.state.prefMiles}</span>
            <button
              type="submit"
              onClick={e => this.createRoute(e, this.state)}
            >
              Find route!
            </button>
          </form>
          <button onClick={this.plus}>+</button>
          <button
            onClick={e => {
              this.setState({prefMiles: miles - 1})
            }}
            disabled={this.state.prefMiles === 1 ? true : false}
          >
            -
          </button>
        </div>
      </div>
    )
  }
}
