
# Project Title

A brief description of the project's purpose and its intended audience.

## Installation

### 1. Clone the Repository

To get started, clone the repository using the following command:

```bash
git clone https://github.com/ahmadisyraf/petakom-hackathon-server.git
```

### 2. Install Dependencies

Navigate to the project directory and install the required dependencies using `npm`:

```bash
npm install
```

### 3. Run the Application

Once the dependencies are installed, run the development server:

```bash
npm run dev
```

### 4. Access the Local Server

After the server is running, you can access the application at:

```
http://localhost:3000
```

## API Reference

This section outlines the API endpoints available in the project.

### User Endpoints

#### 1. Get All Users

Fetches a list of all users.

```http
GET /api/users
```

**Headers**:
- `api_key` (string, required): Your API key for authentication.

#### 2. Get a Specific User

Fetches details of a user by their ID.

```http
GET /api/users/${id}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id`      | `string` | **Required**. The ID of the user to fetch |

#### 3. Create a New User

Creates a new user in the system.

```http
POST /api/users
```

| Parameter     | Type     | Description                          |
| :------------ | :------- | :----------------------------------- |
| `first_name`  | `string` | **Required**. First name of the user |
| `last_name`   | `string` | **Required**. Last name of the user  |
| `email`       | `string` | **Required**. Email address          |
| `password`    | `string` | **Required**. Password for the user  |

#### 4. Delete a User

Deletes a user by their ID.

```http
DELETE /api/users/${id}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id`      | `string` | **Required**. The ID of the user to delete |

#### 5. Update a User

Updates the information of an existing user. Only the fields provided will be updated.

```http
PATCH /api/users/${id}
```

| Parameter     | Type     | Description                          |
| :------------ | :------- | :----------------------------------- |
| `id`          | `string` | **Required**. The ID of the user     |
| `first_name`  | `string` | First name of the user (optional)    |
| `last_name`   | `string` | Last name of the user (optional)     |
| `email`       | `string` | Email address (optional)             |
| `password`    | `string` | Password (optional, hashed securely) |