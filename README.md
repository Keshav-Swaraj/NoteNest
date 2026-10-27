# NoteNest

**Your thoughts, neatly nested.** A single-user notes app built with React, Vite, Spring Boot, Spring Data JPA, and MySQL. This is a local student project with no login or account isolation.

## Requirements

- Node.js 18 or newer and npm
- JDK 17 or newer (`java -version`)
- Maven 3.9 or newer (`mvn -version`)
- MySQL 8 running locally

## Database setup

Create a dedicated local MySQL user. In a MySQL shell as an administrator:

```sql
CREATE DATABASE IF NOT EXISTS notenest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'notenest'@'localhost' IDENTIFIED BY 'choose-a-local-password';
GRANT ALL PRIVILEGES ON notenest.* TO 'notenest'@'localhost';
```

Hibernate creates/updates the development tables (`notes`, `note_tags`) automatically at startup. The MySQL user must have schema creation privileges. Set credentials as environment variables; no password belongs in source code.

### PowerShell

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/notenest'
$env:DB_USER = 'notenest'
$env:DB_PASSWORD = 'choose-a-local-password'
$env:SEED_NOTES = 'true' # optional, inserts three examples only when the database is empty
cd backend
mvn spring-boot:run
```

### macOS/Linux shell

```sh
export DB_URL='jdbc:mysql://localhost:3306/notenest'
export DB_USER='notenest'
export DB_PASSWORD='choose-a-local-password'
export SEED_NOTES=true # optional
cd backend && mvn spring-boot:run
```

In a second terminal:

```sh
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Vite forwards `/api` requests to Spring Boot at **http://localhost:8080**. If the frontend runs on a different origin, set `CORS_ORIGIN` for the backend. For a separately hosted frontend, set `VITE_API_URL` to the backend origin before building; see the `.env.example` files.

## Features

- Create, view, edit, and permanently delete notes with validation and confirmation
- Search title and content; filter by category, tag, pinned state, or archived state; sort by update time, creation time, or title
- Pin notes and move them into or out of the archive
- Dashboard counts from the database, loading/empty/error states, and action notifications
- Multiple tags per note, stored in a `note_tags` table with a unique note/tag pair
- Optional demo data with `SEED_NOTES=true`; existing databases are never reseeded

## API

All responses are JSON except successful DELETE (204). Failed requests return `{ "timestamp": "...", "status": 400, "message": "..." }`, with a `fields` object for validation errors.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/notes?q=&category=&tag=&pinned=&archived=false&sort=updated` | List/filter notes. Sort: `updated`, `newest`, `title`. Active notes by default. |
| GET | `/api/notes/{id}` | Read one note |
| POST | `/api/notes` | Create note (201) |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Permanently delete note (204) |
| GET | `/api/notes/search?q=...` | Search active notes |
| GET | `/api/notes/pinned` | Pinned active notes |
| GET | `/api/notes/archived` | Archived notes |
| PATCH | `/api/notes/{id}/pin` | Toggle pin |
| PATCH | `/api/notes/{id}/archive` | Toggle archive |
| GET | `/api/notes/stats` | Active total, active pinned, archived counts |
| GET | `/api/categories` | Available categories |
| GET | `/api/tags` | Existing tags |

Create/update JSON example:

```json
{ "title": "Project idea", "content": "Build a notes app", "category": "Ideas", "color": "mint", "tags": ["college", "project"] }
```

Categories: Personal, Study, Work, Ideas, Other. Colors: cream, mint, peach, lavender, sky, rose. Title and content are required; title length is at most 160 characters; up to 10 tags, each at most 40 characters.

## Build and test

```sh
cd frontend && npm run build
cd ../backend && mvn test && mvn package
```

The backend tests cover creation/normalization, invalid category, not-found behavior, pin/archive toggles, validation responses, and the API lifecycle against a test-only H2 database. Running the application with MySQL requires the environment variables above.

## Troubleshooting

- **`java -version` shows Java 8:** Install JDK 17+ and point `JAVA_HOME` and `PATH` to it before running Maven.
- **`mvn` not found:** Install Maven 3.9+ or add its `bin` directory to `PATH`.
- **Database connection refused:** Start MySQL, check port 3306, and verify `DB_URL`, `DB_USER`, and `DB_PASSWORD`.
- **Frontend says it cannot reach the server:** Start the backend and confirm `http://localhost:8080/api/categories` responds.
- **CORS error:** Use Vite at `localhost:5173` or set `CORS_ORIGIN` to your frontend origin.

This app deliberately has no authentication. Use it only as a personal local demo; add real authentication and per-user data isolation before deploying it as a shared service.
