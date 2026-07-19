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
    securityContext:
      runAsUser: 0
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-sock
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
'''
        }
    }

    environment {
        AWS_ACCOUNT_ID = '320343233567'
        AWS_REGION     = 'ap-south-1'
        CLUSTER_NAME   = 'kubeoptima-test'
        REGISTRY       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kubeoptima"
    }

    stages {
        stage('Install AWS CLI') {
            steps {
                container('build-tools') {
                    sh 'apk add --no-cache aws-cli'
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

        stage('Build & Push Images') {
            steps {
                container('build-tools') {
                    script {
                        def services = [
                            'api-gateway': 'apps/api-gateway',
                            'dashboard': 'apps/dashboard',
                            'ai-service': 'apps/ai-service',
                            'k8s-operator': 'apps/k8s-operator'
                        ]
                        
                        services.each { service, dir ->
                            def imageTag = "${REGISTRY}/${service}:latest"
                            echo "Building ${service} from ${dir}..."
                            sh "docker build -t ${imageTag} ${dir}"
                            echo "Pushing ${imageTag} to ECR..."
                            sh "docker push ${imageTag}"
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
