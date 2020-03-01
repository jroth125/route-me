const CREATE_NEW_ROUTE = "CREATE_NEW_ROUTE"

const createNewRoute = (route) => {
    return {
        type: CREATE_NEW_ROUTE,
        route
    }
}


const routeReducer = (state = {}, action) => {
    switch (action.type) {
        case CREATE_NEW_ROUTE:
            return {...state, routes: [...state.routes, action.route]}
        default: 
            return state
    }
}