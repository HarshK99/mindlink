import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

async function getDescendants(nodeId: string): Promise<string[]> {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM nodes WHERE parent_id = $1',
      [nodeId]
    )
    let descendants: string[] = rows.map((row: any) => row.id)
    for (const child of rows) {
      descendants = descendants.concat(await getDescendants(child.id))
    }
    return descendants
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const { rows } = await pool.query(
      'UPDATE nodes SET content = $1 WHERE id = $2 RETURNING *',
      [content, id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update node' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const descendants = await getDescendants(id)
    const idsToDelete = [id, ...descendants]

    await pool.query(
      'DELETE FROM nodes WHERE id = ANY($1)',
      [idsToDelete]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 })
  }
}