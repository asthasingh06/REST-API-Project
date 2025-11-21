# Order Management System

A full-stack order management application with Node.js/Express backend and React frontend, featuring JWT authentication, separate user/admin login, and role-based access control.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running on localhost:27017)

### Step 1: Install Dependencies

```bash
# Install all dependencies (root, backend, and frontend)
npm run install:all
```

Or install separately:
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Set Up Environment Variables

Create `backend/.env` file:

```bash
cd backend
```

Create `.env` file with:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rest-api-db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Start MongoDB

Make sure MongoDB is running:
- **Windows**: Check MongoDB service or run `mongod`
- **Mac/Linux**: `sudo systemctl start mongod` or `brew services start mongodb-community`

### Step 4: Create Admin User

```bash
cd backend
npm run create-admin
```

This creates an admin user with:
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Step 5: Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:5000`

### Step 6: Start Frontend (New Terminal)

```bash
cd frontend
npm start
```

Frontend will run on: `http://localhost:3000`

## 🔐 Login Credentials

### Admin Login
- **URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@example.com`
- **Password**: `admin123`

### User Login
- **URL**: `http://localhost:3000/login`
- Register a new user or use existing credentials

## 📚 API Documentation

Swagger docs available at: `http://localhost:5000/api-docs`

## 🎯 Features

- **Separate Login System**: User login (`/login`) and Admin login (`/admin/login`)
- **Order Management**: Full CRUD operations for orders
- **Role-Based Access Control**: Users see own orders, admins see all
- **Admin-Only Fields**: assignedTo, adminNotes, priority, tags, estimatedDeliveryDate
- **Order Items Management**: Multiple products per order with quantities and prices
- **Customer Information**: Name, email, phone tracking
- **Shipping Address**: Complete address management
- **Auto-Calculated Totals**: Total amount calculated from items

## 📋 API Endpoints

- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/admin/login` - Admin login
- `GET /api/v1/orders` - Get all orders
- `POST /api/v1/orders` - Create order
- `PUT /api/v1/orders/:id` - Update order
- `DELETE /api/v1/orders/:id` - Delete order

## 🛠️ Troubleshooting

**MongoDB not connecting?**
- Verify MongoDB is running: `mongosh` or check service status
- Check `MONGODB_URI` in `backend/.env`

**Port already in use?**
- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (3000): React will prompt for different port

**Admin login not working?**
- Run: `cd backend && npm run create-admin`
- Make sure you're using `/admin/login` page

