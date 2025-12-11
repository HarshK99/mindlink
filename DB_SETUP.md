# Mindlink Backend Setup with Neon

## Database Setup
1. Create a Neon account at [neon.tech](https://neon.tech).
2. Create a new project and database.
3. Copy the connection string from the Neon dashboard (it looks like `postgresql://user:pass@host/db?sslmode=require`).
4. Update `.env.local`:
   ```
   DATABASE_URL=your_neon_connection_string_here
   ```

## Database Schema
Run the SQL in `db_setup.sql` in your Neon database (via the SQL editor in the dashboard or a tool like pgAdmin).

This creates the tables with UUID primary keys and inserts sample data.

**Note**: IDs are UUIDs for uniqueness. New inserts will auto-generate UUIDs.

## Running the App
- `npm run dev` to start the Next.js server.
- APIs are available at:
  - GET/POST `/api/thoughts` (list/create thoughts for user "550e8400-e29b-41d4-a716-446655440000")
  - POST `/api/nodes` (create node)
  - PUT/DELETE `/api/nodes/[id]` (update/delete node)
  - GET `/api/thoughts/[id]/nodes` (get nodes as tree)

## Notes
- User ID is hardcoded to a UUID for MVP.
- Tree structure is built client-side from flat node data.
- Cascading delete is handled recursively in code.