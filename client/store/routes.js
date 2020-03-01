import Axios from "axios"

const CREATE_NEW_ROUTE = "CREATE_NEW_ROUTE"

const createNewRoute = (route) => {
    return {
        type: CREATE_NEW_ROUTE,
        route
    }
}

export const createNewRouteThunk = (coords, state, city, country) => {
    return async (dispatch) => {
        try {
            const newRoute = Axios.post({coords, state, city, country})
            dispatch(createNewRoute(newRoute))
        } catch (error) {
            console.error(error)
        }
    }
}

export default routeReducer = (state = {}, action) => {
    switch (action.type) {
        case CREATE_NEW_ROUTE:
            return {...state, routes: [...state.routes, action.route]}
        default: 
            return state
    }
}