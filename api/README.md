# ClickUp API

Backend API service for ClickUp To-do List application.

## Features

- RESTful API for managing todos
- Health check endpoint
- TypeScript with Express
- Docker containerization ready

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Returns service health status

### Todos
- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a single todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Docker

```bash
# Build image
docker build -t clickup-api .

# Run container
docker run -p 3000:3000 clickup-api
```

## Environment Variables

- `PORT` - Server port (default: 3000)

