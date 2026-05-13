pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        REGISTRY = 'docker.io'
        IMAGE_NAME = 'your-dockerhub-username/react-chatbot'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        FULL_IMAGE = "${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
        LATEST_IMAGE = "${env.REGISTRY}/${env.IMAGE_NAME}:latest"
        CONTAINER_NAME = 'react-chatbot'
        LOCAL_TEST_PORT = '8080'
        EC2_HOST = 'your-ec2-public-dns'
        EC2_USER = 'ec2-user'
        EC2_APP_PORT = '80'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install And Build Frontend') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $FULL_IMAGE -t $LATEST_IMAGE .'
            }
        }

        stage('Health Validation') {
            steps {
                sh '''
                    set -eu
                    docker rm -f chatbot-smoke >/dev/null 2>&1 || true
                    docker run -d --name chatbot-smoke -p ${LOCAL_TEST_PORT}:80 $FULL_IMAGE

                    for attempt in $(seq 1 15); do
                      if curl -fsS http://127.0.0.1:${LOCAL_TEST_PORT}/healthz >/dev/null; then
                        echo "Container health check passed."
                        exit 0
                      fi
                      sleep 2
                    done

                    echo "Health check failed."
                    docker logs chatbot-smoke || true
                    exit 1
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh '''
                        set -eu
                        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                        docker push $FULL_IMAGE
                        docker push $LATEST_IMAGE
                    '''
                }
            }
        }

        stage('Deploy To EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh '''
                        set -eu
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} "
                            docker pull ${LATEST_IMAGE} &&
                            docker rm -f ${CONTAINER_NAME} >/dev/null 2>&1 || true &&
                            docker run -d \
                              --name ${CONTAINER_NAME} \
                              --restart unless-stopped \
                              -p ${EC2_APP_PORT}:80 \
                              ${LATEST_IMAGE}
                        "
                    '''
                }
            }
        }
    }

    post {
        always {
            sh '''
                docker rm -f chatbot-smoke >/dev/null 2>&1 || true
                docker logout >/dev/null 2>&1 || true
            '''
        }
        success {
            echo "Deployment completed successfully."
        }
    }
}
