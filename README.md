
# Lost & Found API

A RESTful API for managing lost and found items built with Node.js, Express, and PostgreSQL.

## Features

- **Item Management**: Create, read, update, and delete lost and found items
- **User Authentication**: JWT-based authentication for users and admins
- **Role-based Access Control**: Different permissions for users and administrators
- **Advanced Filtering**: Search items by status, category, location, and date
- **Secure Operations**: Protected endpoints with middleware authentication

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Environment**: Replit

## API Endpoints

### Authentication
- `POST /login/user` - User login (email only)
- `POST /login/admin` - Admin login (email + password)

### Items
- `GET /items` - Get all items (with optional filters)
- `GET /items/:id` - Get specific item by ID
- `POST /items` - Create new item
- `PUT /items/:id` - Update item (users can only edit their own items)
- `DELETE /items/:id` - Delete item (admin only)

### Query Parameters for GET /items
- `status` - Filter by "Lost" or "Found"
- `category` - Filter by item category
- `location` - Search by location (partial match)
- `date` - Filter by specific date

## Setup Instructions

### 1. Environment Variables
Create a `.env` file based on `.env.example`:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

### 2. Database Schema
Ensure your PostgreSQL database has the following table:

```sql
CREATE TABLE lost_and_found (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(10) NOT NULL CHECK (status IN ('Lost', 'Found')),
  category VARCHAR(100),
  location VARCHAR(255),
  date DATE,
  contact_info VARCHAR(255),
  image_url VARCHAR(500),
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Installation
```bash
npm install
```

### 4. Running the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Usage Examples

### User Login
```bash
curl -X POST http://localhost:3000/login/user \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Admin Login
```bash
curl -X POST http://localhost:3000/login/admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your_password"}'
```

### Create New Item
```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lost Wallet",
    "description": "Brown leather wallet with ID cards",
    "status": "Lost",
    "category": "Personal Items",
    "location": "Main Library",
    "date": "2024-01-15",
    "contact_info": "john@example.com"
  }'
```

### Get Items with Filters
```bash
# Get all lost items
curl "http://localhost:3000/items?status=Lost"

# Get items by location
curl "http://localhost:3000/items?location=Library"

# Multiple filters
curl "http://localhost:3000/items?status=Found&category=Electronics"
```

### Update Item (Authenticated)
```bash
curl -X PUT http://localhost:3000/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"status": "Found", "description": "Updated description"}'
```

## Project Structure

```
├── controllers/
│   ├── items.js          # Item CRUD operations
│   └── login.js          # Authentication logic
├── database/
│   └── db.js             # PostgreSQL connection
├── middlewares/
│   ├── isAdmin.js        # Admin authentication middleware
│   └── isUser.js         # User authentication middleware
├── utils/
│   └── jwt.js            # JWT utility functions
├── index.js              # Main application file
├── package.json          # Dependencies and scripts
└── .env.example          # Environment variables template
```

## Authentication & Authorization

### User Roles
- **User**: Can create items and edit their own items
- **Admin**: Full access to all operations including item deletion

### JWT Token Structure
```json
{
  "email": "user@example.com",
  "role": "user",
  "iat": 1642694400,
  "exp": 1642780800
}
```

### Protected Routes
- `PUT /items/:id` - Requires user authentication
- `DELETE /items/:id` - Requires admin authentication

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
