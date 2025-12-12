import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

interface Node {
  id: string
  thought_id: string
  parent_id: string | null
  content: string
  order: number
  level: number
  children?: Node[]
}

function buildTree(nodes: Node[]): Node[] {
  const nodeMap = new Map<string, Node>()
  const roots: Node[] = []

  // Create map and add children array
  nodes.forEach(node => {
    node.children = []
    nodeMap.set(node.id, node)
  })

  // Build tree
  nodes.forEach(node => {
    if (node.parent_id) {
      const parent = nodeMap.get(node.parent_id)
      if (parent) {
        parent.children!.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  // Recalculate levels based on tree structure
  const recalculateLevels = (node: Node, level: number) => {
    node.level = level
    node.children!.forEach(child => recalculateLevels(child, level + 1))
  }
  roots.forEach(root => recalculateLevels(root, 1)) // Root reasons start at level 1

  // Sort children by order
  const sortChildren = (node: Node) => {
    node.children!.sort((a, b) => a.order - b.order)
    node.children!.forEach(sortChildren)
  }
  roots.forEach(sortChildren)

  return roots
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Fetch thought
    const thoughtResult = await pool.query(
      'SELECT id, title FROM thoughts WHERE id = $1',
      [id]
    )
    
    if (thoughtResult.rows.length === 0) {
      return NextResponse.json({ error: 'Thought not found' }, { status: 404 })
    }
    
    const thought = thoughtResult.rows[0]
    
    // Fetch nodes
    const { rows } = await pool.query(
      'SELECT * FROM nodes WHERE thought_id = $1 ORDER BY "order" ASC',
      [id]
    )

    const tree = buildTree(rows)
    return NextResponse.json({ thought, nodes: tree })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}