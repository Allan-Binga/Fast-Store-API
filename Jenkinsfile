/* groovylint-disable-next-line CompileStatic */
pipeline {
    agent any
    tools {
        nodejs 'nodejs 23'  // Use the Node.js version configured in Jenkins
    }
    stages {
        stage('Clone Repository') {
            steps {
                //CLONE GITHUB REPOSITORY
                git 'https://github.com/Allan-Binga/Fast-Store-API'
            }
        }
        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }
        stage('Run unit tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
    }
}
