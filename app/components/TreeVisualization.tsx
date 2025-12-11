import React, { useState, useEffect } from 'react'
import Tree from 'react-d3-tree'

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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 768
  const transformData = (nodes: Node[]): any[] => {
    if (!thought) return []

    const roots = nodes.filter(n => n.level === 0)

    const buildTree = (node: Node): any => ({
      name: node.content,
      id: node.id,
      children: node.children.map(buildTree)
    })

    const root = {
      name: thought.title,
      id: thought.id,
      children: roots.map(buildTree)
    }

    return [root]
  }

  const treeData = transformData(nodes)

  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const isAdding = addingToNode === nodeDatum.id
    const height = isAdding ? (isMobile ? 200 : 250) : (isMobile ? 120 : 150)
    const width = isMobile ? 200 : 250
    const y = -height / 2

    return (
      <foreignObject width={width} height={height} x={-width/2} y={y}>
        <div className="p-2 bg-white border rounded shadow-sm cursor-pointer hover:bg-gray-50 text-center relative" style={{ minWidth: isMobile ? '180px' : '200px' }}>
          {editingNode === nodeDatum.id ? (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={editContent}
                onChange={(e) => onEditChange(e.target.value)}
                className="p-1 border rounded text-sm"
                autoFocus
              />
              <div className="flex gap-1 justify-center">
                <button
                  onClick={() => onSaveEdit(nodeDatum.id)}
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
          ) : thought && nodeDatum.id === thought.id ? (
            <span className="text-sm">{nodeDatum.name}</span>
          ) : (
            <span onClick={() => onEdit(nodeDatum.id)} onContextMenu={(e) => { e.preventDefault(); onDelete(nodeDatum.id) }} className="text-sm">{nodeDatum.name}</span>
          )}
          {(!thought || nodeDatum.id !== thought.id) && (
            <div className="flex justify-center mt-1">
              <button
                onClick={() => onAdd(nodeDatum.id)}
                className={`rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 border-2 border-blue-600 ${isMobile ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-lg'} font-bold`}
              >
                +
              </button>
            </div>
          )}
          {isAdding && (
            <div className="mt-1 p-2 bg-gray-50 border rounded min-w-[180px]">
              <input
                type="text"
                placeholder="New reason..."
                value={newNodeContent}
                onChange={(e) => onNewNodeChange(e.target.value)}
                className="w-full p-1 border rounded mb-1 text-sm"
                autoFocus
              />
              <div className="flex gap-1">
                <button
                  onClick={() => onAddNode(nodeDatum.id)}
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
      </foreignObject>
    )
  }

  return (
    <div style={{ width: '100%', height: isMobile ? '400px' : '500px' }}>
      <Tree
        data={treeData}
        orientation="vertical"
        pathFunc="diagonal"
        renderCustomNodeElement={renderCustomNodeElement}
        translate={isMobile ? { x: windowWidth / 2, y: 50 } : { x: 400, y: 50 }}
        nodeSize={isMobile ? { x: 200, y: 150 } : { x: 250, y: 200 }}
        separation={isMobile ? { siblings: 1, nonSiblings: 1.5 } : { siblings: 1.5, nonSiblings: 2 }}
      />
    </div>
  )
}

export default TreeVisualization