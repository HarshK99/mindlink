import React from 'react'
import Tree from 'react-d3-tree'

interface Node {
  id: string
  content: string
  children: Node[]
  level: number
}

interface TreeVisualizationProps {
  nodes: Node[]
  thought: { id: string, title: string }
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
  const transformData = (nodes: Node[]): any[] => {
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
    const height = isAdding ? 250 : 150
    const y = -height / 2

    return (
      <foreignObject width={250} height={height} x={-125} y={y}>
        <div className="p-3 bg-white border rounded shadow-sm cursor-pointer hover:bg-gray-50 min-w-[200px] text-center relative">
          {editingNode === nodeDatum.id ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => onEditChange(e.target.value)}
                className="p-1 border rounded"
                autoFocus
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => onSaveEdit(nodeDatum.id)}
                  className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => onCancelEdit()}
                  className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : nodeDatum.id === thought.id ? (
            <span>{nodeDatum.name}</span>
          ) : (
            <span onClick={() => onEdit(nodeDatum.id)} onContextMenu={(e) => { e.preventDefault(); onDelete(nodeDatum.id) }}>{nodeDatum.name}</span>
          )}
          <div className="flex justify-center mt-2">
            <button
              onClick={() => onAdd(nodeDatum.id)}
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 text-lg font-bold"
            >
              +
            </button>
          </div>
          {isAdding && (
            <div className="mt-2 p-3 bg-gray-50 border rounded min-w-[200px]">
              <input
                type="text"
                placeholder="New reason..."
                value={newNodeContent}
                onChange={(e) => onNewNodeChange(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onAddNode(nodeDatum.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => onCancelAdd()}
                  className="px-3 py-1 bg-gray-500 text-white rounded"
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
    <div style={{ width: '100%', height: '500px' }}>
      <Tree
        data={treeData}
        orientation="vertical"
        pathFunc="diagonal"
        renderCustomNodeElement={renderCustomNodeElement}
        translate={{ x: 400, y: 50 }}
        nodeSize={{ x: 250, y: 200 }}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
      />
    </div>
  )
}

export default TreeVisualization