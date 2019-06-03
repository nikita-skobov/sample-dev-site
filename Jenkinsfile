pipeline {
  agent any

  environment {
      NODE_MODULES_EXISTS = 0
  }

  stages {
    stage('Setup') {
        steps {
            script {
                NODE_MODULES_EXISTS = sh(script: "[ -d ./node_modules/ ]", returnStatus: true)
            }
            sh "echo Node modules exists: ${NODE_MODULES_EXISTS}"
        }
    }
    stage('Test') {
      steps {
        sh "echo Node modules exists: ${NODE_MODULES_EXISTS}"
        sh 'node -v'
        sh 'npm -v'
        sh 'npm install'
        sh 'npm run test-CI-json'
      }
    }
  }

  post {
    always {
      echo 'maybe delete some stuff here?'
      sh 'echo $(ls)'
      sh 'sudo npm update -g local-badges'
      sh "npm run badges -- ${currentBuild.result}"
      // sh 'node /home/linaro/Desktop/coverage/node_modules/coverage-badger/lib/cli.js -e 90 -g 65 -r ./coverage/clover.xml -d ./reports/'
      // sh 'sudo curl http://localhost:8080/buildStatus/icon?job=react-redux-jest-template -o ./reports/buildstatus.svg'
    }
    success {
      echo 'Nice!!!'
    }
    unstable {
      echo 'Are we unstable?? why?'
    }
    failure {
      echo 'Im a failure :('
    }
  }
}
