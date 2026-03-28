# Spermart - React Frontend Admin Web App

This is the admin web dashboard for the Spermart application, built with React and Vite. It allows admins to manage products, view analytics, and handle orders.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

## Setup Instructions

1. **Install Dependencies**
   Navigate to the frontend directory and install the necessary packages:
   ```bash
   cd reactfrontendWeb
   npm install
   ```

2. **Environment Variables & API Connection**
   This admin panel communicates with the `expressBackend` through the **Admin API namespace** (`/api/admin`).
   
   If you need to configure the API URL manually (for production), set up an `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/admin
   ```
   *Note:* The Vite local dev server (`vite.config.js`) proxies all `/api` traffic to `http://localhost:5000`, and `src/services/api.js` is set to prefix requests with `/api/admin` natively.

3. **Start the Development Server**
   Run the Vite development server:
   ```bash
   npm run dev
   ```
   This will start the application, usually accessible at `http://localhost:5173`.

4. **Build for Production**
   To create a production-ready build:
   ```bash
   npm run build
   ```
   The output will be placed in the `dist/` directory.

## Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.
