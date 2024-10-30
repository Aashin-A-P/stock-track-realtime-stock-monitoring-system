# Stock Management System (Backend)

Welcome to the Stock Management System backend built with Express.js! This application allows users to manage their stock, track budgets, and analyze financial data efficiently.

## Features

- User registration and login
- Dashboard analysis for budget tracking
- Recent logs of user activities
- Secure JWT-based authentication

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Home](#home)
  - [User Registration](#user-registration)
  - [User Login](#user-login)
  - [Dashboard Analysis](#dashboard-analysis)
  - [Recent Logs](#recent-logs)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Aashin-A-P/stock-track-realtime-stock-monitoring-system.git
   ```

2. Navigate to the backend project directory:
   ```bash
   cd stock-track-realtime-stock-monitoring-system/backend
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the backend directory and add the following dummy data:
   ```plaintext
   SERVER_URL=http://localhost
   SECRET_KEY=your_secret_key
   DATABASE_URL=postgres://username:password@localhost:5432/mydb
   PORT=3000
   ```

5. Ensure your PostgreSQL database is set up before running the application.

## Environment Variables

Make sure to set the following environment variables in your `.env` file:

```plaintext
SERVER_URL=http://localhost        # Replace with your server URL
PORT=3000                          # Port to run the server
DATABASE_URL=postgres://username:password@localhost:5432/mydb  # Database connection URL
SECRET_KEY=your_secret_key        # JWT secret key
```

## API Endpoints

### Home

- **URL**: `/`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "message": "Welcome To Stock Management MIT IT"
  }
  ```

### User Registration

- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "firstName": "mukun",
    "lastName": "dev",
    "email": "mukun@dev.com",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "userId": 12,
      "firstName": "mukun",
      "lastName": "dev",
      "email": "mukun@dev.com",
      "createdAt": "2024-10-30T09:01:38.513Z",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJyb2xlIjoidXNlciIsImlhdCI6MTczMDI3ODg5OCwiZXhwIjoxNzMyODcwODk4fQ.ZMUQmkxYaoZn15oaWzR4KrN9HM9MTIEAKrFQhKH5M0I"
  }
  ```

### User Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "mukun@dev.com",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzMwMjc5MDUwLCJleHAiOjE3MzI4NzEwNTB9.BA3l264M4ezn2qVbin3V08s79er5wt2tZVYQ97dJam8",
    "user": {
      "userId": 1,
      "firstName": "User",
      "lastName": "1",
      "email": "user@dev.com",
      "createdAt": "2024-10-30T06:24:21.321Z",
      "role": "admin"
    }
  }
  ```

### Dashboard Analysis

- **URL**: `/dashboard/analysis`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
- **Query Parameters**:
  - `year`: `2022`
- **Response**:
  ```json
  {
    "totalBudget": "450000",
    "totalSpent": "110000",
    "categorySpent": [
      {
        "category": "IT Infrastructure",
        "spent": "50000"
      },
      {
        "category": "Student Activities",
        "spent": "60000"
      }
    ]
  }
  ```

### Recent Logs

- **URL**: `/dashboard/recent-logs`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
- **Query Parameters**:
  - `numberOfLogs`: `5`
- **Response**:
  ```json
  [
    {
      "logId": 84,
      "accessedPageUrl": "/products/view/21",
      "operationDone": "VIEW",
      "productId": 21,
      "userId": 3
    },
    {
      "logId": 83,
      "accessedPageUrl": "/products/create",
      "operationDone": "CREATE",
      "productId": 20,
      "userId": 1
    },
    {
      "logId": 82,
      "accessedPageUrl": "/products/update/19",
      "operationDone": "UPDATE",
      "productId": 19,
      "userId": 5
    },
    {
      "logId": 81,
      "accessedPageUrl": "/products/view/18",
      "operationDone": "VIEW",
      "productId": 18,
      "userId": 4
    },
    {
      "logId": 80,
      "accessedPageUrl": "/products/delete/17",
      "operationDone": "DELETE",
      "productId": 17,
      "userId": 3
    }
  ]
  ```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.