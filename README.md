# MeAgainTest

Mobile application for managing sessions, smart suggestions, and user availability.

---

## Table of Contents
- [Technologies](#technologies)
- [Repository Structure](#repository-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Technologies

- **Frontend:** React Native + TypeScript  
- **Backend:** Node.js + Express  
- **Communication:** Axios + REST API  
- **Database:** (insert database used, e.g., MongoDB, PostgreSQL)  
- **Others:** Expo for mobile app, Day.js for date/time handling, React Native Vector Icons

---

## Repository Structure

/client → Mobile app (React Native)
/server → API backend
/src → Utils, services, screens, and types (client)
/types → TypeScript type definitions
README.md → Project README
ARCHITECTURE.md → Architecture documentation

yaml
Copy code

---

## Installation

### Backend
Server
cd server
npm install
npm run dev


Mobile
bash
Copy code
cd client
npm install
expo start

Make sure to set BASE_URL in the client to point to the correct backend (e.g., http://192.168.x.x:3000/api or http://10.0.2.2:3000/api for Android emulator).

Usage
Open the app on your device or emulator.

The app automatically detects the device ID (macDevice) to load sessions and availability.

Set your availability blocks to define when you are free.

The system generates session suggestions based on your completed session history and availability.

Accept a suggestion to create a new session for today.

View "Today's Sessions" and track completed sessions.

API Endpoints
Session Types
GET /session-types?mac=<mac> – Get session types for device

POST /session-types?mac=<mac> – Create a new session type

DELETE /session-types/?id=<id> – Delete a session type

Sessions
GET /sessions?mac=<mac> – Get sessions for device

GET /sessions?mac=<mac>&filter=full – Get full session details

POST /sessions?action=INSERT&mac=<mac> – Create a new session

POST /sessions/?action=COMPLETE_SESSION&id=<id>&mac=<mac> – Mark session as complete

DELETE /sessions/?id=<id> – Delete session

POST /sessions/suggest – Generate smart session suggestions

Availability
GET /availability?mac=<mac> – Get availability blocks

POST /availability?mac=<mac> – Create availability block

DELETE /availability/?id=<id> – Delete availability block

Progress
GET /progress – Get progress metrics