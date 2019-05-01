/* global expect it describe fetch beforeEach */
import * as React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
// eslint-disable-next-line
import { mount, shallow } from 'enzyme'

import { flushAllPromises } from '../../utilities'
import ConnectedRepo from './index'
import { REPO_COMPONENT_CLASS_NAME } from '../../constants'
import { setupStore } from '../../setupStore'


describe('Repo component', () => {
  let store
  const someRepoName = 'somereponame'
  const ownProps = { match: { params: { name: someRepoName } } }

  beforeEach(() => {
    // need to explicitly say repo: {} here for initial state
    // because for some reason multiple tests cause the store
    // to retain properties from previous tests
    store = setupStore(undefined, { repo: {} })
    fetch.mock.calls = []
    fetch.mock.instances = []
    fetch.mock.invocationCallOrder = []
    fetch.mock.results = []
  })

  it('should render', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <ConnectedRepo {...ownProps} />
        </Router>
      </Provider>,
    )
    const divElm = wrapper.find(`.${REPO_COMPONENT_CLASS_NAME}`)
    expect(divElm.exists()).toBeTruthy()
  })

  it('should fetch if store does not have repo data', async () => {
    mount(
      <Provider store={store}>
        <Router>
          <ConnectedRepo {...ownProps} />
        </Router>
      </Provider>,
    )
    await flushAllPromises()
    expect(fetch.mock.calls.length).toBe(1)
  })

  it('should NOT fetch if store does have repo data', async () => {
    const store2 = setupStore(undefined, { repo: { name: someRepoName, license: null } })

    mount(
      <Provider store={store2}>
        <Router>
          <ConnectedRepo {...ownProps} />
        </Router>
      </Provider>,
    )
    await flushAllPromises()
    expect(fetch.mock.calls.length).toBe(0)
  })

  it('should render the name, and description of the repo', () => {
    const store2 = setupStore(undefined, { repo: { name: someRepoName, description: 'test', license: null } })
    const wrapper = mount(
      <Provider store={store2}>
        <Router>
          <ConnectedRepo {...ownProps} />
        </Router>
      </Provider>,
    )

    const html = wrapper.html()
    // the arrows represent the closing and opening tags that surround the text
    expect(html).toMatch(`>${someRepoName}<`)
    expect(html).toMatch('>"test"<')
  })
})
