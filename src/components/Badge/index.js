import React from 'react'
import { Button, ButtonGroup } from 'reactstrap'
import { connect } from 'react-redux'

export function Badge(props) {
  const {
    colorA = 'secondary',
    colorB = 'success',
    textA,
    textB,
    size = 'sm',
  } = props

  return (
    <ButtonGroup>
      <Button disabled style={{ opacity: 1 }} size={size} color={colorA}>
        {textA}
      </Button>
      <Button disabled style={{ opacity: 1 }} size="sm" color={colorB}>
        {textB}
      </Button>
    </ButtonGroup>
  )
}

export default connect()(Badge)