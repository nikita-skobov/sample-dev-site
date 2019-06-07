pipeline {
  agent any

  environment {
      NODE_MODULES_EXISTS = 0
      PACKAGE_WAS_CHANGED = 0
      SERVERLESS_WAS_CHANGED = 0
      WEB_BUCKET = "staging-projects.nikitas.link"
      REPORT_BUCKET = "staging-projects.nikitas.link-reports"
      REPORT_BUCKET_PRODUCTION = "projects.nikitas.link-reports"
      REPORT_BUCKET_STAGING = "staging-projects.nikitas.link-reports"
      DEPLOYMENT_STAGE = "staging"
      HOSTED_ZONE_NAME = "nikitas.link"
      UA_SECRET = "${env.STAGING_SAMPLE_DEV_SITE_UASECRET}"
      CERTID = "${env.STAGING_SAMPLE_DEV_SITE_CERTID}"
      NUMBER_OF_COMMITS = 0
      BUILD_START_TIME = ""
      BUILD_END_TIME = ""
  }

  stages {
    stage('Setup') {
        steps {
            script {
                BUILD_START_TIME = sh(script: 'date +%s', returnStdout: true).trim()

                if (env.GIT_BRANCH == "origin/master-production") {
                  echo "THIS IS A PRODUCTION BUILD"
                  WEB_BUCKET = "projects.nikitas.link"
                  REPORT_BUCKET = "projects.nikitas.link-reports"
                  DEPLOYMENT_STAGE = "production"
                  UA_SECRET = "${env.PRODUCTION_SAMPLE_DEV_SITE_UASECRET}"
                  CERTID = "${env.PRODUCTION_SAMPLE_DEV_SITE_CERTID}"
                }

                NUMBER_OF_COMMITS = sh(script: 'git log ${GIT_PREVIOUS_COMMIT}..${GITCOMMIT} --pretty=oneline | wc -l', returnStdout: true).trim()
                echo "number of commits: ${NUMBER_OF_COMMITS}"
                NODE_MODULES_EXISTS = sh(script: "[ -d ./node_modules/ ]", returnStatus: true)
                echo "previous commit: ${env.GIT_PREVIOUS_COMMIT}"
                echo "current commit: ${env.GIT_COMMIT}"
                PACKAGE_WAS_CHANGED = sh(script:'echo $(git diff --name-only ${GIT_PREVIOUS_COMMIT} ${GIT_COMMIT}) | grep --quiet "package.json"', returnStatus: true)
                echo "package was changed? ${PACKAGE_WAS_CHANGED}"

                if (NODE_MODULES_EXISTS == 1) {
                    // 1 means it does NOT exist
                    echo "node modules does not exist. running npm install"
                } else if (PACKAGE_WAS_CHANGED == 0) {
                    // 0 means it WAS changed
                    echo "package.json has changed. running npm install"
                    sh 'npm install'
                } else {
                    echo "package.json is the same as it was last time. skipping npm install"
                }
            }
        }
    }
    stage('Test') {
      steps {
        sh 'node -v'
        sh 'npm -v'
        sh 'npm run test-CI-json'
      }
    }

    stage('Infrastructure Deployment') {
        steps {
            script {
                SERVERLESS_WAS_CHANGED = sh(script:'echo $(git diff --name-only ${GIT_PREVIOUS_COMMIT} ${GIT_COMMIT}) | grep --quiet "deployment/*"', returnStatus: true)
                echo "serverless was changed? ${PACKAGE_WAS_CHANGED}"

                if (SERVERLESS_WAS_CHANGED == 0 || DEPLOYMENT_STAGE == "production") {
                    // 0 means it WAS changed
                    echo "Running serverless deploy"
                    sh "cd deployment/ && sls deploy --stage ${DEPLOYMENT_STAGE} --account ${env.AWS_ACCOUNT_NUMBER} --bucket ${WEB_BUCKET} --uasecret ${UA_SECRET} --certid ${CERTID} --logbucket ${env.LOGBUCKET_NAME} --hzname ${HOSTED_ZONE_NAME}"
                    sh "bash ./deployment/create-reports-folder.sh ${REPORT_BUCKET}"
                } else {
                    echo "serverless was the same since last commit. skipping serverless deploy"
                }
            }
        }
    }

    stage('Infrastructure Testing') {
        steps {
            sh "bash ./deployment/test-all.sh --web-bucket ${WEB_BUCKET} --report-bucket ${REPORT_BUCKET}"
        }
    }

    stage('Building') {
        steps {
            sh 'npm run build'
            sh 'bash ./scripts/gzipAll.sh'
        }
    }

    stage('Deploying') {
        steps {
            sh "aws s3 rm s3://${WEB_BUCKET} --recursive"
            // remove all items from website before updating it
            sh "bash ./scripts/deployAll.sh --bucket=${WEB_BUCKET} --ttl=public,max-age=20"
        }
    }
  }

  post {
    always {
      script {
        BUILD_END_TIME = sh(script: 'date +%s', returnStdout: true).trim()
      }
      echo 'maybe delete some stuff here?'
      sh 'echo $(ls)'
      sh 'sudo npm update -g local-badges'
      // sh "npm run badges -- ${currentBuild.result}"
      // sh "aws s3 cp ./badges/ s3://staging-projects.nikitas.link-reports/reports/${env.JOB_NAME}/badges/ --recursive --cache-control public,max-age=20"
      sh "node runReport.js --current-commit ${env.GIT_COMMIT} --num-commits ${NUMBER_OF_COMMITS} --branch ${env.GIT_BRANCH} --build-start ${BUILD_START_TIME} --build-end ${BUILD_END_TIME} --coverage-path coverage/clover.xml --build-status ${currentBuild.result} > latest.json"
      script {
        if (DEPLOYMENT_STAGE == "staging") {
          // if in staging we want to send a report to both the production bucket
          // (because this is still a build, and we want to see a history of builds)
          // as well as the staging bucket for testing the infrastructure
          sh "bash ./scripts/sendReport.sh --report-bucket ${REPORT_BUCKET_STAGING} --project-name ${env.JOB_NAME} --dont-delete true"    
        }
      }
      sh "bash ./scripts/sendReport.sh --report-bucket ${REPORT_BUCKET_PRODUCTION} --project-name ${env.JOB_NAME}"
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
