#!/usr/bin/env groovy

pipeline {
    agent {
        label 'nodejs && docker && kubectl'
    }

    stages {

        stage('Build') {
            steps {
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
                script {
                    RELEASE_VERSION = sh ( script: "git tag --points-at HEAD", returnStdout: true ).trim()
                    if (RELEASE_VERSION) {
                        RELEASE_URL = "https://github.com/tanndev/maelstrom/releases/tag/${RELEASE_VERSION}"
                        echo "Version: ${RELEASE_VERSION} can be viewed at ${RELEASE_URL}"
                        currentBuild.displayName = RELEASE_VERSION
                        currentBuild.description = RELEASE_URL
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'master'
            }
            steps {
                script {
                    // Deploy the app.
                    withKubeConfig([
                            credentialsId: 'microservices-kubernetes-token',
                            serverUrl: "$MICROSERVICES_KUBERNETES_SERVER",
                            namespace: 'maelstrom'
                    ]) {
                        sh 'kubectl apply -f manifest.yaml'
                        sh 'kubectl rollout restart deployment/maelstrom'
                    }

                    if (RELEASE_VERSION) {
                        slackSend channel: '#maelstrom', color: 'good', message: "Released <https://maelstrom.tanndev.com|Maelstrom> ${RELEASE_VERSION}. (<${RELEASE_URL}|Release Notes>) (<${env.BUILD_URL}console|Build Console>)"
                    }
                    else {
                        slackSend channel: '#maelstrom', color: 'good', message: "Redeployed <https://maelstrom.tanndev.com|Maelstrom>. (<${env.BUILD_URL}console|Build Console>)"
                    }
                }
            }
        }
    }

    post {
        failure {
            slackSend channel: '#maelstrom', color: 'danger', message: "Failed to build/publish Maelstrom. (<${env.JOB_URL}|Pipeline>) (<${env.BUILD_URL}console|Build Console>)"
        }
    }
}
