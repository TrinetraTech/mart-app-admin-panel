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

2. **Environment Variables**
   If there are API URLs or other configurations, create a `.env` file based on the environment requirements. Typically you would add:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
   *(Update the URL to match where your `expressBackend` is running.)*

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
