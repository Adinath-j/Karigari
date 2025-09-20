# Karigari - Handcrafted Marketplace Platform

A marketplace platform for handcrafted products connecting artisans with customers.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Default Credentials](#default-credentials)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [API Testing](#api-testing)
- [License](#license)

## Features
- User authentication (customer, artisan, admin roles)
- Product listing and management
- Order management system
- Customization requests
- Real-time chat functionality
- Responsive design with Tailwind CSS

## Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: Session-based with express-session
- **Real-time**: Socket.IO for chat functionality
- **Deployment**: Vercel (Frontend), Render (Backend)

## Prerequisites
- Node.js v18 or higher
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Setup Instructions
1. Clone the repository
2. Install dependencies for both frontend and backend:
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret_key
   NODE_ENV=development
   ```
4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev
   
   # Start frontend server (in a new terminal)
   npm run dev
   ```

## Default Credentials
After running the setup script (`npm run setup-test-users`), you can use these credentials:

- **Admin**: admin@karigari.com / admin123
- **Customer**: customer@test.com / password123
- **Artisan**: artisan@test.com / password123

## Deployment

### Frontend Deployment (Vercel)
Frontend URL: https://karigari-ruddy.vercel.app

1. Push your code to a GitHub repository
2. Sign up/log in to [Vercel](https://vercel.com)
3. Create a new project and import your GitHub repository
4. Configure the project settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add environment variables:
   - `VITE_BACKEND_URL`: https://karigari-2xcq.onrender.com
6. Deploy the project

### Backend Deployment (Render)
Backend URL: https://karigari-2xcq.onrender.com

1. Push your code to a GitHub repository
2. Sign up/log in to [Render](https://render.com)
3. Create a new Web Service
4. Connect your GitHub repository
5. Configure the service:
   - Name: karigari-backend
   - Runtime: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free or paid as needed
6. Add environment variables:
   - `NODE_ENV`: production
   - [PORT](file://c:\Users\adina\Desktop\Karigari\Karigari\backend\server.js#L34-L34): 10000
   - `MONGODB_URL`: "mongodb+srv://adinathjadhavisdev_db_user:adinathjadhavisdev_db_user@karigari.hriqfwk.mongodb.net/?retryWrites=true&w=majority&appName=Karigari"
   - `JWT_SECRET`: ksjdiugshd89gys87fgs883
   - `FRONTEND_URL`: https://karigari-ruddy.vercel.app
7. Deploy the service

### Environment Variables
For production deployment, make sure to set the following environment variables:

**Frontend (Vercel):**
- `VITE_BACKEND_URL`: https://karigari-2xcq.onrender.com

**Backend (Render):**
- `NODE_ENV`: production
- [PORT](file://c:\Users\adina\Desktop\Karigari\Karigari\backend\server.js#L34-L34): 10000
- `MONGODB_URL`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret
- `FRONTEND_URL`: https://karigari-ruddy.vercel.app

## Troubleshooting
- **Login Issues**: If you can't log in, run the setup script to create test users:
  ```bash
  npm run setup-test-users
  ```
- **ESM Module Issues**: If you encounter ESM module errors, ensure your package.json has `"type": "module"`
- **Port Conflicts**: If ports are in use, the application will automatically try different ports
- **MongoDB Connection**: Ensure your MongoDB URI is correct and the database is accessible

## API Testing
You can test the API endpoints using tools like Postman or curl. Here are some example requests:

1. **User Registration**:
   ```bash
   curl -X POST https://karigari-2xcq.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"customer"}'
   ```

2. **User Login**:
   ```bash
   curl -X POST https://karigari-2xcq.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Get Products**:
   ```bash
   curl https://karigari-2xcq.onrender.com/api/products
   ```

## License
This project is licensed under the MIT License.