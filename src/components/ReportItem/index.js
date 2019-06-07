import React, { Component } from 'react'

import { ListGroup, ListGroupItem, Collapse, Spinner } from 'reactstrap'


function Arrow(props) {
  const { collapseOpen } = props
  if (collapseOpen) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 8 8">
        <path d="M1.5 0l-1.5 1.5 4 4 4-4-1.5-1.5-2.5 2.5-2.5-2.5z" transform="translate(0 1)" />
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 8 8">
      <path d="M1.5 0l-1.5 1.5 2.5 2.5-2.5 2.5 1.5 1.5 4-4-4-4z" transform="translate(1)" />
    </svg>
  )
}

function BuildInfo(props) {
  const { data } = props
  if (!data) {
    return (
      <ListGroupItem>
        <Spinner color="dark" />
      </ListGroupItem>
    )
  }

  return (
    <ListGroupItem>
      <ul>
        <li>Status: {data.status}</li>
        <li>Finished: {new Date(data.time_ended * 1000).toDateString()}</li>
        <li>Branch: {data.branch}</li>
        <li>Commit: {data.current_commit}</li>
        <li>commits since previous build: {data.num_commits}</li>
        <li>Duration: {Math.floor(data.duration / 60)} min {data.duration % 60} sec</li>
      </ul>
    </ListGroupItem>
  )
}

export class ReportItem extends Component {
  constructor(props) {
    super(props)

    const { isLatest } = props

    this.state = {
      // if on the latest build report, have it open by default
      // otherwise keep the report items closed
      collapseOpen: isLatest,
      haveFetched: false,
    }

    this.toggleCollapse = this.toggleCollapse.bind(this)
  }

  toggleCollapse() {
    const {
      data,
      fetchReportCallback,
      repoName,
      buildNumber,
    } = this.props

    this.setState((prevState) => {
      const tempState = prevState

      let { collapseOpen, haveFetched } = prevState

      if (!data && !haveFetched) {
        haveFetched = true
        fetchReportCallback(repoName, `report_${buildNumber}.json`)
      }

      collapseOpen = !collapseOpen
      tempState.collapseOpen = collapseOpen
      tempState.haveFetched = haveFetched
      return tempState
    })
  }

  render() {
    const {
      isLatest,
      data,
      buildNumber,
    } = this.props

    const { collapseOpen } = this.state

    let buildNumberText = `Build Number ${buildNumber}`

    if (isLatest) {
      buildNumberText = `${buildNumberText} (latest)`
    }

    return [
      <ListGroup>
        <ListGroupItem>
          <span onClick={this.toggleCollapse} style={{ marginRight: '1em' }}>
            <Arrow collapseOpen={collapseOpen} />
          </span>
          {buildNumberText}
        </ListGroupItem>
        <Collapse isOpen={collapseOpen}>
          <BuildInfo data={data} />
        </Collapse>
      </ListGroup>,
      <br />,
    ]
  }
}

export default ReportItem
