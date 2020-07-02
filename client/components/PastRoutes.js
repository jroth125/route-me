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
        console.log('about to send this up', this.props.userId)
        this.props.getRoutes(this.props.userId)
    }

    render() {
        console.log('the user id is', this.props.userId)
        return (
        <div>
            <table>
                <tr>
                    <td>Name</td>
                    <td>City</td>
                    <td>State</td>
                    <td>Date Created</td>
                </tr>
                {this.props.routes ? this.props.routes.map((route, idx) => {
                    return (
                    <tr key={route.id}>
                        <td><Link to={`/past/${route.id}`}>{route.name}</Link></td>
                        <td>{route.city}</td>
                        <td>{route.state}</td>
                        <td>{route.createdAt}</td>
                    </tr>
                    )
                }) : null}
            </table>
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