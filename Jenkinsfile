pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: kubeoptima-build-agent
spec:
  serviceAccountName: jenkins
  containers:
  - name: build-tools
    image: dtzar/helm-kubectl:latest
    command:
    - cat
    tty: true
    env:
    - name: DOCKER_HOST
      value: tcp://localhost:2375
  - name: dind
    image: docker:dind
    securityContext:
      privileged: true
    volumeMounts:
    - name: dind-storage
      mountPath: /var/lib/docker
  volumes:
  - name: dind-storage
    emptyDir: {}
'''
        }
    }

    environment {
        AWS_ACCOUNT_ID  = '320343233567'
        AWS_REGION      = 'ap-south-1'
        CLUSTER_NAME    = 'kubeoptima-test'
        REGISTRY        = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kubeoptima"
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Install AWS CLI & Docker Client') {
            steps {
                container('build-tools') {
                    sh 'apk add --no-cache aws-cli docker-cli docker-cli-buildx'
                }
            }
        }

        stage('AWS Login & ECR Auth') {
            steps {
                container('build-tools') {
                    sh 'aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION}'
                    sh 'aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com'
                }
            }
        }

        stage('Ensure ECR Repos') {
            steps {
                container('build-tools') {
                    script {
                        def repos = ['api-gateway', 'dashboard', 'ai-service', 'k8s-operator']
                        for (repo in repos) {
                            def repoName = "kubeoptima/${repo}"
                            sh """
                            aws ecr describe-repositories --repository-names ${repoName} --region ${AWS_REGION} || \
                            aws ecr create-repository --repository-name ${repoName} --region ${AWS_REGION}
                            """
                        }
                    }
                }
            }
        }

        stage('Parallel Build & Push') {
            parallel {
                stage('Build API Gateway') {
                    steps {
                        container('build-tools') {
                            sh """
                            docker build --build-arg BUILDKIT_INLINE_CACHE=1 \
                              --cache-from ${REGISTRY}/api-gateway:latest \
                              -t ${REGISTRY}/api-gateway:latest \
                              -t ${REGISTRY}/api-gateway:${BUILD_NUMBER} \
                              apps/api-gateway
                            docker push ${REGISTRY}/api-gateway:latest
                            docker push ${REGISTRY}/api-gateway:${BUILD_NUMBER}
                            """
                        }
                    }
                }
                stage('Build Dashboard') {
                    steps {
                        container('build-tools') {
                            sh """
                            docker build --build-arg BUILDKIT_INLINE_CACHE=1 \
                              --cache-from ${REGISTRY}/dashboard:latest \
                              -t ${REGISTRY}/dashboard:latest \
                              -t ${REGISTRY}/dashboard:${BUILD_NUMBER} \
                              apps/dashboard
                            docker push ${REGISTRY}/dashboard:latest
                            docker push ${REGISTRY}/dashboard:${BUILD_NUMBER}
                            """
                        }
                    }
                }
                stage('Build AI Service') {
                    steps {
                        container('build-tools') {
                            sh """
                            docker build --build-arg BUILDKIT_INLINE_CACHE=1 \
                              --cache-from ${REGISTRY}/ai-service:latest \
                              -t ${REGISTRY}/ai-service:latest \
                              -t ${REGISTRY}/ai-service:${BUILD_NUMBER} \
                              apps/ai-service
                            docker push ${REGISTRY}/ai-service:latest
                            docker push ${REGISTRY}/ai-service:${BUILD_NUMBER}
                            """
                        }
                    }
                }
                stage('Build Operator') {
                    steps {
                        container('build-tools') {
                            sh """
                            docker build --build-arg BUILDKIT_INLINE_CACHE=1 \
                              --cache-from ${REGISTRY}/k8s-operator:latest \
                              -t ${REGISTRY}/k8s-operator:latest \
                              -t ${REGISTRY}/k8s-operator:${BUILD_NUMBER} \
                              apps/k8s-operator
                            docker push ${REGISTRY}/k8s-operator:latest
                            docker push ${REGISTRY}/k8s-operator:${BUILD_NUMBER}
                            """
                        }
                    }
                }
            }
        }

        stage('Deploy to EKS via Helm') {
            steps {
                container('build-tools') {
                    sh """
                    helm upgrade --install kubeoptima infrastructure/helm/kubeoptima \
                      -f infrastructure/helm/kubeoptima/values-test.yaml \
                      --namespace kubeoptima-system \
                      --create-namespace \
                      --set global.image.registry=${REGISTRY} \
                      --set global.image.tag="latest" \
                      --set apiGateway.image.name="api-gateway" \
                      --set dashboard.image.name="dashboard" \
                      --set aiService.image.name="ai-service" \
                      --set operator.image.name="k8s-operator"
                    """
                }
            }
        }
    }
}
