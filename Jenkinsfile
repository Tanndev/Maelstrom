#!/usr/bin/env groovy

pipeline {

    agent {
        docker {
            image 'node'
            args '-u root'
        }
    }

    stages {
        stage('Build') {
            steps {
//                script {
//                    currentBuild.displayName = "Some build"
//                    currentBuild.description = "A description of that build"
//                }
                echo 'Building...'
                sh 'npm install'

                // Build the image.
                sh 'docker build . -t jftanner/maelstrom:latest'
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
                echo 'Better if it did something.'
            }
        }

        stage('Publish') {
            when {
                branch 'master'
            }
            steps {
                withDockerRegistry(url: "", credentialsId: "docker-hub-credentials") {
                    sh 'docker push jftanner/maelstrom:latest'
                }
            }
        }
        stage('Deploy') {
            when {
                branch 'master'
            }
            steps {
                script {
                    transfers = [
                        sshTransfer(execCommand: 'ls -la', remoteDirectory: '/srv/maelstrom')
                    ]
                }
                sshPublisher(publishers: [sshPublisherDesc(configName: 'Maelstrom Droplet', transfers: transfers)])
            }
        }
    }
}
