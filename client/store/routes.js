import Axios from 'axios'

const CREATE_NEW_ROUTE = 'CREATE_NEW_ROUTE'
const GET_CURRENT_ROUTE = 'GET_CURRENT_ROUTE'

const createNewRoute = route => {
  return {
    type: CREATE_NEW_ROUTE,
    route
  }
}

const getCurrentRoute = route => {
  return {
    type: GET_CURRENT_ROUTE,
    route
  }
}

export const getCurrentRouteThunk = id => {
  return async dispatch => {
    try {
      const {data} = Axios.get(`/api/routes/${id}`)
      dispatch(getCurrentRoute(data))
    } catch (error) {
      console.error(error)
    }
  }
}

export const createNewRouteThunk = (coords, state, city, country) => {
  return async dispatch => {
    try {
      const {data} = Axios.post('/api/routes/', {coords, state, city, country})
      dispatch(createNewRoute(data))
    } catch (error) {
      console.error(error)
    }
  }
}

export const routeReducer = (state = {routes: [], curRoute: {}}, action) => {
  switch (action.type) {
    case CREATE_NEW_ROUTE:
      return {...state, routes: [...state.routes, action.route]}
    case GET_CURRENT_ROUTE:
      return {...state, curRoute: action.route}
    default:
      return state
  }
}
