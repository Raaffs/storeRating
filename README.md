# Store Explorer Platform

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

## Description
A role-based Store Rating Platform built with a React frontend and Express/PostgreSQL backend. The application provides dynamic routing and features based on three distinct user roles:

- **Normal Users**: Browse stores with a searchable dashboard, submit star ratings and text reviews, and upload community photos of stores.
- **Store Owners**: Access a dedicated portal to view their store's average rating, real-time customer reviews, and manage their official store photo gallery.
- **Administrators**: A management dashboard to oversee all system users, register new stores to owners, and filter metrics via responsive data tables.


---

## Installation Steps

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally

### 1. Backend Setup
Navigate into the backend directory:
```bash
cd backend
```

Install the dependencies:
```bash
npm install
```

Configure your environment variables by creating a `.env` file in the `backend` directory:
```env
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
JWT_SECRET=super_secret_jwt_key
PORT=5000
```

Start the backend development server:
```bash
npm run dev
```

### 2. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install the dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The application will now be running on `http://localhost:5173`.


## API Documentation

Below is a summary of the primary REST API endpoints available in the backend.

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | Public | Register a new normal User or Store Owner. |
| **POST** | `/api/auth/login` | Public | Authenticate a user and return a JWT. |
| **PUT** | `/api/auth/password` | Authenticated | Update the currently logged-in user's password. |
| **GET** | `/api/admin/dashboard` | ADMIN | Fetch total counts for users, stores, and ratings. |
| **GET** | `/api/admin/users` | ADMIN | Fetch a list of all users, with optional search filtering. |
| **POST** | `/api/admin/users` | ADMIN | Manually create a new user with any role. |
| **GET** | `/api/admin/users/:id` | ADMIN | View detailed info of a specific user. |
| **GET** | `/api/admin/stores` | ADMIN | Fetch a list of all registered stores with filtering. |
| **POST** | `/api/admin/stores` | ADMIN | Register a new store and assign it to a Store Owner. |
| **GET** | `/api/owner/dashboard` | STORE_OWNER | Fetch metrics, photos, and reviews for the owner's assigned store. |
| **GET** | `/api/stores` | Authenticated | Browse and search stores, including overall aggregated ratings. |
| **GET** | `/api/stores/:id` | Authenticated | Fetch full details, gallery photos, and reviews of a specific store. |
| **POST** | `/api/stores/:id/rate` | USER | Submit or update a 1-5 star rating and textual review for a store. |
| **POST** | `/api/stores/:id/photos` | Authenticated | Upload a photo to a specific store's public gallery. |
