#!/usr/bin/env groovy

node {
    def image

    stage('Build') {
        echo 'Building...'
//            currentBuild.displayName = "Some build"
//            currentBuild.description = "A description of that build"

        // Build the image.
        image = docker.build("jftanner/maelstrom:${env.BUILD_TAG}")
    }

    stage('Test') {
        echo 'Testing...'
        image.inside {
            echo 'Inside the container?'
            sh 'pwd'
            sh 'ls'
        }
    }

    stage('Publish') {
        echo 'Publishing...'
        image.push()
    }

    stage('Deploy') {
        when {
            branch 'master'
        }
        steps {
            image.push('latest')
            transfers = [
                    sshTransfer(remoteDirectory: 'maelstrom', cleanRemote: true, sourceFiles: '**', execCommand: 'cd maelstrom && docker-compose up --build -d')
            ]
            sshPublisher(failOnError: true, publishers: [sshPublisherDesc(configName: 'Tanndev Docker', transfers: transfers)])
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
