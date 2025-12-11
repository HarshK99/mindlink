'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Node {
  id: string
  content: string
  children: Node[]
}

interface Thought {
  id: string
  title: string
  description: string
}

export default function ThoughtPage() {
  const params = useParams()
  const thoughtId = params.id as string
  const [thought, setThought] = useState<Thought | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [addingToNode, setAddingToNode] = useState<string | null>(null)
  const [newNodeContent, setNewNodeContent] = useState('')

  useEffect(() => {
    fetchThought()
    fetchNodes()
  }, [thoughtId])

  const fetchThought = async () => {
    // For now, just set a placeholder, or fetch from API if we add GET /api/thoughts/[id]
    setThought({ id: thoughtId, title: 'Sample Thought', description: 'Description' })
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
    if (!confirm('Delete this node and all its children?')) return

    try {
      const res = await fetch(`/api/nodes/${nodeId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchNodes()
      }
    } catch (error) {
      console.error('Failed to delete node:', error)
    }
  }

  const renderNode = (node: Node, level = 0) => (
    <div key={node.id} className={`ml-${level * 4} mb-4`}>
      <div className="flex items-center gap-2 p-3 bg-white border rounded shadow-sm">
        {editingNode === node.id ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 p-1 border rounded"
              autoFocus
            />
            <button
              onClick={() => updateNode(node.id)}
              className="px-2 py-1 bg-green-500 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setEditingNode(null)}
              className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1">{node.content}</span>
            <button
              onClick={() => {
                setEditingNode(node.id)
                setEditContent(node.content)
              }}
              className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => deleteNode(node.id)}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm"
            >
              Delete
            </button>
            <button
              onClick={() => setAddingToNode(node.id)}
              className="px-2 py-1 bg-purple-500 text-white rounded text-sm"
            >
              Add Child
            </button>
          </>
        )}
      </div>

      {addingToNode === node.id && (
        <div className="ml-4 mt-2 p-3 bg-gray-50 border rounded">
          <input
            type="text"
            placeholder="New reason..."
            value={newNodeContent}
            onChange={(e) => setNewNodeContent(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => addNode(node.id)}
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

      {node.children.map((child) => renderNode(child, level + 1))}
    </div>
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
            <p className="text-gray-600">{thought.description}</p>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setAddingToNode('root')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Root Reason
          </button>
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
          {nodes.map((node) => renderNode(node))}
        </div>
      </div>
    </div>
  )
}