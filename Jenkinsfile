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
//                sh 'docker build . -t jftanner/maelstrom:latest'
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
                echo 'Better if it did something.'
            }
        }

//        stage('Publish') {
//            when {
//                branch 'master'
//            }
//            steps {
//                withDockerRegistry(url: "", credentialsId: "docker-hub-credentials") {
//                    sh 'docker push jftanner/maelstrom:latest'
//                }
//            }
//        }
        stage('Deploy') {
            when {
                branch 'master'
            }
            steps {
                script {
                    transfers = [
                        sshTransfer(sourceFiles: '**', execCommand: 'docker-compose up --build -d')
                    ]
                }
                sshPublisher(publishers: [sshPublisherDesc(configName: 'Maelstrom Droplet', transfers: transfers)])
            }
        }
    }

    post {
        success {
            slackSend color: 'good', message: 'Successfully redeployed <https://maelstrom.tanndev.com|Maelstrom>.'
        }
        failure {
            slackSend color: 'danger', message: 'Failed to redeploy Maelstrom. (<${env.JOB_URL}|Pipeline>) (<${env.BUILD_URL}console|Console>)")'
        }
    }
}
