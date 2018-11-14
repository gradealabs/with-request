import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as PropTypes from 'prop-types'
import { compose } from 'recompose'
import withRequest from '../src/withRequest'

class Widget extends React.PureComponent {
  static propTypes = {
    moneyResponse: PropTypes.number.isRequired,
    moneyRequest: PropTypes.func.isRequired
  }

  render () {
    const { moneyResponse, moneyRequest } = this.props

    console.warn('--- RENDER CALLED', JSON.stringify(this.props))

    return (
      <div>
        Money: ${moneyResponse.toFixed(2)}<br />
        <button onClick={() => moneyRequest(moneyResponse, 10)}>Increase $$ Money $$</button>
      </div>
    )
  }
}

const enhancedWidget = compose(
  withRequest(props => (purse, amount) => {
    console.warn('--- (should always be called) requesting with purse:', purse, 'and adding amount:', amount)
    return new Promise(resolve => {
      setTimeout(() => {
        const total = purse + amount
        console.warn('---- (should always be called) resolving with total:', total)
        resolve(total)
      }, 3000)
    })
  }, { prefix: 'money', defaultResponse: 0 })
)(Widget)

ReactDOM.render(
  React.createElement(enhancedWidget, {}),
  document.getElementById('root')
)
