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
  - [All Budget Years](#all-budget-years)
  - [All Years Analysis](#all-years-analysis)
  - [Add User Privilege](#add-user-privilege)
  - [Upload Image](#upload-image)
  - [Add Invoice](#add-invoice)
  - [Show Invoice](#show-invoice)
  - [Show All Invoices](#show-all-invoices)
  - [Update Invoice](#update-invoice)
  - [Delete Invoice](#delete-invoice)
  - [Location Routes Documentation](#location-routes-documentation)
  - [Remarks API Documentation](#remarks-api-documentation)
  - [Stock Routes Documentation](#stock-routes-documentation)
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

### User Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "userName": "admin",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTc2NjkxNCwiZXhwIjoxNzM0MzU4OTE0fQ.wx_usVUbwuzS5oJwIg5E6B0OoouzC4j1hhjYFmJhrso",
    "user": {
      "userId": 1,
      "userName": "admin",
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
    "totalBudget": "2000000",
    "totalSpent": "49000.00",
    "categorySpent": [
      {
        "category": "Electronics",
        "spent": "13000.00"
      },
      {
        "category": "Hardwares",
        "spent": "13500.00"
      },
      {
        "category": "Systems",
        "spent": "13000.00"
      },
      {
        "category": "Vehicles",
        "spent": "9500.00"
      }
    ],
    "monthlySpent": [
      0,
      0,
      0,
      "13000.00",
      "9500.00",
      0,
      0,
      "13500.00",
      0,
      0,
      0,
      "13000.00"
    ]
  }
  ```

### Recent Logs

- **URL**: `/logs/recent-logs`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
- **Query Parameters**:
  - `numberOfLogs`: `5`
- **Response**:
  ```json
  [
    {
      "logId": 10,
      "description": "Email notification sent",
      "createdAt": "2024-01-05T08:45:00.000Z"
    },
    {
      "logId": 9,
      "description": "System maintenance completed",
      "createdAt": "2024-01-05T02:30:00.000Z"
    },
    {
      "logId": 8,
      "description": "System maintenance started",
      "createdAt": "2024-01-04T22:00:00.000Z"
    },
    {
      "logId": 7,
      "description": "New user registered",
      "createdAt": "2024-01-04T10:00:00.000Z"
    },
    {
      "logId": 6,
      "description": "Error in processing payment",
      "createdAt": "2024-01-03T16:45:00.000Z"
    }
  ]
  ```

### All Budget Years

- **URL**: `/dashboard/budget-years`
- **Method**: `GET`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)

- **Response**:
  ```json
  {
    "years": ["2019", "2020", "2021", "2022", "2023", "2024"]
  }
  ```

### All years Analysis

- **URL**: `/dashboard/all-years-analysis`
- **Method**: `GET`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)

- **Response**:
  ```json
  {
    "totalBudget": "12700000",
    "totalSpent": "335000.00",
    "categorySpent": [
      {
        "category": "Electronics",
        "spent": "75000.00"
      },
      {
        "category": "Hardwares",
        "spent": "79500.00"
      },
      {
        "category": "Systems",
        "spent": "75000.00"
      },
      {
        "category": "Vehicles",
        "spent": "55500.00"
      },
      {
        "category": "Projectors",
        "spent": "50000"
      }
    ]
  }
  ```

### Add User Privilege

- **URL**: `/adduserprivilege`
- **Method**: `POST`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)

- **Request**:

  ```json
  {
    "userId": 11,
    "privilegeId": 5
  }
  ```

- **Response**:

  ```json
  {
    "message": "User privilege added successfully",
    "data": {
      "userPrivilegeId": 55,
      "userId": 11,
      "privilegeId": 5
    }
  }
  ```

### Upload Image

- **URL**: `/upload`
- **Method**: `POST`
- **Headers**:

  - `Content-Type`: `multipart/form-data`
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)

- **Body**:

  - **Key**: `image` (file field)
  - **Value**: Image file to upload (e.g., `.png`, `.jpg`, etc.)

- **Response**:

  **Success**:

  ```json
  {
    "message": "Image uploaded successfully",
    "imageUrl": "/uploads/<unique-file-name>"
  }
  ```

  **Error**:

  ```json
  {
    "error": "No file uploaded"
  }
  ```

### **Add Invoice**

- **URL**: `/stock/invoice/add`
- **Method**: `POST`
- **Headers**:
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
  - `Content-Type`: `application/json`
- **Body Parameters**:

  ```json
  {
    "fromAddress": "string", // Address from where the invoice is sent
    "toAddress": "string", // Address to where the invoice is sent
    "actualAmount": "decimal", // Total amount before tax
    "gstAmount": "decimal", // GST amount for the invoice
    "invoiceDate": "date", // Date when the invoice was created (YYYY-MM-DD)
    "invoiceImage": "string" // Optional. Path to the uploaded image of the invoice (relative path)
  }
  ```

- **Response**:

  - **Success (201 - Created)**:
    ```json
    {
      "message": "Invoice added successfully",
      "invoice": {
        "invoiceId": 1,
        "fromAddress": "123 Main St, Cityville",
        "toAddress": "456 Elm St, Townsville",
        "actualAmount": 1000.0,
        "gstAmount": 180.0,
        "invoiceDate": "2024-11-29",
        "invoiceImage": "/uploads/invoice-12345.png"
      }
    }
    ```
  - **Error (400 - Bad Request)**:
    If any required field is missing:

    ```json
    {
      "message": "All fields except invoiceImage are required"
    }
    ```

  - **Error (500 - Internal Server Error)**:
    If there is an issue with the database or server:
    ```json
    {
      "message": "Failed to add invoice"
    }
    ```

### **Show Invoice**

- **URL**: `/stock/invoice/:invoiceId`
- **Method**: `GET`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)

- **URL Parameters**:

  - `invoiceId`: The ID of the invoice to retrieve.

- **Response**:

  - **Success (200 - OK)**:

    ```json
    {
      "invoice": {
        "invoiceId": 1,
        "fromAddress": "123 Main St, Cityville",
        "toAddress": "456 Elm St, Townsville",
        "actualAmount": 1000.0,
        "gstAmount": 180.0,
        "invoiceDate": "2024-11-29",
        "invoiceImage": "/uploads/invoice-12345.png"
      }
    }
    ```

  - **Error (404 - Not Found)**:
    If the invoice with the given `invoiceId` does not exist:

    ```json
    {
      "message": "Invoice not found"
    }
    ```

  - **Error (500 - Internal Server Error)**:
    If there is an issue with the database or server:
    ```json
    {
      "message": "Failed to fetch invoice"
    }
    ```

### **Show All Invoices**

- **URL**: `/stock/invoices`
- **Method**: `GET`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)

- **Response**:

  - **Success (200 - OK)**:

    ```json
    {
      "invoices": [
        {
          "invoiceId": 1,
          "fromAddress": "123 Main St, Cityville",
          "toAddress": "456 Elm St, Townsville",
          "actualAmount": 1000.0,
          "gstAmount": 180.0,
          "invoiceDate": "2024-11-29",
          "invoiceImage": "/uploads/invoice-12345.png"
        },
        {
          "invoiceId": 2,
          "fromAddress": "789 Oak St, Villageville",
          "toAddress": "123 Pine St, Villagewood",
          "actualAmount": 2000.0,
          "gstAmount": 360.0,
          "invoiceDate": "2024-11-28",
          "invoiceImage": "/uploads/invoice-67890.png"
        }
      ]
    }
    ```

  - **Error (500 - Internal Server Error)**:
    If there is an issue with the database or server:
    ```json
    {
      "message": "Failed to fetch invoices"
    }
    ```

### **Update Invoice**

- **URL**: `/stock/invoice/update/:invoiceId`
- **Method**: `PUT`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
  - `Content-Type`: `application/json`

- **URL Parameters**:

  - `invoiceId`: The ID of the invoice to update.

- **Body Parameters**:

  ```json
  {
    "fromAddress": "string", // Address from where the invoice is sent
    "toAddress": "string", // Address to where the invoice is sent
    "actualAmount": "decimal", // Total amount before tax
    "gstAmount": "decimal", // GST amount for the invoice
    "invoiceDate": "date", // Date when the invoice was created (YYYY-MM-DD)
    "invoiceImage": "string" // Optional. Path to the uploaded image of the invoice (relative path)
  }
  ```

- **Response**:

  - **Success (200 - OK)**:

    ```json
    {
      "message": "Invoice updated successfully",
      "invoice": {
        "invoiceId": 1,
        "fromAddress": "123 New St, Cityville",
        "toAddress": "789 New St, Townsville",
        "actualAmount": 1200.0,
        "gstAmount": 216.0,
        "invoiceDate": "2024-11-30",
        "invoiceImage": "/uploads/invoice-12345-updated.png"
      }
    }
    ```

  - **Error (404 - Not Found)**:
    If the invoice with the given `invoiceId` does not exist:

    ```json
    {
      "message": "Invoice not found"
    }
    ```

  - **Error (500 - Internal Server Error)**:
    If there is an issue with the database or server:
    ```json
    {
      "message": "Failed to update invoice"
    }
    ```

### **Delete Invoice**

- **URL**: `/stock/invoice/delete/:invoiceId`
- **Method**: `DELETE`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)

- **URL Parameters**:

  - `invoiceId`: The ID of the invoice to delete.

- **Response**:

  - **Success (200 - OK)**:

    ```json
    {
      "message": "Invoice deleted successfully"
    }
    ```

  - **Error (404 - Not Found)**:
    If the invoice with the given `invoiceId` does not exist:

    ```json
    {
      "message": "Invoice not found"
    }
    ```

  - **Error (500 - Internal Server Error)**:
    If there is an issue with the database or server:
    ```json
    {
      "message": "Failed to delete invoice"
    }
    ```

### **Location Routes Documentation**

#### **1. Add Location**

- **URL**: `/stock/location/add`
- **Method**: `POST`
- **Headers**:
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
  - `Content-Type`: `application/json`
- **Body Parameters**:

  ```json
  {
    "locationName": "string" // The name of the location (must be unique)
  }
  ```

- **Response**:
  - **Success (201 - Created)**:
    ```json
    {
      "message": "Location added successfully",
      "location": {
        "locationId": 1,
        "locationName": "New York"
      }
    }
    ```
  - **Error (400 - Bad Request)**:
    If the required field `locationName` is missing:
    ```json
    {
      "message": "Location name is required"
    }
    ```
  - **Error (500 - Internal Server Error)**:
    If there is an issue with the database or server:
    ```json
    {
      "message": "Failed to add location"
    }
    ```

#### **2. Show Location**

- **URL**: `/stock/location/:locationId`
- **Method**: `GET`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)

- **URL Parameters**:

  - `locationId`: The ID of the location to retrieve.

- **Response**:

  - **Success (200 - OK)**:

    ```json
    {
      "location": {
        "locationId": 1,
        "locationName": "New York"
      }
    }
    ```

  - **Error (404 - Not Found)**:
    If the location with the given `locationId` does not exist:

    ```json
    {
      "message": "Location not found"
    }
    ```

  - **Error (500 - Internal Server Error)**:
    If there is an issue with the database or server:
    ```json
    {
      "message": "Failed to fetch location"
    }
    ```

#### **3. Show All Locations**

- **URL**: `/stock/locations`
- **Method**: `GET`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)

- **Response**:

  - **Success (200 - OK)**:

    ```json
    {
      "locations": [
        {
          "locationId": 1,
          "locationName": "New York"
        },
        {
          "locationId": 2,
          "locationName": "San Francisco"
        }
      ]
    }
    ```

  - **Error (500 - Internal Server Error)**:
    If there is an issue with the database or server:
    ```json
    {
      "message": "Failed to fetch locations"
    }
    ```

#### **4. Update Location**

- **URL**: `/stock/location/update/:locationId`
- **Method**: `PUT`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
  - `Content-Type`: `application/json`

- **URL Parameters**:

  - `locationId`: The ID of the location to update.

- **Body Parameters**:

  ```json
  {
    "locationName": "string" // New name for the location
  }
  ```

- **Response**:

  - **Success (200 - OK)**:

    ```json
    {
      "message": "Location updated successfully",
      "location": {
        "locationId": 1,
        "locationName": "Los Angeles"
      }
    }
    ```

  - **Error (404 - Not Found)**:
    If the location with the given `locationId` does not exist:

    ```json
    {
      "message": "Location not found"
    }
    ```

  - **Error (500 - Internal Server Error)**:
    If there is an issue with the database or server:
    ```json
    {
      "message": "Failed to update location"
    }
    ```

#### **5. Delete Location**

- **URL**: `/stock/location/delete/:locationId`
- **Method**: `DELETE`
- **Headers**:

  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)

- **URL Parameters**:

  - `locationId`: The ID of the location to delete.

- **Response**:

  - **Success (200 - OK)**:

    ```json
    {
      "message": "Location deleted successfully"
    }
    ```

  - **Error (404 - Not Found)**:
    If the location with the given `locationId` does not exist:

    ```json
    {
      "message": "Location not found"
    }
    ```

  - **Error (500 - Internal Server Error)**:
    If there is an issue with the database or server:
    ```json
    {
      "message": "Failed to delete location"
    }
    ```

### Remarks API Documentation

#### Add Remark

- **URL**: `/stock/remark/add`
- **Method**: `POST`
- **Headers**:
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
- **Body** (JSON):
  ```json
  {
    "remark": "This is a sample remark"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Remark added successfully",
    "remark": {
      "remarkId": 1,
      "remark": "This is a sample remark"
    }
  }
  ```

#### Get Remark by ID

- **URL**: `/stock/remark/:id`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
- **Response**:
  ```json
  {
    "remark": {
      "remarkId": 1,
      "remark": "This is a sample remark"
    }
  }
  ```

#### Get All Remarks

- **URL**: `/stock/remark/`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
- **Response**:
  ```json
  {
    "remarks": [
      {
        "remarkId": 1,
        "remark": "This is a sample remark"
      },
      {
        "remarkId": 2,
        "remark": "Another remark"
      }
    ]
  }
  ```

#### Update Remark by ID

- **URL**: `/stock/remark/:id`
- **Method**: `PUT`
- **Headers**:
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
- **Body** (JSON):
  ```json
  {
    "remark": "Updated remark content"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Remark updated successfully",
    "remark": {
      "remarkId": 1,
      "remark": "Updated remark content"
    }
  }
  ```

#### Delete Remark by ID

- **URL**: `/stock/remark/:id`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization`: `<token>` (Replace `<token>` with the JWT obtained during login)
- **Response**:
  ```json
  {
    "message": "Remark deleted successfully"
  }
  ```

### Stock Routes Documentation

#### 1. **Get All Stocks**

- **URL**: `/stock`
- **Method**: `GET`
- **Description**: Retrieve all stocks.
- **Headers**:
  ```json
  {
    "Authorization": "<token>"
  }
  ```
- **Response**:
  ```json
  {
    "stocks": [
      {
        "productId": 1,
        "productName": "Sample Product",
        "gst": 18.0,
        ...
      }
    ]
  }
  ```

#### 2. **Add a Stock**

- **URL**: `/stock/add`
- **Method**: `POST`
- **Description**: Add a new stock.
- **Headers**:
  ```json
  {
    "Authorization": "<token>"
  }
  ```
- **Request Body**:
  ```json
{
  "productVolPageSerial": "123456",
  "productName": "Sample Producdt",
  "productDescription": "Sample Descridsfption",
  "locationId": 3,
  "remarkId": 4,
  "gst": 18.0,
  "productImage": "image_ursdfl",
  "invoiceId": 4,
  "categoryId": 4,
  "productPrice": 5000
}

  ```
- **Response**:
  ```json
{
  "message": "Stock added successfully",
  "product": {
    "productId": 25,
    "productVolPageSerial": "123456",
    "productName": "Sample Producdt",
    "productDescription": "Sample Descridsfption",
    "locationId": 3,
    "remarkId": 4,
    "gst": "18",
    "productImage": "image_ursdfl",
    "productPrice": 5000,
    "invoiceId": 4,
    "categoryId": 4
  }
}
  ```

#### 3. **Search Stocks**

- **URL**: `/stock/search`
- **Method**: `GET`
- **Description**: Search stocks by column and query.
- **Headers**:
  ```json
  {
    "Authorization": "<token>"
  }
  ```
- **Query Parameters**:
  - `query`: The search term (e.g., "Sample Product").
  - `column`: The column to search in (e.g., "product_name").
- **Example**:
  ```
  /stock/search?query=Sample&column=product_name
  ```
- **Response**:
  ```json
  [
    {
      "productId": 1,
      "productName": "Sample Product",
      ...
    }
  ]
  ```

#### 4. **Delete a Stock**

- **URL**: `/stock/:productId`
- **Method**: `DELETE`
- **Description**: Delete a stock by product ID.
- **Headers**:
  ```json
  {
    "Authorization": "<token>"
  }
  ```
- **Path Parameter**:
  - `productId`: The ID of the product to delete.
- **Response**:
  ```json
  {
    "message": "Stock deleted successfully"
  }
  ```

#### 5. **Update a Stock**

- **URL**: `/stock/update/:productId`
- **Method**: `PUT`
- **Description**: Update stock details.
- **Headers**:
  ```json
  {
    "Authorization": "<token>"
  }
  ```
- **Path Parameter**:
  - `productId`: The ID of the product to update.
- **Request Body**:
  ```json
  {
    "productVolPageSerial": "123456",
    "productName": "Sample Producdt",
    "productDescription": "Sample Descridsfption",
    "locationId": 3,
    "remarkId": 4,
    "gst": 18,
    "productImage": "image_ursdfl",
    "invoiceId": 4,
    "categoryId": 4,
    "productPrice": 5555
  }
  ```
- **Response**:
  ```json
  {
    "message": "Stock updated successfully",
    "stock": [
      {
        "productId": 25,
        "productVolPageSerial": "123456",
        "productName": "Sample Producdt",
        "productDescription": "Sample Descridsfption",
        "locationId": 3,
        "remarkId": 4,
        "gst": "18",
        "productImage": "image_ursdfl",
        "productPrice": 5555,
        "invoiceId": 4,
        "categoryId": 4
      }
    ]
  }
  ```

### Get All Users

   - **Endpoint:** `/usermanagement/`
   - **Method:** `GET`
   - **Headers:** `Authorization: <token>`
   - **Description:** Fetch all users.
   - **Response:**
     ```json
     [
       {
         "userId": 1,
         "userName": "JohnDoe",
         "role": "admin"
       }
     ]
     ```

### Get User by ID

   - **Endpoint:** `/usermanagement/:userId`
   - **Method:** `GET`
   - **Headers:** `Authorization: <token>`
   - **Description:** Fetch a specific user and their privileges.
   - **Response:**
     ```json
     {
       "user": {
         "userId": 1,
         "userName": "JohnDoe",
         "role": "admin"
       },
       "privileges": [
         {
           "privilegeId": 1,
           "privilege": "view_dashboard"
         }
       ]
     }
     ```

### Register User

   - **Endpoint:** `/usermanagement/register`
   - **Method:** `POST`
   - **Headers:** `Authorization: <token>`
   - **Body:**
     ```json
     {
       "userName": "JohnDoe",
       "password": "securePassword",
       "privileges": ["view_dashboard", "edit_profile"],
       "role": "admin"
     }
     ```
   - **Description:** Registers a new user with privileges.
   - **Response:**
     ```json
     {
       "user": {
         "userId": 1,
         "userName": "JohnDoe",
         "role": "admin"
       },
       "token": "<jwt_token>"
     }
     ```

### Update User

   - **Endpoint:** `/usermanagement/:userId`
   - **Method:** `PUT`
   - **Headers:** `Authorization: <token>`
   - **Body:**
     ```json
     {
       "userName": "UpdatedUserName",
       "privileges": ["view_dashboard"]
     }
     ```
   - **Description:** Updates user details and privileges.
   - **Response:** `204 No Content`

### Delete User

   - **Endpoint:** `/usermanagement/:userId`
   - **Method:** `DELETE`
   - **Headers:** `Authorization: <token>`
   - **Description:** Deletes a user and their associated privileges.
   - **Response:** `204 No Content`

## Middleware

### Validation Middleware
   - Ensures request data conforms to the schema before proceeding.

### Authorization Middleware
   - Requires a valid token to access all routes.

### Logger middleware
   - Requires to log sensitive changes in database.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.