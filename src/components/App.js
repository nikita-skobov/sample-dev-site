import React from 'react'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'

import './App.css'
import ConnectedList from './List'
import ConnectedRepo from './Repo'

import { REPO_PATH_PREFIX } from '../constants'

export function App() {
  return (
    <div className="app-root">
      <Switch>
        <Route exact path={`/${REPO_PATH_PREFIX}`} component={ConnectedList} />
        <Route path={`/${REPO_PATH_PREFIX}/:name`} component={ConnectedRepo} />
      </Switch>
    </div>
  )
}


export default connect()(App)
