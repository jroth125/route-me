import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {getUserRoutesThunk} from '../store/routes'
import {me} from '../store/user'

class PastRoutes extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    componentDidMount() {
        this.props.getUserId()
        this.props.getRoutes(this.props.userId)
    }

    render() {
        console.log('the user id is', this.props.userId)
        return (
        <div>
            <h1>DO YOU SEE ME!</h1>
        </div>
        )
    }
    
}

const mapStateToProps = (state) => ({
    routes: state.routes.allRoutes,
    userId: state.user.id
})

const mapDispatchToProps = dispatch => ({
    getRoutes: (id) => dispatch(getUserRoutesThunk(id)),
    getUserId: () => dispatch(me())
})

export default connect(mapStateToProps, mapDispatchToProps)(PastRoutes)