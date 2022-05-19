import React from 'react'
import Validator from 'validator'
import axios from 'axios'
const {setAuthToken, setAxiosAuthentication}=require('../utils/authentication')
const {snackBarError}=require('../utils/notifications')

function withLogin(WrappedComponent) {
  
  return class extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        username: '',
        password: '',
        errors: {},
        showPassword: false,
        // Roles : null : pas de réposne du serveur, [] : réponse serveur pas de rôle pour l'email
        roles: null,
        selectedRole: null,
      }
    }
  
    onChange = async e => {
      const {name, value} = e.target
      const newState = {...this.state, [name]: value}
      if(name === 'username') {
        const usermail = e.target.value.trim()
        Object.assign(newState, {username: usermail, roles: null, selectedRole: null})
        if (Validator.isEmail(usermail)) {
          await axios.get(`/myAlfred/api/users/roles/${usermail}`)
            .then(res => {
              const roles = res.data
              const selectedRole = roles.length == 1 ? roles[0] : null
              Object.assign(newState, {roles, selectedRole})
              this.setState(newState)
            })
            .catch(err => {
              console.error(err)
              Object.assign(newState, {selectedRole: null, roles: null})
              this.setState(newState)
            })
        }
      }
      this.setState(newState)
    }
  
  
    onSubmit = e => {
      e.preventDefault()
  
      const user = {
        username: this.state.username,
        password: this.state.password,
        role: this.state.selectedRole,
      }
  
      axios.post('/myAlfred/api/users/login', user)
        .then(() => {
          setAuthToken()
          setAxiosAuthentication()
          this.props.login()
        })
        .catch(err => {
          console.error(err)
          if (err.response) {
            snackBarError(err.response.data)
            this.setState({...this.state, errors: err.response.data})
          }
        })
    }
  
    handleClickShowPassword = () => {
      this.setState({...this.state, showPassword: !this.state.showPassword})
    }
  
    handleMouseDownPassword = event => {
      event.preventDefault()
    }

    render() {
      return <WrappedComponent
        state={this.state}
        onChange={this.onChange}
        onSubmit={this.onSubmit}
        handleClickShowPassword={this.handleClickShowPassword}
        handleMouseDownPassword={this.handleMouseDownPassword}
        {...this.props} />
    }
  }
}

export default withLogin
