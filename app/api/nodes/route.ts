import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { thought_id, parent_id, content, order } = await request.json()

    if (!thought_id || !content) {
      return NextResponse.json({ error: 'thought_id and content are required' }, { status: 400 })
    }

    let level = 1 // Root reasons start at level 1
    if (parent_id) {
      const { rows } = await pool.query(
        'SELECT level FROM nodes WHERE id = $1',
        [parent_id]
      )
      if (rows.length > 0) {
        level = rows[0].level + 1
      }
    }

    const { rows } = await pool.query(
      'INSERT INTO nodes (thought_id, parent_id, content, "order", level) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [thought_id, parent_id || null, content, order || 0, level]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 })
  }
}