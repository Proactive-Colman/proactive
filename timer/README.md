# Timer Service

A service that periodically executes all tests in the system.

## Features

- Fetches all tests from the backend service
- Executes tests via the executor service
- Configurable execution interval
- Error handling and logging
- Docker support

## Configuration

The service can be configured using environment variables:

- `PORT`: Service port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `BACKEND_URL`: URL of the backend service
- `EXECUTOR_URL`: URL of the executor service
- `EXECUTION_INTERVAL_MINUTES`: Minutes between test executions (default: 5)

## Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example`

3. Run in development mode:

   ```bash
   npm run dev
   ```

4. Build and run:
   ```bash
   npm run build
   npm start
   ```

## Docker

Build and run with Docker Compose:

```bash
docker compose up timer
```

## API

The service runs in the background and doesn't expose any API endpoints. It automatically:

1. Fetches all tests from the backend
2. Sends each test to the executor
3. Logs execution results
