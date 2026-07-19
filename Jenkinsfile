pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '320343233567'
        AWS_REGION     = 'ap-south-1'
        CLUSTER_NAME   = 'kubeoptima-test'
        REGISTRY       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kubeoptima"
        
        // AWS credentials profile ID in Jenkins (Credentials -> Store -> Add Credentials)
        AWS_CRED_ID    = 'aws-credentials'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('AWS Login & ECR Auth') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CRED_ID,
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh 'aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION}'
                    sh 'aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com'
                }
            }
        }

        stage('Ensure ECR Repos') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CRED_ID,
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
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
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CRED_ID,
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
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
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CRED_ID,
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
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
