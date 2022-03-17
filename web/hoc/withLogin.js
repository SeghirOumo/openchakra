import React from 'react'
const {isB2BStyle}=require('../utils/context')
const {setAuthToken, setAxiosAuthentication}=require('../utils/authentication')

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
  
    onChange = e => {
      const {name, value} = e.target
      this.setState({...this.state, [name]: value})
    }
  
    checkRoles = e => {
  
      const {name, value} = e.target
      const newState = {...this.state, [name]: value}
  
      if(name === 'username') {
        Object.assign(newState, {roles: null})
        // TODO aller chercher les rôles au bout d'une tepo, sinon GET /roles trop nombreux
        const usermail = e.target.value
        if (Validator.isEmail(usermail)) {
          axios.get(`/myAlfred/api/users/roles/${usermail}`)
            .then(res => {
              const roles = res.data
              const filteredRoles = roles.filter(r => (isB2BStyle() ? r != EMPLOYEE : r == EMPLOYEE))
              const selectedRole = filteredRoles.length == 1 ? filteredRoles[0] : null
              // console.log({roles: filteredRoles, selectedRole: selectedRole})
              Object.assign(newState, {roles: filteredRoles, selectedRole: selectedRole})
            })
            .catch(err => {
              console.error(err)
              Object.assign(newState, {selectedRole: null, roles: ''})
            })
        }
      }
      this.setState({...newState})
    }
  
    onSubmit = e => {
      e.preventDefault()
  
      const user = {
        username: this.state.username,
        password: this.state.password,
        role: this.state.selectedRole,
        b2b_login: isB2BStyle(),
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
