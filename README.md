# Karigari - Handcrafted Marketplace Platform

Karigari is a full-stack e-commerce platform designed to connect artisans with customers who appreciate handcrafted, unique products. The platform provides a marketplace where skilled artisans can showcase and sell their creations while customers can discover and purchase authentic handmade items.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

Karigari is built with modern web technologies to provide a seamless experience for both artisans and customers. The platform includes:

- **Frontend**: A responsive React application with intuitive user interfaces
- **Backend**: A RESTful API built with Node.js and Express
- **Database**: MongoDB for flexible data storage
- **Authentication**: Session-based authentication with role-based access control

The platform supports three main user roles:
1. **Customers**: Browse products, place orders, and manage their purchases
2. **Artisans**: Create and manage products, process orders, and interact with customers
3. **Admins**: Moderate content, manage users, and oversee platform operations

## Key Features

### User Management
- Role-based authentication (Customer, Artisan, Admin)
- User registration and login
- Profile management
- Password security with bcrypt hashing

### Product Management
- Artisans can create, update, and delete products
- Product categorization (Pottery, Textiles, Jewelry, etc.)
- Image upload support
- AI-generated product descriptions
- Customization options for products

### Order Management
- Complete order lifecycle from placement to delivery
- Status tracking (Pending, Confirmed, Processing, Shipped, Delivered)
- Order history for customers and artisans
- Tracking information for shipped orders

### Marketplace Features
- Product search and filtering
- Category-based navigation
- Favorite products functionality
- Responsive design for all devices

## Technology Stack

### Frontend
- **React** - JavaScript library for building user interfaces
- **React Router** - Declarative routing for React applications
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - Promise-based HTTP client
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling tool
- **Socket.IO** - Real-time communication library

### Authentication & Security
- **Express Session** - Session middleware
- **Bcrypt** - Password hashing
- **CORS** - Cross-Origin Resource Sharing handling

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Development server with auto-restart

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v14 or higher)
2. **npm** (v6 or higher) or **yarn**
3. **MongoDB** (v4.4 or higher)
4. **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/karigari.git
cd karigari
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ..
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/karigari
SESSION_SECRET=your-session-secret-key

# Optional: Production MongoDB URI
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/karigari
```

### Database Setup

1. Ensure MongoDB is running on your system
2. The application will automatically create the necessary collections when first run
3. For production, update the `MONGODB_URI` in your `.env` file

## Running the Application

### Development Mode

#### Start the Backend Server

```bash
cd backend
npm run dev
```

This will start the Express server on `http://localhost:5000` with nodemon for auto-restart on file changes.

#### Start the Frontend Development Server

```bash
cd ..
npm run dev
```

This will start the Vite development server on `http://localhost:5173` (or next available port).

### Production Mode

#### Build the Frontend

```bash
npm run build
```

#### Start the Backend Server

```bash
cd backend
npm start
```

The application will be available at `http://localhost:5000`.

## Project Structure

```
karigari/
├── backend/
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Custom middleware functions
│   ├── models/               # Database models
│   ├── routes/               # API route definitions
│   ├── uploads/              # Uploaded files (images)
│   ├── .env                  # Environment variables
│   ├── server.js             # Main server file
│   ├── package.json          # Backend dependencies
│   └── ...
├── src/                      # Frontend source code
│   ├── components/           # Reusable UI components
│   ├── pages/                # Page components
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # Entry point
│   └── ...
├── public/                   # Static assets
├── .gitignore                # Git ignore file
├── package.json              # Frontend dependencies
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

## Database Schema

### User Model

```javascript
{
  name: String,
  email: String,
  password: String,
  role: String, // 'customer', 'artisan', 'admin'
  profile: {
    avatar: String,
    phone: String,
    address: Object,
    bio: String,
    skills: [String],
    experience: String,
    socialLinks: Object
  },
  status: String, // 'pending', 'approved', 'rejected', 'suspended'
  favorites: [ObjectId], // References to favorite products
  stats: Object // User statistics
}
```

### Product Model

```javascript
{
  title: String,
  description: String,
  category: String,
  price: Number,
  stock: Number,
  images: [String],
  artisan: ObjectId, // Reference to User
  materials: String,
  customizable: Boolean,
  customizationOptions: Object,
  tags: [String],
  status: String, // 'draft', 'published', 'pending', etc.
  stats: Object // Product statistics
}
```

### Order Model

```javascript
{
  orderNumber: String,
  customer: ObjectId, // Reference to User
  items: [{
    product: ObjectId, // Reference to Product
    artisan: ObjectId, // Reference to User
    quantity: Number,
    price: Number,
    customizations: Object,
    status: String
  }],
  shippingAddress: Object,
  billingAddress: Object,
  pricing: Object,
  payment: Object,
  status: String, // 'pending', 'confirmed', 'processing', etc.
  tracking: Object,
  timeline: [Object] // Status history
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Artisan only)
- `PUT /api/products/:id` - Update product (Artisan only)
- `DELETE /api/products/:id` - Delete product (Artisan only)

### Orders
- `GET /api/orders/customer/my-orders` - Get customer's orders
- `GET /api/orders/artisan/my-orders` - Get artisan's orders
- `PUT /api/orders/:id/status/artisan` - Update order status (Artisan only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Users
- `GET /api/users/favorites` - Get user's favorite products
- `POST /api/users/favorites` - Add product to favorites
- `DELETE /api/users/favorites/:id` - Remove product from favorites

## Deployment

### Production Build

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set environment variables for production in the backend `.env` file

3. Start the production server:
   ```bash
   cd backend
   npm start
   ```

### Hosting Options

#### Backend
- **Heroku**: Easy deployment with MongoDB add-on
- **DigitalOcean App Platform**: Simple deployment process
- **AWS Elastic Beanstalk**: Scalable deployment option

#### Database
- **MongoDB Atlas**: Cloud-hosted MongoDB service
- **Self-hosted MongoDB**: On your own server

#### Frontend
- **Netlify**: For static frontend deployment
- **Vercel**: React-optimized deployment platform
- **GitHub Pages**: Free hosting for static sites

### Environment Variables for Production

```env
# Server Configuration
PORT=5000
MONGODB_URI=your-production-mongodb-uri
SESSION_SECRET=your-production-session-secret

# Security
NODE_ENV=production
```

## Contributing

We welcome contributions to the Karigari project! Here's how you can help:

### Development Workflow

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Commit your changes:
   ```bash
   git commit -m "Add your feature description"
   ```
5. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a Pull Request

### Code Style

- Follow the existing code formatting
- Use meaningful variable and function names
- Write clear comments for complex logic
- Ensure all tests pass before submitting

### Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub with:
- A clear title and description
- Steps to reproduce (for bugs)
- Expected and actual behavior
- Screenshots (if applicable)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For additional help or questions about the Karigari platform, please contact the development team or open an issue on GitHub.

Happy crafting!