import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { rows } = await pool.query(
      'SELECT * FROM thoughts WHERE id = $1',
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Thought not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch thought' }, { status: 500 })
  }
}