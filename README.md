# React Chatbot CI/CD

This project now includes a Jenkins-based CI/CD flow that:

1. Builds the React chatbot application.
2. Creates a Docker image for the built app.
3. Validates the container with an HTTP health check.
4. Pushes the image to Docker Hub.
5. Deploys the latest container to an AWS EC2 instance.

## Files Added For The Assignment

- `Jenkinsfile`: Declarative Jenkins pipeline for build, validation, and EC2 deployment.
- `Dockerfile`: Multi-stage Docker build for the Vite app.
- `nginx.conf`: Nginx configuration for SPA routing and health checks.
- `public/healthz`: Simple health endpoint file for validation.
- `.dockerignore`: Keeps the Docker build context smaller.

## How The Pipeline Works

### 1. Build The Frontend

Jenkins runs:

```bash
npm ci
npm run build
```

### 2. Build The Docker Image

Jenkins builds a versioned image and also tags it as `latest`.

### 3. Validate Container Health

Jenkins starts a temporary local container and checks:

```text
http://127.0.0.1:8080/healthz
```

The deployment continues only if this endpoint returns success.

### 4. Push The Image

The pipeline logs in to Docker Hub using Jenkins credentials and pushes:

- `docker.io/your-dockerhub-username/react-chatbot:<build-number>`
- `docker.io/your-dockerhub-username/react-chatbot:latest`

### 5. Deploy To AWS EC2

Jenkins connects to the EC2 machine over SSH, pulls the latest image, removes the old container, and starts the new one.

## Jenkins Credentials You Need

Create these credentials in Jenkins before running the pipeline:

- `dockerhub-creds`: Username/password credential for Docker Hub.
- `ec2-ssh-key`: SSH private key credential for your EC2 instance.

## Values You Must Update In `Jenkinsfile`

Replace these placeholders:

- `your-dockerhub-username`
- `your-ec2-public-dns`
- `ec2-user`

If your EC2 app should run on a different host port, also update:

- `EC2_APP_PORT`

## EC2 Server Prerequisites

Your EC2 instance should have:

- Docker installed
- Port `80` open in the security group
- The Jenkins server's SSH key added to `~/.ssh/authorized_keys`

For Amazon Linux:

```bash
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -aG docker ec2-user
```

## Local Docker Test

You can test the image locally with:

```bash
docker build -t react-chatbot .
docker run -d -p 8080:80 --name react-chatbot react-chatbot
```

Then open:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/healthz
```

## What Link Should You Submit?

For assignments like this, the required link is usually the **GitHub repository link** containing:

- your React project
- the `Jenkinsfile`
- the `Dockerfile`
- setup instructions in `README.md`

If your instructor also wants proof of deployment, submit these as well if possible:

- the live EC2 app URL, such as `http://<ec2-public-ip>`
- Jenkins job screenshots or build history screenshots

If the assignment wording only says "submit a link", the safest answer is:

```text
Submit the GitHub repository URL for this project.
```

## Submission Note

You can use this short note in your README or assignment submission:

```text
This repository contains my React chatbot project with Docker containerization and a Jenkins CI/CD pipeline for build, health validation, and AWS EC2 deployment. The automation files are included and ready, while Jenkins server and EC2 infrastructure setup are being completed separately.
```
