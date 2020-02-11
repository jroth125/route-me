import React, {Component} from 'react'
import {LoadScript, GoogleMap, fitBounds} from '@react-google-maps/api'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import '../../secrets'

import GooglePlacesAutocomplete from './GooglePlacesAutocomplete'

mapboxgl.accessToken = process.env.MAPBOX
// create a function to make a directions request

export default class HomeMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lng: -122.657888,
      lat: 45.5247888,
      zoom: 15,
      origin: '',
      destination: '',
      prefMiles: 0
    }
    this.plus = this.plus.bind(this)
    this.minus = this.plus.bind(this)
  }
  async componentDidMount() {
    const origin = this.state.origin
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    })
    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      })
    })

    const start = [-122.662323, 45.523751]
    map.on('load', function() {
      // make an initial directions request that
      // starts and ends at the same location
      getRoute(start)

      // Add starting point to the map
      map.addLayer({
        id: 'point',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: start
                }
              }
            ]
          }
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#3887be'
        }
      })
      // this is where the code from the next step will go
    })

    function getRoute(end) {
      // make a directions request using cycling profile
      // an arbitrary start will always be the same
      // only the end or destination will change
      const start = [-122.662323, 45.523751]
      const url =
        'https://api.mapbox.com/directions/v5/mapbox/cycling/' +
        start[0] +
        ',' +
        start[1] +
        ';' +
        end[0] +
        ',' +
        end[1] +
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
          map.getSource('route').setData(geojson)
        } else {
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

    map.on('click', e => {
      if (this.state.destination)
        this.setState({origin: e.lngLat, destination: ''})
      if (this.state.origin) this.setState({destination: e.lngLat})
      else this.setState({origin: e.lngLat})
      console.log('the state is', this.state)
      let coordsObj = e.lngLat
      //   canvas.style.cursor = '';
      let coords = Object.keys(coordsObj).map(function(key) {
        return coordsObj[key]
      })
      const end = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: coords
            }
          }
        ]
      }
      if (map.getLayer('end')) {
        map.getSource('end').setData(end)
      } else {
        map.addLayer({
          id: 'end',
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: coords
                  }
                }
              ]
            }
          },
          paint: {
            'circle-radius': 10,
            'circle-color': '#f30'
          }
        })
      }
      getRoute(coords)
    })

    // const response = await axios.get("https://api.mapbox.com/directions/v5/mapbox/cycling/-122.42,37.78;-77.03,38.91?access_token=pk.eyJ1IjoianJvdGhlbmJlcmcxMjUiLCJhIjoiY2p1d3VpZG50MGdjcDQzbXdiNmtlcWFueSJ9.OFDtycGpIKFrFQN2-dP35A")
    // console.log('It is...',response)

    // await getRoute([-122.677738,45.522458])
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
          <form>
            <span>{this.state.prefMiles}</span>
            <button type="submit">Submit</button>
          </form>
          <button onClick={this.plus}>+</button>
          <button onClick={(e) => {this.setState({prefMiles: miles - 1})}}>-</button>
        </div>
      </div>
    )
  }
}
