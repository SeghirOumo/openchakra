export const generateId = (prefix = 'comp') => {

  const dateToUse = (new Date()).getTime()

  return `${prefix}-${(
    dateToUse.toString(36) +
    Math.random()
      .toString(36)
      .substr(2, 5)
  ).toUpperCase()}`
}
