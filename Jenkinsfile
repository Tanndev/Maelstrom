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
                image = docker.build('docker pull jftanner/maelstrom')
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                echo 'I think it worked!'
            }
            image.inside {
                sh 'echo "I\'m inside a container!"'
            }
        }
        stage('Publish') {
            when {
                branch 'master'
            }
            steps {
                docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                    image.push("latest")
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
