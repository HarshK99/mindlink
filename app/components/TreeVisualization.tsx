import React, { useState, useEffect, useRef } from 'react'

interface Node {
  id: string
  content: string
  children: Node[]
  level: number
}

interface TreeVisualizationProps {
  nodes: Node[]
  thought: { id: string, title: string } | null
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (id: string) => void
  editingNode: string | null
  editContent: string
  onEditChange: (content: string) => void
  onSaveEdit: (id: string) => void
  onCancelEdit: () => void
  addingToNode: string | null
  newNodeContent: string
  onNewNodeChange: (content: string) => void
  onAddNode: (parentId: string) => void
  onCancelAdd: () => void
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  nodes,
  thought,
  onEdit,
  onDelete,
  onAdd,
  editingNode,
  editContent,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  addingToNode,
  newNodeContent,
  onNewNodeChange,
  onAddNode,
  onCancelAdd
}) => {
  const [windowWidth, setWindowWidth] = useState(0)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNodeClick = (nodeId: string) => {
    if (selectedNode === nodeId) {
      // If already selected, deselect
      setSelectedNode(null)
    } else {
      // Select the node to show actions
      setSelectedNode(nodeId)
    }
  }

  const handleEditClick = (nodeId: string) => {
    onEdit(nodeId)
    setSelectedNode(null) // Deselect after action
  }

  const handleDeleteClick = (nodeId: string) => {
    setShowDeleteConfirm(nodeId)
    setSelectedNode(null) // Deselect after action
  }

  const handleDeleteConfirm = (nodeId: string) => {
    onDelete(nodeId)
    setShowDeleteConfirm(null)
  }

  const isMobile = windowWidth < 768

  const calculatePositions = () => {
    if (!nodes.length && !thought) return { positions: {}, connections: [], allNodes: [] }

    const positions: { [key: string]: { x: number, y: number } } = {}
    const connections: { from: string, to: string }[] = []

    // Group nodes by level (API levels match display levels: 1 = root reasons, 2+ = child reasons)
    const levels: { [key: number]: Node[] } = {}

    // Add thought node at level 0
    if (thought) {
      levels[0] = [{ id: thought.id, content: thought.title, children: [], level: 0 }]
    }

    // Flatten all nodes for easier lookup
    const allNodes: Node[] = []
    const processNode = (node: Node) => {
      allNodes.push(node)
      if (!levels[node.level]) levels[node.level] = []
      levels[node.level].push(node)
      node.children.forEach(child => {
        connections.push({ from: node.id, to: child.id })
        processNode(child)
      })
    }

    // Process all nodes
    nodes.forEach(node => processNode(node))

    // Connect thought to level 1 nodes (root reasons)
    const level1Nodes = levels[1] || []
    level1Nodes.forEach(node => {
      if (thought) {
        connections.push({ from: thought.id, to: node.id })
      }
    })

    // Calculate positions
    const levelHeight = isMobile ? 120 : 140
    const nodeWidth = isMobile ? 180 : 200
    const nodeSpacing = isMobile ? 20 : 40

    Object.keys(levels).forEach(levelStr => {
      const level = parseInt(levelStr)
      const levelNodes = levels[level]
      const totalWidth = levelNodes.length * nodeWidth + (levelNodes.length - 1) * nodeSpacing
      const startX = Math.max(0, (windowWidth - totalWidth) / 2)

      levelNodes.forEach((node, index) => {
        const x = startX + index * (nodeWidth + nodeSpacing) + nodeWidth / 2
        const y = level * levelHeight + 60
        positions[node.id] = { x, y }
      })
    })

    return { positions, connections, allNodes }
  }

  const { positions, connections, allNodes } = calculatePositions()

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: '600px', overflow: 'auto' }}>
      {/* SVG for connections */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, width: '100%', height: '100%' }}>
        {connections.map((conn, i) => {
          const fromPos = (positions as any)[conn.from]
          const toPos = (positions as any)[conn.to]

          if (!fromPos || !toPos) return null

          const midY = (fromPos.y + toPos.y) / 2

          return (
            <path
              key={i}
              d={`M ${fromPos.x} ${fromPos.y} Q ${fromPos.x} ${midY} ${toPos.x} ${toPos.y}`}
              stroke="#6B7280"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          )
        })}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
          </marker>
        </defs>
      </svg>

      {/* Nodes */}
      {Object.entries(positions).map(([nodeId, pos]) => {
        const node = allNodes.find(n => n.id === nodeId)
        const isThoughtNode = thought && nodeId === thought.id
        const displayNode = isThoughtNode ? { id: thought.id, content: thought.title } : node

        if (!displayNode) return null

        const isAdding = addingToNode === nodeId
        const nodeHeight = isAdding ? (isMobile ? 140 : 160) : (isMobile ? 80 : 100)

        return (
          <div
            key={nodeId}
            className="absolute bg-white border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            style={{
              left: pos.x - (isMobile ? 90 : 100),
              top: pos.y - (nodeHeight / 2),
              width: isMobile ? 180 : 200,
              minHeight: nodeHeight,
              zIndex: 2
            }}
          >
            <div className={`p-${isMobile ? 2 : 3} text-center`}>
              {editingNode === nodeId ? (
                <div className="flex flex-col gap-1">
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} italic text-gray-500`}>Editing...</span>
                </div>
              ) : isThoughtNode ? (
                <span className={`font-bold text-lg ${isMobile ? 'text-base' : 'text-lg'}`}>{displayNode.content}</span>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span
                    onClick={() => handleNodeClick(nodeId)}
                    className={`${isMobile ? 'text-sm' : 'text-base'} cursor-pointer select-none ${
                      selectedNode === nodeId ? 'bg-blue-50 border border-blue-200 rounded px-2 py-1' : ''
                    }`}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  >
                    {displayNode.content}
                  </span>
                  
                  {selectedNode === nodeId && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditClick(nodeId)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(nodeId)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isThoughtNode ? (
                <div className={`flex justify-center mt-${isMobile ? 1 : 2}`}>
                  <button
                    onClick={() => onAdd(nodeId)}
                    className={`rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 border-2 border-blue-600 font-bold ${
                      isMobile ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-lg'
                    }`}
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className={`flex justify-center mt-${isMobile ? 1 : 2}`}>
                  <button
                    onClick={() => onAdd(nodeId)}
                    className={`rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 border-2 border-blue-600 font-bold ${
                      isMobile ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-lg'
                    }`}
                  >
                    +
                  </button>
                </div>
              )}

              {isAdding && (
                <div className="flex flex-col gap-1">
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} italic text-gray-500`}>Adding...</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Node</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this node? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingNode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-3 text-center">Edit Node</h3>
            <textarea
              value={editContent}
              onChange={(e) => onEditChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter node content..."
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onCancelEdit()}
                className="flex-1 py-3 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => onSaveEdit(editingNode)}
                className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      {addingToNode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-3 text-center">Add New Node</h3>
            <textarea
              value={newNodeContent}
              onChange={(e) => onNewNodeChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Enter new node content..."
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onCancelAdd()}
                className="flex-1 py-3 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => onAddNode(addingToNode)}
                className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
              >
                Add Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TreeVisualization