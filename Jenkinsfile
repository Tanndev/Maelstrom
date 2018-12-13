#!/usr/bin/env groovy

pipeline {
    agent any

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
                    image = docker.build("jftanner/maelstrom")
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
                // TODO Actually test something
            }
        }

        stage('Deploy') {
            when {
                branch 'master'
            }
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        image.push('latest')
                    }
                    sh 'ssh docker.tanndev.com rm -f maelstrom-compose.yml'
                    sh 'scp docker-compose.yml docker.tanndev.com:maelstrom-compose.yml'
                    sh 'ssh docker.tanndev.com docker-compose -f maelstrom-compose.yml pull app'
                    sh 'ssh docker.tanndev.com docker-compose -f maelstrom-compose.yml up -d'
                }
                slackSend channel: '#maelstrom', color: 'good', message: 'Successfully published <https://maelstrom.tanndev.com|Maelstrom App>.'
            }
        }
    }

    post {
        failure {
            slackSend channel: '#maelstrom', color: 'danger', message: "Failed to build/publish Maelstrom App. (<${env.JOB_URL}|Pipeline>) (<${env.BUILD_URL}console|Console>)"
        }
    }
}
