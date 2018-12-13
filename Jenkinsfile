#!/usr/bin/env groovy

pipeline {
    stages {
        stage('Build') {
            steps {
//                script {
//                    currentBuild.displayName = "Some build"
//                    currentBuild.description = "A description of that build"
//                }
                echo 'Building...'

                // Build the image.
                script {
                    var image = docker.build("jftanner/maelstrom:${env.BUILD_ID}")
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'

                script {
                    image.inside {
                        echo 'Inside the container?'
                        sh 'pwd'
                        sh 'ls'
                    }
                }
            }
        }

        stage('Publish') {
            steps {
                echo 'Publishing...'

                script {
                    image.push()
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'master'
            }
            steps {
                script {
                    image.push('latest')
                    transfers = [
                            sshTransfer(remoteDirectory: 'maelstrom', cleanRemote: true, sourceFiles: '**', execCommand: 'cd maelstrom && docker-compose up --build -d')
                    ]
                }
                sshPublisher(failOnError: true, publishers: [sshPublisherDesc(configName: 'Tanndev Docker', transfers: transfers)])
            }
        }
    }

    post {
        success {
            // TODO Differentiate between master, branch, and PR builds.
            slackSend channel: '#maelstrom', color: 'good', message: 'Successfully built <https://maelstrom.tanndev.com|Maelstrom App>.'
        }
        failure {
            slackSend channel: '#maelstrom', color: 'danger', message: "Failed to build Maelstrom. (<${env.JOB_URL}|Pipeline>) (<${env.BUILD_URL}console|Console>)"
        }
    }
}
