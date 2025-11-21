
# Architecture — MeAgainTest

## Overview
The system has two main layers: **mobile client** (React Native + Expo) and **API backend** (Node.js + Express).  
The device, identified by `macDevice`, communicates with the API to manage sessions, availability, and smart suggestions.

## Project Structure
### Client (`/client`)
- `/src/screens` — main screens (e.g., HomeScreen)  
- `/src/components` — reusable components (summary card, session card, suggestion card)  
- `/src/services` — API communication (Axios)  
- `/src/utils` — utility functions like `isWithinAvailability` and `hasSessionConflict`  
- `/src/types` — TypeScript type definitions (Session, Availability, etc.)

### Server (`/server`)
- `/routes` — REST endpoints (sessions, availability, session-types)  
- `/controllers` — business logic  
- `/models` — database schemas  
- `/utils` — utilities for validation, conflict detection, etc.

## Data Flow
1. The client loads on startup and requests sessions and availability via the API.  
2. The backend returns raw data; the client calculates today's sessions, completed sessions, and suggestions.  
3. For generating suggestions:
   - Filter historical sessions completed on the same day of the week (e.g., Monday).  
   - Check if sessions fit within availability blocks.  
   - Simulate inserting this type of session for the current day to detect conflicts — discard if conflicts exist.  
   - Sort by frequency, recency, and availability, returning top N suggestions to the client.  
4. When a user accepts a suggestion: the client sends `POST /sessions?action=INSERT`, the backend validates the time, conflicts, and availability, persists it, and the client reloads data.

## Key Architectural Decisions
- `SectionList` with `stickySectionHeaders` is used to group sections (“Summary”, “Suggestions”, “Today’s Sessions”).  
- Separation of concerns: API services, business utilities, TypeScript types.  
- Device identification via `macDevice` is minimalistic.  
- Validation occurs both on the frontend (UX) and backend (security).  
- Suggestions are calculated on the client but can be moved to backend for scalability.

## Security & Best Practices
- Do not send sensitive identifiers like `macDevice` in URL in production; use Authorization headers or tokens.  
- Time, conflict, and availability validations must occur on the backend.  
- Use HTTPS in production with short request timeouts.  
- Handle and log network errors properly.