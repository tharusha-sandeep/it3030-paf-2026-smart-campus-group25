# Smart Campus - IT3030 PAF 2026 Group 25

A comprehensive campus management system featuring incident ticketing, resource booking, notifications, and OAuth2 integration.

---

## Project Setup

### Prerequisites

- **Java 17+** (Backend)
- **Node.js 18+** (Frontend)
- **PostgreSQL 12+**
- **Maven 3.8+**

### 1. Clone the Repository

```bash
git clone https://github.com/tharusha-sandeep/it3030-paf-2026-smart-campus-group25.git
cd it3030-paf-2026-smart-campus-group25
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb smartcampus
```

### 3. Backend Configuration

Copy the example properties file and fill in your values:

```bash
cp backend/smart-campus-api/src/main/resources/application.properties.example backend/smart-campus-api/src/main/resources/application.properties
```

Open `application.properties` and set the following:

```properties
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/smartcampus
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=openid,profile,email
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google
spring.security.oauth2.client.registration.google.client-authentication-method=client_secret_post
spring.security.oauth2.client.provider.google.user-info-uri=https://www.googleapis.com/oauth2/v3/userinfo
spring.security.oauth2.client.provider.google.authorization-uri=https://accounts.google.com/o/oauth2/v2/auth

jwt.secret=your-secret-key-minimum-32-characters-long
jwt.expiration-ms=86400000

frontend.url=http://localhost:5173

spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=20MB
```

> **Note:** `application.properties` is gitignored and must never be committed. Use `application.properties.example` as the template.

### 4. Run the Backend

```bash
cd backend/smart-campus-api
mvn clean spring-boot:run
```

The API will start at **http://localhost:8080**

### 5. Run the Frontend

Open a new terminal:

```bash
cd frontend/smart-campus-ui
npm install
npm run dev
```

The app will open at **http://localhost:5173**

---

## API Endpoints

### Module C – Incident Ticketing (Rashmy)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/tickets` | Create incident ticket (with file attachments) | USER |
| GET | `/api/tickets/my` | Get my tickets | USER |
| GET | `/api/tickets` | Get all tickets | ADMIN |
| GET | `/api/tickets/{id}` | Get ticket by ID | USER/ADMIN |
| PATCH | `/api/tickets/{id}/status` | Update status, assign technician, add notes | ADMIN |
| DELETE | `/api/tickets/{id}` | Delete ticket | USER (owner) / ADMIN |
| POST | `/api/tickets/{id}/comments` | Add comment to ticket | USER |
| GET | `/api/tickets/{id}/comments` | Get all comments on ticket | USER |
| PUT | `/api/tickets/{id}/comments/{cid}` | Edit own comment | USER (owner) |
| DELETE | `/api/tickets/{id}/comments/{cid}` | Delete comment | USER (owner) / ADMIN |

### Module D – Notifications (Rashmy)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get my notifications | USER |
| GET | `/api/notifications/unread-count` | Get unread count | USER |
| PATCH | `/api/notifications/{id}/read` | Mark notification as read | USER |
| POST | `/api/notifications/read-all` | Mark all as read | USER |

### Module A – Resources (Tharusha)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/resources` | Get all resources | USER |
| POST | `/api/resources` | Create resource | ADMIN |
| PUT | `/api/resources/{id}` | Update resource | ADMIN |
| DELETE | `/api/resources/{id}` | Delete resource | ADMIN |

### Module B – Bookings (Tharusha)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create booking request | USER |
| GET | `/api/bookings/my` | Get my bookings | USER |
| GET | `/api/bookings` | Get all bookings | ADMIN |
| PATCH | `/api/bookings/{id}/approve` | Approve booking | ADMIN |
| PATCH | `/api/bookings/{id}/reject` | Reject booking | ADMIN |

### Module E – Auth (Tharusha)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login with email/password | Public |
| GET | `/oauth2/authorization/google` | Google OAuth login | Public |

---

## Key Workflows

### Ticket Workflow

1. **User creates ticket** → `/api/tickets` (with attachments)
2. **Admin reviews** → `/api/tickets` (list all)
3. **Admin assigns & updates status** → `/api/tickets/{id}/status`
4. **User & Admin comment** → `/api/tickets/{id}/comments`
5. **Notifications sent** → Real-time updates

### Booking Workflow

1. **User creates booking request** → `/api/bookings`
2. **Admin approves/rejects** → `/api/bookings/{id}/approve` or `/api/bookings/{id}/reject`
3. **Resource availability updated**
4. **Notifications sent** to user

---

## Team Members & Module Assignments

| Member | Module | Responsibilities |
|--------|--------|------------------|
| **Rashmy** | C & D | Incident Ticketing & Notifications |
| **Tharusha** | A, B & E | Resources, Bookings & Authentication |

---

## Technologies Used

- **Backend:** Spring Boot, Spring Security, Spring Data JPA, PostgreSQL
- **Frontend:** React, Vite, JavaScript
- **Authentication:** OAuth2 (Google), JWT
- **Database:** PostgreSQL
- **Build Tools:** Maven (Backend), npm (Frontend)

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## License

This project is part of the IT3030 PAF 2026 course at [University Name].
