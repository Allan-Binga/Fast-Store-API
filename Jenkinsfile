/* groovylint-disable-next-line CompileStatic */
pipeline {
    agent any
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
    }
}
