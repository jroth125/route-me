import Axios from 'axios'

const CREATE_NEW_ROUTE = 'CREATE_NEW_ROUTE'
const GET_CURRENT_ROUTE = 'GET_CURRENT_ROUTE'
const GET_ALL_USER_ROUTES = "GET_ALL_USER_ROUTES"


const createNewRoute = route => {
  return {
    type: CREATE_NEW_ROUTE,
    route
  }
}

export const getCurrentRoute = route => {
  return {
    type: GET_CURRENT_ROUTE,
    route
  }
}
const getAllUserRoutes = routes => ({
  type: GET_ALL_USER_ROUTES,
  routes
})

export const getCurrentRouteThunk = id => {
  return async dispatch => {
    try {
      const {data} = await Axios.get(`/api/routes/${id}`)
      const parsedRoute = JSON.parse(data.coords)
      dispatch(getCurrentRoute(parsedRoute))
    } catch (error) {
      console.error(error)
    }
  }
}

export const createNewRouteThunk = (coords, name, state, city, country, distance, userId) => {
  return async dispatch => {
    try {
      const {data} = await Axios.post('/api/routes/', {coords, name, state, city, country, distance, userId})
      dispatch(createNewRoute(data))
    } catch (error) {
      console.error(error)
    }
  }
}

export const getUserRoutesThunk = id => {
  return async dispatch => {
    try {
      const {data} = await Axios.get(`/api/routes/allroutes/${id}`)
      dispatch(getAllUserRoutes(data))
    } catch (error) {
      console.error('getUserRoutesThunk did not go through', error)
    }
  }
}

export const routeReducer = (state = {allRoutes: [], curRoute: {}}, action) => {
  switch (action.type) {
    case CREATE_NEW_ROUTE:
      return {...state, allRoutes: [...state.allRoutes, action.route]}
    case GET_CURRENT_ROUTE:
      return {...state, curRoute: action.route}
    case GET_ALL_USER_ROUTES:
      return {...state, allRoutes: [...action.routes]}
    default:
      return state
  }
}
