# Unified Healthcheck System - Web Dashboard

The frontend interface for monitoring bot health and system status.

## Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [SWR](https://swr.vercel.app/)
- **Charting**: [ECharts](https://echarts.apache.org/) & `echarts-for-react`

## Local Development

If you prefer to run the dashboard locally without Docker:

### Prerequisites
- [Bun](https://bun.sh/) or [Node.js](https://nodejs.org/) with `npm`/`yarn`/`pnpm`.

### Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Environment Variables:
   Create a `.env.local` file (or use the system variables) to define the API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

### Running the Dashboard

Start the Vite development server:
```bash
bun run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build:
```bash
bun run build
```

This will output the static files to the `dist` directory, which can then be served using any static web server (like Nginx, which is used in the production Docker setup).
