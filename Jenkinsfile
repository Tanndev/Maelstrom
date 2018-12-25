#!/usr/bin/env groovy

pipeline {
    agent {
        dockerfile {
            filename 'Dockerfile.Jenkins-agent'
            args '-v /var/run/docker.sock:/var/run/docker.sock -v /etc/passwd:/etc/passwd -v /var/lib/jenkins:/var/lib/jenkins'
        }
    }

//    environment {
//        HOME = '.'
//    }

    stages {
        environment {
            RELEASE_VERSION = 'unreleased'
        }

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

        stage('Release') {
            when {
                branch 'master'
            }
            steps {

                // Run Semantic release
                script {
                    credentials = [
                            string(credentialsId: 'github-personal-access-token', variable: 'GITHUB_TOKEN'),
                            string(credentialsId: 'npm-token', variable: 'NPM_TOKEN'),
                            usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')
                    ]
                }
                withCredentials(credentials) {
                    sh 'npx semantic-release'
                }
                sh 'cat CHANGELOG.md'
                script {
                    RELEASE_VERSION = sh (
                            script: "git describe --tags",
                            returnStdout: true
                    ).trim()
                    RELEASE_URL = 'https://github.com/Tanndev/Maelstrom/releases/tag/' + RELEASE_VERSION
                    echo "Version: ${RELEASE_VERSION} can be viewed at ${RELEASE_URL}"
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'master'
                not {
                    environment name: RELEASE_VERSION, value: 'unreleased'
                }
            }
            steps {
                script {
                    sshagent(['jenkins.ssh']) {
                        sh 'ssh docker.tanndev.com rm -rf maelstrom'
                        sh 'ssh docker.tanndev.com mkdir maelstrom'
                        sh 'scp docker-compose.yml docker.tanndev.com:maelstrom/'
                        sh 'ssh docker.tanndev.com "cd maelstrom && docker-compose pull"'
                        sh 'ssh docker.tanndev.com "cd maelstrom && docker-compose up -d"'
                    }
                }
                slackSend channel: '#maelstrom', color: 'good', message: "Successfully published <https://maelstrom.tanndev.com|Maelstrom> ${RELEASE_VERSION}. (<${RELEASE_URL}|Release Notes>)"
            }
        }
    }

    post {
        failure {
            slackSend channel: '#maelstrom', color: 'danger', message: "Failed to build/publish Maelstrom. (<${env.JOB_URL}|Pipeline>) (<${env.BUILD_URL}console|Console>)"
        }
    }
}
