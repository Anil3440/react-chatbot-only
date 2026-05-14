pipeline {
    agent any

    environment {
        DOCKERHUB_USER  = "anil40"
        IMAGE_NAME      = "${DOCKERHUB_USER}/react-chatbot"
        IMAGE_TAG       = "${BUILD_NUMBER}"
        CONTAINER_NAME  = "react-chatbot"
        EC2_HOST        = "13.60.173.26"
        EC2_USER        = "ubuntu"
        EC2_APP_PORT    = "80"
    }

    stages {

        stage('Clone Repository') {
            steps {
                echo '📥 Cloning repo...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Health Validation') {
            steps {
                echo '🏥 Running health check...'
                sh '''
                    docker run -d --name health-test -p 8090:80 ${IMAGE_NAME}:latest
                    sleep 8
                    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8090/healthz)
                    docker stop health-test && docker rm health-test
                    if [ "$RESPONSE" = "200" ]; then
                        echo "✅ Health check PASSED"
                    else
                        echo "❌ Health check FAILED: HTTP $RESPONSE"
                        exit 1
                    fi
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo '📤 Pushing to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo '🚀 Deploying container...'
                sh '''
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --restart always \
                        -p ${EC2_APP_PORT}:80 \
                        ${IMAGE_NAME}:latest
                    echo "✅ Deployed!"
                    docker ps | grep ${CONTAINER_NAME}
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline complete! App is live.'
        }
        failure {
            echo '💥 Pipeline failed. Check logs.'
        }
    }
}
