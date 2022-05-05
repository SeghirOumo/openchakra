const lodash=require('lodash')
const {CUSTOMER_ADMIN} = require('../../utils/feurst/consts')

const {RELATED} = require('../../utils/feurst/consts')

const {USER_ACTIONS, ALL, COMPANY} = require('../../utils/consts')

const getActions = (roles, model, action) => {
  const actions=lodash.flattenDeep(roles.map(role => USER_ACTIONS[role]))
  if (!actions) {
    return []
  }
  return actions.filter(a => a.model==model && a.action==action)
}

const isActionAllowed = (roles, model, action) => {
  const actions=getActions(roles, model, action)
  const allowed=actions.length>0
  return allowed
}

const filterOrderQuotation = (data, model, user, action) => {
  const userActions=getActions(user.roles, model, action)
  if (userActions.some(userAction => userAction.visibility==ALL)) {
    return data
  }
  if (userActions.some(userAction => userAction.visibility==RELATED)) {
    return data.filter(d => user.companies.map(c => String(c._id)).includes(String(d.company._id)))
  }
  if (userActions.some(userAction => userAction.visibility==COMPANY)) {
    return data.filter(d => String(d.company._id)==String(user.company?._id))
  }
  return []
}

const filterUsers = (data, model, user, action) => {
  const userActions=getActions(user.roles, model, action)
  if (userActions.some(userAction => userAction.visibility==ALL)) {
    return data
  }
  if (userActions.some(userAction => userAction.visibility==RELATED)) {
    return data.filter(u => !!u.company && u.roles.includes(CUSTOMER_ADMIN) && user.companies.map(c => String(c._id)).includes(String(u.company._id)))
  }
  if (userActions.some(userAction => userAction.visibility==COMPANY)) {
    return data.filter(d => String(d.company?._id)==String(user.company?._id))
  }
  return []
}

const filterCompanies = (data, model, user, action) => {
  const userActions=getActions(user.roles, model, action)
  if (userActions.some(userAction => userAction.visibility==ALL)) {
    return data
  }
  if (userActions.some(userAction => userAction.visibility==RELATED)) {
    return data.filter(c => user.companies.map(c => String(c._id)).includes(String(c._id)))
  }
  if (userActions.some(userAction => userAction.visibility==COMPANY)) {
    return data.filter(c => String(c._id)==String(user.company?._id))
  }
  return []
}

const getActionsForRoles = roles => {
  let actions=lodash.flattenDeep(roles.map(role => USER_ACTIONS[role]))
  actions=lodash.uniq(actions)
  return actions
}

module.exports={isActionAllowed, filterOrderQuotation, getActionsForRoles,
  filterUsers, filterCompanies}
