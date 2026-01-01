# ClickUp - To-do List Application

A production-ready full-stack task management application built with Node.js/TypeScript backend and React/TypeScript frontend, deployed on Azure Kubernetes Service (AKS) with OpenID Connect authentication.

## 🎯 Project Overview

ClickUp is a modern task management application that enables users to create, update, and manage their daily tasks efficiently. This project demonstrates enterprise-level development practices including:

- **Full-stack application** with TypeScript
- **Containerization** with Docker and Docker Compose
- **Cloud deployment** on Azure Kubernetes Service (AKS)
- **Authentication** via OpenID Connect (MindX ID)
- **Session-based security** with HTTP-only cookies
- **Kubernetes orchestration** for scalability

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Cloud                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Azure Container Registry (ACR)          │  │
│  │  - clickup-api:latest                           │  │
│  │  - clickup-web:latest                           │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Azure Kubernetes Service (AKS)                │  │
│  │                                                   │  │
│  │  ┌──────────────┐      ┌──────────────┐         │  │
│  │  │  API Service │      │  Web Service │         │  │
│  │  │  (Node.js)   │◄────►│  (React)     │         │  │
│  │  └──────────────┘      └──────────────┘         │  │
│  │         │                       │                 │  │
│  │         └──────────┬──────────┘                 │  │
│  │                      ▼                           │  │
│  │            ┌─────────────────┐                   │  │
│  │            │ Ingress (Nginx) │                   │  │
│  │            └─────────────────┘                   │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│                         ▼                               │
│              External IP / Domain                       │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
ClickUp/
├── api/                      # Backend API (Node.js/TypeScript)
│   ├── src/
│   │   ├── config/          # Configuration (OpenID, etc.)
│   │   ├── middleware/      # Authentication middleware
│   │   ├── routes/          # API routes (auth, todos, health)
│   │   └── index.ts         # Express server entry point
│   ├── Dockerfile
│   └── package.json
├── web/                      # Frontend (React/TypeScript)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── services/        # API service layer
│   │   └── types/           # TypeScript type definitions
│   ├── Dockerfile
│   └── package.json
├── k8s/                      # Kubernetes manifests
│   ├── api-deployment.yaml
│   ├── api-service.yaml
│   ├── web-deployment.yaml
│   ├── web-service.yaml
│   └── ingress.yaml
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm
- **Docker** and Docker Compose
- **Azure CLI** (for cloud deployment)
- **kubectl** (for Kubernetes management)

### Local Development

#### 1. Install Dependencies

```bash
# Install API dependencies
cd api
npm install

# Install Web dependencies
cd ../web
npm install
```

#### 2. Start Development Servers

**Backend API:**
```bash
cd api
npm run dev
```
API available at `http://localhost:3000`

**Frontend Web:**
```bash
cd web
npm run dev
```
Web app available at `http://localhost:8080`

### Docker Development

Test the full-stack application locally using Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

Access the application:
- **Web App**: http://localhost:8080
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📋 API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate OpenID Connect login
- `GET /api/auth/callback` - Handle OpenID callback
- `GET /api/auth/me` - Get current user info (session-based)
- `POST /api/auth/logout` - Logout and destroy session

### Health Check
- `GET /health` - Service health status
- `GET /api/health` - Alternative health endpoint

### Todos (Protected - requires authentication)
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

## 🔐 Authentication

The application uses **OpenID Connect** with MindX ID Provider for authentication:

### Features
- **Session-based authentication** with HTTP-only cookies
- **CSRF protection** via state parameter
- **Secure token storage** in server-side sessions
- **Automatic session management** by browser

### Flow
1. User clicks "MindX ID" button
2. Redirects to MindX ID authorization endpoint
3. User authenticates with email/password
4. MindX ID redirects back with authorization code
5. Backend exchanges code for tokens and creates session
6. User redirected to dashboard (authenticated)

### Configuration
Authentication requires:
- OpenID Client ID and Secret (from MindX ID provider)
- Redirect URI whitelisted in provider
- Session secret for session encryption

## ☁️ Deployment to Azure

The application is designed for deployment on Azure Kubernetes Service (AKS).

### Infrastructure Components

1. **Azure Container Registry (ACR)**
   - Stores Docker images for API and Web services
   - Private registry with admin authentication

2. **Azure Kubernetes Service (AKS)**
   - Orchestrates containerized services
   - Manages scaling and load balancing
   - Handles service discovery

3. **Nginx Ingress Controller**
   - Routes external traffic to services
   - Supports path-based routing (`/` → Web, `/api` → API)

### Deployment Steps

1. **Create ACR and push images**
   ```bash
   az acr create --resource-group <RG> --name <ACR_NAME> --sku Basic
   az acr login --name <ACR_NAME>
   docker build -t <ACR_NAME>.azurecr.io/clickup-api:latest ./api
   docker push <ACR_NAME>.azurecr.io/clickup-api:latest
   ```

2. **Create AKS cluster**
   ```bash
   az aks create --resource-group <RG> --name <AKS_NAME> --node-count 2
   az aks get-credentials --resource-group <RG> --name <AKS_NAME>
   ```

3. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/
   ```

4. **Install Ingress Controller**
   ```bash
   helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
   helm install ingress-nginx ingress-nginx/ingress-nginx
   ```

5. **Access Application**
   - Get external IP: `kubectl get service ingress-nginx-controller`
   - Access via: `http://<EXTERNAL-IP>`

## 🛠️ Tech Stack

### Backend
- **Node.js 20** - Runtime environment
- **TypeScript** - Type-safe development
- **Express.js** - Web framework
- **OpenID Client** - OpenID Connect implementation
- **Express Session** - Session management
- **Docker** - Containerization

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **Docker + Nginx** - Production serving

### Infrastructure
- **Azure Kubernetes Service (AKS)** - Container orchestration
- **Azure Container Registry (ACR)** - Image registry
- **Nginx Ingress Controller** - Load balancing and routing
- **Kubernetes** - Container orchestration platform

## 🔒 Security Features

- **HTTP-only cookies** - Prevents XSS attacks
- **Secure cookies** - HTTPS-only in production
- **CSRF protection** - State parameter validation
- **Session expiration** - 24-hour session lifetime
- **Environment variable secrets** - Kubernetes secrets management
- **CORS configuration** - Restricted origins

## 📝 Development Roadmap

- [x] Backend API with TypeScript
- [x] Frontend React application
- [x] Docker containerization
- [x] Kubernetes manifests
- [x] Azure deployment (ACR + AKS)
- [x] Ingress controller setup
- [x] OpenID Connect authentication
- [x] HTTPS/SSL certificate setup
- [x] Custom domain configuration

## 📚 Documentation

- [Backend API README](./api/README.md) - API documentation
- [Frontend Web README](./web/README.md) - Frontend documentation

## 🤝 Contributing

This project follows best practices for:
- TypeScript development
- Docker containerization
- Kubernetes deployment
- Security and authentication

---
