# QuickShare Backend

QuickShare is a backend service for a seamless file-sharing platform that allows users to share files instantly without mandatory registration. Users can create temporary "rooms," drop files into them, and others can download the content simply by entering the room code.

The system utilizes **Redis** for high-performance caching of room metadata, **Cloudinary** for secure file storage, and **Cron jobs** for automatic cleanup of expired rooms and files.

## 🚀 Features

-   **Ephemeral Rooms:** Create temporary rooms with a specific lifespan (in minutes).
-   **Anonymous Sharing:** No login required to upload or download files.
-   **User Authentication:** Optional Signup/Login functionality for persistent user management.
-   **Cloud Storage:** Integrated with Cloudinary for handling file uploads.
-   **High Performance:** Uses Redis to store active room details for fast retrieval.
-   **Auto Cleanup:** Scheduled Cron jobs automatically delete expired rooms and files to save resources.
-   **Containerized:** Docker support for easy deployment.

## 🛠 Tech Stack

-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Databases:**
    -   **MongoDB** (Mongoose) - Persistent user and room data.
    -   **Redis** - Caching room metadata and file links.
-   **Storage:** Cloudinary
-   **DevOps:** Docker & Docker Compose

## 📂 Project Structure

```text
backend/
├── controllers/          # Logic for handling API requests
│   ├── fileupload.controller.js
│   ├── room.controller.js
│   └── user.controller.js
├── middlewares/          # Authentication and File handling middlewares
│   ├── auth.middleware.js
│   └── multer.middleware.js
├── models/               # Mongoose schemas
├── mongoDB/              # Database connection logic
│   └── database.js
├── public/temp/          # Temporary local storage for uploads
├── routes/               # API Route definitions
│   ├── fileuploadroutes.js
│   ├── roomroutes.js
│   └── userroutes.js
├── uploads/              # Local upload directory
├── utils/                # Helper functions and configurations
│   ├── cloudinary.js
│   └── redisclient.js
├── .env                  # Environment variables
├── docker-compose.yml    # Docker services config
├── Dockerfile            # Docker image config
├── index.js              # Application entry point
└── package.json
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Config
JWT_SECRET=your_jwt_secret
```

## 🏃‍♂️ Installation & Run

### Option 1: Using Docker (Recommended)

Ensure you have Docker and Docker Compose installed.

```bash
# Build and run the containers
docker-compose up --build
```

### Option 2: Local Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Start Redis:**
    Ensure a local Redis instance is running or update the `REDIS_URL` in your `.env`.
3.  **Run the Server:**
    ```bash
    npm start
    # or for development
    npm run dev
    ```

## 📖 API Documentation

### 🏠 Room Routes

#### 1. Create Room
Creates a new temporary room.

*   **Endpoint:** `POST /rooms/createroom`
*   **Body:**
    ```json
    {
      "roomcode": "apple",
      "allowotherstodropdocs": false,
      "time": 10 // time in minutes
    }
    ```
*   **Response:**
    ```json
    {
      "room": {
        "roomcode": "apple",
        "files": [],
        "allowotherstodropdocs": false,
        "createdAt": "1761314688698",
        "activetill": 1761315288698,
        "_id": "...",
        "__v": 0
      },
      "message": "apple created successfully"
    }
    ```

#### 2. Join Room
Retrieves room details and files.

*   **Endpoint:** `POST /rooms/joinroom`
*   **Body:**
    ```json
    { "roomcode": "apple" }
    ```
*   **Response:**
    ```json
    {
      "room": "apple",
      "parsedredisdata": [
        {
          "format": "pdf",
          "createdAt": "2025-10-24T14:05:19Z",
          "pages": 2,
          "size": 94780,
          "url": "https://res.cloudinary.com/.../file.pdf",
          "originalName": "Uploaded file name",
          "roomcode": "apple",
          "ip": "::1"
        }
      ]
    }
    ```

---

### 📂 File Upload Routes

#### 1. Upload File
Uploads files to a specific room.

*   **Endpoint:** `POST /file-upload/upload`
*   **Headers:** `Content-Type: multipart/form-data`
*   **Body:**
    *   `roomcode`: "apple"
    *   `time`: 10 (minutes)
    *   `file`: [Select files]
*   **Response:**
    ```json
    {
      "message": "ok",
      "uploadedfilesname": ["file1.pdf"],
      "metadata": [
        {
          "format": "pdf",
          "createdAt": "...",
          "size": 94780,
          "url": "https://res.cloudinary.com/...",
          "originalName": "file1.pdf",
          "roomcode": "apple",
          "ip": "::1"
        }
      ],
      "uploadFailed": []
    }
    ```

---

### 👤 User / Auth Routes

#### 1. Signup
Registers a new user and sets a cookie token.

*   **Endpoint:** `POST /user/signup`
*   **Body:**
    ```json
    {
      "userName": "sample",
      "email": "sample@gmail.com",
      "password": "password"
    }
    ```

#### 2. Login
Logs in an existing user.

*   **Endpoint:** `POST /user/login`
*   **Body:**
    ```json
    {
      "email": "sample@gmail.com",
      "password": "password"
    }
    ```

#### 3. Check Auth Status
Checks if the user is currently logged in.

*   **Endpoint:** `GET /auth/check`
*   **Response:**
    ```json
    {
      "loggedin": true,
      "user": {
        "email": "sample@gmail.com",
        "username": "sample",
        "iat": 1761316440
      }
    }
    ```

#### 4. Logout
Logs out the user and clears cookies.

*   **Endpoint:** `POST /user/logout`

#### 5. Delete User
Deletes the currently logged-in user account.

*   **Endpoint:** `DELETE /user/deleteuser`


## 🕒 Cron Jobs & Automatic Cleanup

To ensure the platform remains lightweight and storage-efficient, the backend utilizes **Cron Jobs** to handle data expiration.

*   **Schedule:** The job runs periodically (configured in `index.js`).
*   **Logic:**
    1.  Scans the database for rooms where the `activetill` timestamp has passed the current time.
    2.  **Cloudinary:** Deletes the actual physical files associated with the expired room to free up cloud storage.
    3.  **Redis:** Flushes the cached metadata for the room.
    4.  **MongoDB:** Hard deletes the room document from the database.

## 🧠 Behind the Scenes

### Redis Caching
Redis is used to store `parsedredisdata` for instant access when users join a room. Instead of querying MongoDB for file lists every time a user refreshes a room:
1.  **On Upload:** File metadata is pushed to a Redis list keyed by the `roomcode`.
2.  **On Join:** The backend fetches the list from Redis immediately.

### File Upload Flow
1.  **Multer Middleware:** Intercepts the request and saves the file temporarily to `public/temp`.
2.  **Controller:** Uploads the local file to **Cloudinary**.
3.  **Cleanup:** Deletes the file from `public/temp` immediately after the cloud upload is confirmed to keep the server clean.

## 🛡️ Middleware

*   **`auth.middleware.js`**: Protects user routes. It extracts the JWT token from the `cookies`, verifies the signature, and attaches the user object to the request.
*   **`multer.middleware.js`**: Configures storage engines and limits for handling `multipart/form-data` file uploads.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes (`git commit -m 'Add some NewFeature'`).
4.  Push to the branch (`git push origin feature/NewFeature`).
5.  Open a Pull Request.

## 📄 License

This project is open-source and available under the **MIT License**.