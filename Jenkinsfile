#!/usr/bin/env groovy

pipeline {
    agent {
        dockerfile {
            filename 'Dockerfile.jenkins-agent'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            registryUrl 'https://registry.hub.docker.com'
            registryCredentialsId  'docker-hub-credentials'
        }
    }

//    environment {
//        HOME = '.'
//    }

    stages {
        stage('Build') {
            steps {
//                script {
//                    currentBuild.displayName = "Some build"
//                    currentBuild.description = "A description of that build"
//                }
                echo 'Building...'
                // TODO Actually build an image to test with.
//                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
                // TODO Actually test something
            }
        }

        stage('Release') {
            when {
                branch 'master'
            }
            steps {
                // Run Semantic release
                script {
                    credentials = [
                            string(credentialsId: 'github-personal-access-token', variable: 'GITHUB_TOKEN'),
                            string(credentialsId: 'npm-token', variable: 'NPM_TOKEN')
                    ]
                }
                withCredentials(credentials) {
                    sh "npx semantic-release"
                }

                // Build the image.
                script {
                    image = docker.build("jftanner/maelstrom")
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
                    sh 'ssh docker.tanndev.com rm -rf maelstrom'
                    sh 'ssh docker.tanndev.com mkdir maelstrom'
                    sh 'scp docker-compose.yml docker.tanndev.com:maelstrom/'
                    sh 'ssh docker.tanndev.com "cd maelstrom && docker-compose pull app"'
                    sh 'ssh docker.tanndev.com "cd maelstrom && docker-compose up -d"'
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
