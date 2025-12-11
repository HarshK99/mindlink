'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import TreeVisualization from '../../components/TreeVisualization'

interface Node {
  id: string
  content: string
  children: Node[]
  level: number
}

interface Thought {
  id: string
  title: string
  description?: string
  createdat: string
}

export default function ThoughtPage() {
  const params = useParams()
  const thoughtId = params.id as string
  const [thought, setThought] = useState<{ id: string, title: string } | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [longPressNode, setLongPressNode] = useState<string | null>(null)
  const [addingToNode, setAddingToNode] = useState<string | null>(null)
  const [newNodeContent, setNewNodeContent] = useState('')

  useEffect(() => {
    fetchData()
  }, [thoughtId])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/thoughts/${thoughtId}/nodes`)
      if (res.ok) {
        const data = await res.json()
        setThought(data.thought)
        setNodes(data.nodes)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addNode = async (parentId: string | null) => {
    if (!newNodeContent.trim()) return

    try {
      const res = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thought_id: thoughtId,
          parent_id: parentId === thought?.id ? null : parentId,
          content: newNodeContent
        })
      })
      if (res.ok) {
        setNewNodeContent('')
        setAddingToNode(null)
        fetchData()
      }
    } catch (error) {
      console.error('Failed to add node:', error)
    }
  }

  const updateNode = async (nodeId: string) => {
    if (!editContent.trim()) return

    try {
      const res = await fetch(`/api/nodes/${nodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      })
      if (res.ok) {
        setEditingNode(null)
        setEditContent('')
        fetchData()
      }
    } catch (error) {
      console.error('Failed to update node:', error)
    }
  }

  const deleteNode = async (nodeId: string) => {
    try {
      const res = await fetch(`/api/nodes/${nodeId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to delete node:', error)
    }
  }

  const handleEdit = (id: string) => {
    const node = nodes.find(n => n.id === id)
    if (node) {
      setEditingNode(id)
      setEditContent(node.content)
    }
  }

  const handleMouseDown = (nodeId: string) => {
    setLongPressTimer(setTimeout(() => {
      setLongPressNode(nodeId)
      if (confirm('Delete this node and all its children?')) {
        deleteNode(nodeId)
      }
    }, 1000)) // 1 second long press
  }

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleClick = (nodeId: string) => {
    if (!longPressNode) {
      setEditingNode(nodeId)
      setEditContent(nodes.find(n => n.id === nodeId)?.content || '')
    }
    setLongPressNode(null)
  }

  const renderTree = () => (
    <TreeVisualization
      nodes={nodes}
      thought={thought}
      onEdit={handleEdit}
      onDelete={deleteNode}
      onAdd={setAddingToNode}
      editingNode={editingNode}
      editContent={editContent}
      onEditChange={setEditContent}
      onSaveEdit={updateNode}
      onCancelEdit={() => setEditingNode(null)}
      addingToNode={addingToNode}
      newNodeContent={newNodeContent}
      onNewNodeChange={setNewNodeContent}
      onAddNode={addNode}
      onCancelAdd={() => { setAddingToNode(null); setNewNodeContent('') }}
    />
  )

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Thoughts
        </Link>

        <div className="space-y-2">
          {renderTree()}
        </div>
      </div>
    </div>
  )
}