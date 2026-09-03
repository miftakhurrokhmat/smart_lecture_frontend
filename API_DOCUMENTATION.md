# Smart Lecture API Documentation

## Base URL

```
http://localhost:8080/api
```

## Authentication Endpoints

### Login

**POST** `/auth/login`

Request body:

```json
{
  "email": "minato@smartlecture.com",
  "password": "password123"
}
```

Response (200):

```json
{
  "success": true,
  "token": "base64_encoded_token",
  "user": {
    "id": "1",
    "email": "minato@smartlecture.com",
    "name": "Minato",
    "role": "mahasiswa"
  }
}
```

---

### Register

**POST** `/auth/register`

Request body:

```json
{
  "nim": "12345678",
  "program": "Teknik Informatika",
  "fullName": "John Doe",
  "gender": "male",
  "email": "john@smartlecture.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

Response (201):

```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "generated_id",
    "email": "john@smartlecture.com",
    "name": "John Doe"
  }
}
```

---

### Logout

**POST** `/auth/logout`

Headers:

```
Authorization: Bearer <token>
```

Response (200):

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Course Endpoints

### Get Dashboard

**GET** `/dashboard`

Response (200):

```json
{
  "success": true,
  "courses": [
    {
      "id": "1",
      "name": "Sistem Informasi (TI-3A)",
      "instructor": "Miftakhurrokhmat",
      "icon": "📋",
      "color": "from-blue-400 to-blue-600",
      "status": "LIVE",
      "time": "08:00-10:00",
      "code": "TI301"
    }
  ],
  "user": {
    "name": "Minato",
    "email": "minato@smartlecture.com"
  }
}
```

---

### Get All Courses

**GET** `/courses`

Response (200):

```json
{
  "success": true,
  "courses": [
    {
      "id": "1",
      "name": "Sistem Informasi (TI-3A)",
      "instructor": "Miftakhurrokhmat",
      "icon": "📋",
      "color": "from-blue-400 to-blue-600",
      "status": "LIVE",
      "time": "08:00-10:00",
      "code": "TI301"
    }
  ]
}
```

---

### Get Course by ID

**GET** `/courses/:courseId`

Response (200):

```json
{
  "success": true,
  "course": {
    "id": "1",
    "name": "Sistem Informasi (TI-3A)",
    "instructor": "Miftakhurrokhmat",
    "time": "08:00 - 10:00",
    "status": "LIVE",
    "transcripts": [
      {
        "id": "t1",
        "time": "10:15:32",
        "text": "Selamat pagi semuanya...",
        "status": "Ready"
      }
    ],
    "summary": "Pembahasan tentang teknik-teknik database..."
  }
}
```

---

### Get Course Transcripts

**GET** `/courses/:courseId/transcripts`

Response (200):

```json
{
  "success": true,
  "transcripts": [
    {
      "id": "t1",
      "time": "10:15:32",
      "text": "Selamat pagi semuanya...",
      "status": "Ready"
    }
  ]
}
```

---

## User Endpoints

### Get Profile

**GET** `/user/profile?userId=1`

Response (200):

```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "minato@smartlecture.com",
    "name": "Minato",
    "nim": "12345678",
    "program": "Teknik Informatika",
    "gender": "male"
  }
}
```

---

### Update Profile

**PUT** `/user/profile?userId=1`

Request body:

```json
{
  "name": "Minato Updated",
  "email": "minato.updated@smartlecture.com",
  "program": "Teknik Informatika"
}
```

Response (200):

```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "minato.updated@smartlecture.com",
    "name": "Minato Updated",
    "nim": "12345678",
    "program": "Teknik Informatika",
    "gender": "male"
  }
}
```

---

## Mock User Credentials

For testing login:

```
Email: minato@smartlecture.com
Password: password123
```

---

## Mock Courses

1. **Sistem Informasi (TI-3A)** - Status: LIVE (08:00-10:00)
2. **Basis Data (TI-3A)** - Status: Selesaiakses (10:20-12:00)
3. **Kecerdasan Buatan (TI-3A)** - Status: Sedang diakses (12:20-14:00)

---

## Error Responses

### Bad Request (400)

```json
{
  "success": false,
  "message": "Email and password are required"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Conflict (409)

```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Course not found"
}
```
