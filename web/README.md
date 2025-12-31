# ClickUp Web

Frontend web application for ClickUp To-do List.

## Features

- Modern React with TypeScript
- Beautiful UI with gradient design
- Full CRUD operations for todos
- Responsive design
- Vite for fast development

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `/api`)

## Docker

```bash
# Build image
docker build -t clickup-web .

# Run container
docker run -p 8080:8080 clickup-web
```

