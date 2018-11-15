var withRequest = require('./lib/withRequest')

module.exports = {
  withRequest: withRequest.default,
  withCallRequestOnMount: withRequest.withCallRequestOnMount,
  withCallRequestOnChange: withRequest.withCallRequestOnChange,
  withConsolidatedRequestProps: withRequest.withConsolidatedRequestProps
}
