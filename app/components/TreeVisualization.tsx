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
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => onEditChange(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => onSaveEdit(nodeId)}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => onCancelEdit()}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : isThoughtNode ? (
                <span className={`font-bold text-lg ${isMobile ? 'text-base' : 'text-lg'}`}>{displayNode.content}</span>
              ) : (
                <span
                  onClick={() => onEdit(nodeId)}
                  onContextMenu={(e) => { e.preventDefault(); onDelete(nodeId) }}
                  className={`${isMobile ? 'text-sm' : 'text-base'}`}
                >
                  {displayNode.content}
                </span>
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
                <div className={`mt-${isMobile ? 1 : 2} p-${isMobile ? 2 : 3} bg-gray-50 border rounded`}>
                  <input
                    type="text"
                    placeholder="New reason..."
                    value={newNodeContent}
                    onChange={(e) => onNewNodeChange(e.target.value)}
                    className="w-full border rounded px-2 py-1 mb-1 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => onAddNode(nodeId)}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => onCancelAdd()}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TreeVisualization