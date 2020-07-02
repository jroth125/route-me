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
        zoom: 15
    }
  }

  
  async componentDidMount() {
    this.props.getCurRoute(this.props.match.params.routeId)
    console.log('the curRoute is',this.props.coords)
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-73.966645, 40.781358],
      zoom: this.state.zoom,
    })

    this.setState({map})

    
  }

componentDidUpdate(prevProps, prevState){
  if (this.props.coords !== prevProps.coords) {
    console.log("prevProps:", prevProps.coords)
    console.log("new props:", this.props)
  } else {
    console.log("damn")
  }
}

  render() {
    const miles = this.state.prefMiles
    return (
      <div>
        <div className="map-container">
        </div>
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
        coords: state.routes.curRoute
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        getCurRoute: (id) => dispatch(getCurrentRouteThunk(id))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PastRouteMap)