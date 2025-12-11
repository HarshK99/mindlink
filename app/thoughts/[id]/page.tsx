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
  const [thought, setThought] = useState<Thought | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [longPressNode, setLongPressNode] = useState<string | null>(null)
  const [addingToNode, setAddingToNode] = useState<string | null>(null)
  const [newNodeContent, setNewNodeContent] = useState('')

  useEffect(() => {
    fetchThought()
    fetchNodes()
  }, [thoughtId])

  const fetchThought = async () => {
    try {
      const res = await fetch(`/api/thoughts/${thoughtId}`)
      if (res.ok) {
        const data = await res.json()
        setThought(data)
      }
    } catch (error) {
      console.error('Failed to fetch thought:', error)
    }
  }

  const fetchNodes = async () => {
    try {
      const res = await fetch(`/api/thoughts/${thoughtId}/nodes`)
      if (res.ok) {
        const data = await res.json()
        setNodes(data)
      }
    } catch (error) {
      console.error('Failed to fetch nodes:', error)
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
          parent_id: parentId,
          content: newNodeContent
        })
      })
      if (res.ok) {
        setNewNodeContent('')
        setAddingToNode(null)
        fetchNodes()
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
        fetchNodes()
      }
    } catch (error) {
      console.error('Failed to update node:', error)
    }
  }

  const deleteNode = async (nodeId: string) => {
    try {
      const res = await fetch(`/api/nodes/${nodeId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchNodes()
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
      thought={thought!}
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

        {thought && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <h1 className="text-3xl font-bold mb-2">{thought.title}</h1>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setAddingToNode('root')}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            +
          </button>
          <span className="ml-2 text-sm text-gray-600">Add root reason</span>
        </div>

        {addingToNode === 'root' && (
          <div className="mb-6 p-4 bg-gray-50 border rounded">
            <input
              type="text"
              placeholder="New root reason..."
              value={newNodeContent}
              onChange={(e) => setNewNodeContent(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => addNode(null)}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAddingToNode(null)
                  setNewNodeContent('')
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {renderTree()}
        </div>
      </div>
    </div>
  )
}