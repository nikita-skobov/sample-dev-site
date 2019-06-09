const { buildStatus, cloverCoverage } = require('nikitas-badges')

function parseCommandLineArguments(argList) {
  const has = Object.prototype.hasOwnProperty
  const args = argList.slice(2)

  const cliObj = {
    _: [], // fills an array of command line arguments that arent
    // options, eg: program.sh runsomething then do something --some-arg yes
    // will fill the array with: ['runsomething', 'then', 'do', 'something']
    // and the 'some-arg' will become a seperate property of the cliObj
  }

  // used to skip iteration of indices which have already been grabbed
  const skipIndices = []

  // used to semantically check the next command line string
  const checkNext = ind => ({
    // this is a function that immediately returns an object with
    // 3 properties. exists is a bool,
    // doesntStartWith is a function,
    // str is the string of the argument at index 'ind'.
    exists: typeof args[ind] !== 'undefined',
    doesntStartWith: str => !args[ind].startsWith(str),
    str: args[ind],
  })

  const checkForDuplicates = (str) => {
    if (has.call(cliObj, str)) {
      throw new Error(`Duplicate command line argument found: ${str}`)
    }
  }

  const fillCliObject = (numDashes, str, index) => {
    const nextIndex = checkNext(index + 1)
    const property = str.substring(numDashes)
    if (nextIndex.exists && nextIndex.doesntStartWith('-')) {
      checkForDuplicates(property)

      // option with a value, ie: --name jimmy
      const value = nextIndex.str
      cliObj[property] = value
      // mark this index, and the next index as already been read
      skipIndices.push(index, index + 1)
    } else {
      checkForDuplicates(property)

      // boolean option, ie: --ignore-warnings-flag
      cliObj[property] = true
      // mark this index as already been read
      skipIndices.push(index)
    }
  }


  args.forEach((str, index) => {
    if (skipIndices.indexOf(index) >= 0) {
      // we already grabbed that index, so skip
      return null
    }

    if (str.startsWith('--')) {
      fillCliObject(2, str, index)
    } else if (str.startsWith('-')) {
      fillCliObject(1, str, index)
    } else {
      // adds an argument to an array of arguments that dont
      // correspond to any options like --name, or -c
      cliObj._.push(str)
      skipIndices.push(index)
    }

    return null
  })

  return cliObj
}


const cliObj = parseCommandLineArguments(process.argv)

const coverageBadge = cloverCoverage.fn(cliObj)
const buildStatusBadge = buildStatus.fn(cliObj)

const branchSplit = cliObj.branch.split('/')
const lastBranchIndex = branchSplit.length - 1
const start = parseInt(cliObj['build-start'], 10) / 1000 // convert to seconds
const duration = parseInt(cliObj['build-duration'], 10) / 1000 // convert to seconds
const end = start + duration

const report = {
  badges: [
    buildStatusBadge,
    coverageBadge,
  ],
  num_commits: cliObj['num-commits'],
  branch: branchSplit[lastBranchIndex],
  time_ended: end,
  duration,
  current_commit: cliObj['current-commit'],
  status: cliObj['build-status'],
  // stages
  // // { name, time, pass_or_fail }
}

console.log(JSON.stringify(report))
