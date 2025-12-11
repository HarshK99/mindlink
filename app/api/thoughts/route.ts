import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Hardcoded user ID for MVP (UUID)
const USER_ID = '550e8400-e29b-41d4-a716-446655440000'

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM thoughts WHERE user_id = $1 ORDER BY "createdAt" DESC',
      [USER_ID]
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch thoughts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const { rows } = await pool.query(
      'INSERT INTO thoughts (user_id, title, description, "createdAt") VALUES ($1, $2, $3, $4) RETURNING *',
      [USER_ID, title, description, new Date().toISOString()]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create thought' }, { status: 500 })
  }
}