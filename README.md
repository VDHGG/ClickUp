# ClickUp - To-do List Application

A full-stack To-do List application built with Node.js/TypeScript backend and React/TypeScript frontend, designed for deployment on Azure Kubernetes Service (AKS).

## 🎯 Project Overview

ClickUp is a personal task management application that allows users to create, update, and manage their daily tasks. This project is part of the MindX Engineer Onboarding Week 1 objectives, focusing on:

- Full-stack application development
- Containerization with Docker
- Azure Cloud deployment
- Kubernetes orchestration
- Authentication integration (planned)
- HTTPS domain setup (planned)

## 📁 Project Structure

```
ClickUp/
├── api/                 # Backend API (Node.js/TypeScript)
│   ├── src/
│   │   ├── routes/     # API routes
│   │   └── index.ts    # Main server file
│   ├── Dockerfile
│   └── package.json
├── web/                 # Frontend (React/TypeScript)
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API service layer
│   │   └── types/      # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── k8s/                 # Kubernetes manifests
│   ├── api-deployment.yaml
│   ├── api-service.yaml
│   ├── web-deployment.yaml
│   ├── web-service.yaml
│   └── ingress.yaml
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker
- Azure CLI (for deployment)
- kubectl (for Kubernetes deployment)

### Local Development

#### Backend API

```bash
cd api
npm install
npm run dev
```

API will be available at `http://localhost:3000`

#### Frontend Web

```bash
cd web
npm install
npm run dev
```

Web app will be available at `http://localhost:8080`

### Docker Development

#### Build and Run Backend

```bash
cd api
docker build -t clickup-api .
docker run -p 3000:3000 clickup-api
```

#### Build and Run Frontend

```bash
cd web
docker build -t clickup-web .
docker run -p 8080:8080 clickup-web
```

## 📋 API Endpoints

### Health Check
- `GET /health` - Service health status

### Todos
- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a single todo
- `POST /api/todos` - Create a new todo
  ```json
  {
    "title": "Task title",
    "description": "Optional description"
  }
  ```
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## 🏗️ Deployment to Azure

### Step 1: Azure Container Registry (ACR)

1. Create ACR:
```bash
az acr create --resource-group <RESOURCE_GROUP> --name <ACR_NAME> --sku Basic
```

2. Login to ACR:
```bash
az acr login --name <ACR_NAME>
```

3. Build and push images:
```bash
# Build and push API
cd api
docker build -t <ACR_NAME>.azurecr.io/clickup-api:latest .
docker push <ACR_NAME>.azurecr.io/clickup-api:latest

# Build and push Web
cd ../web
docker build -t <ACR_NAME>.azurecr.io/clickup-web:latest .
docker push <ACR_NAME>.azurecr.io/clickup-web:latest
```

### Step 2: Azure Kubernetes Service (AKS)

1. Create AKS cluster:
```bash
az aks create --resource-group <RESOURCE_GROUP> --name <AKS_NAME> --node-count 2 --enable-managed-identity --attach-acr <ACR_NAME>
```

2. Get credentials:
```bash
az aks get-credentials --resource-group <RESOURCE_GROUP> --name <AKS_NAME>
```

3. Update Kubernetes manifests with your ACR name:
   - Replace `<ACR_NAME>` in `k8s/api-deployment.yaml`
   - Replace `<ACR_NAME>` in `k8s/web-deployment.yaml`

4. Deploy to AKS:
```bash
kubectl apply -f k8s/
```

### Step 3: Ingress Controller

1. Install nginx-ingress:
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx
```

2. Get external IP:
```bash
kubectl get service ingress-nginx-controller
```

3. Access application via external IP

### Step 4: HTTPS and Custom Domain (Future)

See `k8s/ingress-https.yaml` for HTTPS configuration with cert-manager.

## 🔐 Authentication (Planned)

Authentication will be integrated in Step 5 of the Week 1 plan:
- OpenID Connect with `https://id-dev.mindx.edu.vn`
- JWT token validation
- Protected routes

## 📝 Development Roadmap

- [x] Step 1: Backend API with Docker
- [x] Step 2: Frontend React App with Docker
- [x] Step 3: Kubernetes manifests
- [ ] Step 4: Azure deployment
- [ ] Step 5: Authentication integration
- [ ] Step 6: HTTPS and custom domain

## 🛠️ Tech Stack

### Backend
- Node.js 20
- TypeScript
- Express.js
- Docker

### Frontend
- React 18
- TypeScript
- Vite
- Axios
- Docker + Nginx

### Infrastructure
- Azure Kubernetes Service (AKS)
- Azure Container Registry (ACR)
- Nginx Ingress Controller
- cert-manager (for SSL)

## 📚 Documentation

- [Backend API README](./api/README.md)
- [Frontend Web README](./web/README.md)
- [Week 1 Tasks Guide](./docs/plans/week-1/tasks.md)
- [Architecture Overview](./docs/plans/week-1/architecture.md)

## 🤝 Contributing

This project follows the Week 1 onboarding plan. For questions or issues, refer to the task documentation.

## 📄 License

ISC

