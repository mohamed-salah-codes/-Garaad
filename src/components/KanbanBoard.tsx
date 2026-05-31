import { useState } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import './KanbanBoard.css'

export type KanbanTask = {
  id: string
  title: string
  label: string
  description?: string
  estimatedHours?: number
  actualHours?: number
  completedAt?: string
  assigneeAvatar?: string
  commentCount?: number
}

export type KanbanColumn = {
  id: string
  name: string
  tasks: KanbanTask[]
}

export type KanbanColumnLegacy = {
  id: string
  name: string
  color: string
  tasks: KanbanTask[]
}

export type KanbanBoardProps = {
  columns: KanbanColumnLegacy[]
  onColumnsChange?: (columns: KanbanColumnLegacy[]) => void
  onCreateTask?: () => void
  onInlineCreateTask?: (title: string, estimated: string, type: string, status: string) => void
  onTaskDropToCompleted?: (task: KanbanTask, pendingColumns: KanbanColumnLegacy[]) => void
  onTaskClick?: (task: KanbanTask) => void
}

const COLUMN_HEADER_CLASS_MAP: Record<string, string> = {
  'New Task': 'kanban-column-header-new-task',
  'Scheduled': 'kanban-column-header-scheduled',
  'In Progress': 'kanban-column-header-in-progress',
  'Completed': 'kanban-column-header-completed',
}

const COLUMN_DOT_CLASS_MAP: Record<string, string> = {
  'New Task': 'new-task',
  'Scheduled': 'scheduled',
  'In Progress': 'in-progress',
  'Completed': 'completed',
}

export function KanbanBoard({ columns, onColumnsChange, onCreateTask, onInlineCreateTask, onTaskDropToCompleted, onTaskClick }: KanbanBoardProps) {
  const [inlineCreateColumnId, setInlineCreateColumnId] = useState<string | null>(null)
  const [inlineTaskTitle, setInlineTaskTitle] = useState('')
  const [inlineTaskEstimated, setInlineTaskEstimated] = useState('')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [selectedType, setSelectedType] = useState('Operational')
  const [showEditTypesModal, setShowEditTypesModal] = useState(false)
  
  const [projectTypes] = useState([
    { name: 'Operational', color: '#115e59' },
    { name: 'Health', color: '#2563eb' },
    { name: 'Home and family', color: '#0d9488' },
    { name: 'Finance', color: '#4338ca' },
    { name: 'Learning', color: '#9d174d' },
    { name: 'Planning', color: '#16a34a' },
    { name: 'Strategic', color: '#064e3b' },
    { name: 'Technical', color: '#78350f' },
  ])

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // If dropped outside a droppable area
    if (!destination) {
      return
    }

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    // Update columns state
    const newColumns = Array.from(columns)
    const sourceColumn = newColumns.find((col) => col.id === source.droppableId)
    const destColumn = newColumns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    // Get the task being moved
    const [movedTask] = sourceColumn.tasks.splice(source.index, 1)

    // If dropped into Completed — intercept and ask for time tracking
    if (destColumn.name === 'Completed' && onTaskDropToCompleted) {
      // Add to destination in the pending copy, but don't commit yet
      destColumn.tasks.splice(destination.index, 0, movedTask)
      onTaskDropToCompleted(movedTask, newColumns)
      return
    }

    // Add task to destination normally
    destColumn.tasks.splice(destination.index, 0, movedTask)

    onColumnsChange?.(newColumns)
  }

  return (
    <div className="kanban-board-wrapper">
      <div className="kanban-board-actions">
        <div className="kanban-board-title">Workflow board</div>
        {onCreateTask ? (
          <button type="button" className="ghost-button kanban-create-button" onClick={onCreateTask}>
            + Create task
          </button>
        ) : null}
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board-container">
          {columns.map((column) => (
          <div key={column.id} className="kanban-column">
            {/* Column Header */}
            <div
              className={`kanban-column-header ${COLUMN_HEADER_CLASS_MAP[column.name] || ''}`}
            >
              <div className="kanban-column-header-title">{column.name}</div>
              <div className="kanban-column-header-meta">
                <div className="kanban-column-header-count">
                  {column.tasks.length}
                </div>
              </div>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`kanban-droppable ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  {column.tasks.length === 0 ? (
                    <div className="kanban-empty-state">
                      <div className="kanban-empty-message">
                        <div className="kanban-empty-icon">+</div>
                        <div className="kanban-empty-text">No tasks</div>
                        <div className="kanban-empty-hint">Drag tasks here</div>
                      </div>
                    </div>
                  ) : (
                    <div className="kanban-tasks-list">
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-task ${
                                snapshot.isDragging ? 'dragging' : ''
                              } ${snapshot.isDragging ? 'dragged' : ''} task-status-${column.name.toLowerCase().replace(' ', '-')}`}
                              onClick={() => !snapshot.isDragging && onTaskClick?.(task)}
                            >
                              <div className="kanban-task-header">
                                <div
                                  className={`kanban-task-dot ${
                                    COLUMN_DOT_CLASS_MAP[column.name] || 'new-task'
                                  }`}
                                ></div>
                                {task.assigneeAvatar && (
                                  <div className="kanban-task-avatar">
                                    {task.assigneeAvatar.length <= 2 ? task.assigneeAvatar : <img src={task.assigneeAvatar} alt="" />}
                                  </div>
                                )}
                                <div className="kanban-task-title">
                                  {task.title}
                                </div>
                              </div>
                              <div className="kanban-task-body">
                                {task.description && (
                                  <div className="kanban-task-description">
                                    {task.description}
                                  </div>
                                )}
                              </div>
                              <div className="kanban-task-footer">
                                <div className="kanban-task-label">
                                  {task.label}
                                </div>
                                {(task.estimatedHours !== undefined) && (
                                  <div className="kanban-task-metrics">
                                    {task.actualHours !== undefined ? (
                                      <span>{task.actualHours}h / {task.estimatedHours}h</span>
                                    ) : (
                                      <span>{task.estimatedHours}h</span>
                                    )}
                                  </div>
                                )}
                                {(task.commentCount !== undefined && task.commentCount > 0) && (
                                  <div className="kanban-task-metrics" style={{ marginLeft: '6px' }}>
                                    <span>💬 {task.commentCount}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                  {provided.placeholder}
                  {column.name === 'New Task' && onCreateTask ? (
                    inlineCreateColumnId === column.id ? (
                      <div className="kanban-inline-create-card">
                        <button className="kanban-inline-close" onClick={() => setInlineCreateColumnId(null)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                            <path d="M6 6 L18 18 M18 6 L6 18" />
                          </svg>
                        </button>
                        <input 
                          className="kanban-inline-input text-large" 
                          placeholder="Task name (type/ for options)" 
                          autoFocus 
                          value={inlineTaskTitle}
                          onChange={e => setInlineTaskTitle(e.target.value)}
                        />
                        <input 
                          className="kanban-inline-input text-medium" 
                          placeholder="Estimted time : hh:mm" 
                          value={inlineTaskEstimated}
                          onChange={e => setInlineTaskEstimated(e.target.value)}
                        />
                        <div className="kanban-inline-actions">
                          <div className="kanban-inline-icons">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                              <circle cx="8" cy="15" r="1.5" fill="black" stroke="none" />
                              <circle cx="12" cy="15" r="1.5" fill="black" stroke="none" />
                              <circle cx="16" cy="15" r="1.5" fill="black" stroke="none" />
                            </svg>
                            <div style={{ position: 'relative' }}>
                              <button 
                                type="button" 
                                className="type-dropdown-trigger" 
                                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                              >
                                <div className="type-color-box" style={{ backgroundColor: projectTypes.find(t => t.name === selectedType)?.color || '#16a34a' }}></div>
                              </button>
                              {showTypeDropdown && (
                                <div className="type-dropdown-menu">
                                  {projectTypes.map(type => (
                                    <button 
                                      type="button"
                                      key={type.name} 
                                      className={`type-dropdown-item ${selectedType === type.name ? 'selected' : ''}`}
                                      onClick={() => {
                                        setSelectedType(type.name)
                                        setShowTypeDropdown(false)
                                      }}
                                    >
                                      <div className="type-color-box" style={{ backgroundColor: type.color }}></div>
                                      <span>{type.name}</span>
                                    </button>
                                  ))}
                                  <div className="type-dropdown-divider"></div>
                                  <button 
                                    type="button" 
                                    className="type-dropdown-item edit-types"
                                    onClick={() => {
                                      setShowTypeDropdown(false)
                                      setShowEditTypesModal(true)
                                    }}
                                  >
                                    <svg className="icon-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                                    </svg>
                                    <span>Edit types</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <button className="kanban-inline-save" onClick={() => {
                            if (onInlineCreateTask) {
                              onInlineCreateTask(inlineTaskTitle, inlineTaskEstimated, selectedType, column.name);
                            } else if (onCreateTask) {
                              onCreateTask();
                            }
                            setInlineCreateColumnId(null);
                          }}>save</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="kanban-column-create-task-inline"
                        onClick={() => {
                          setInlineCreateColumnId(column.id);
                          setInlineTaskTitle('');
                          setInlineTaskEstimated('');
                          setSelectedType('Operational');
                        }}
                      >
                        + Create task
                      </button>
                    )
                  ) : null}
                </div>
              )}
            </Droppable>
          </div>
        ))}
        </div>
      </DragDropContext>
      {showEditTypesModal && (
        <div className="modal-overlay" onClick={() => setShowEditTypesModal(false)}>
          <div className="task-types-modal" onClick={e => e.stopPropagation()}>
            <div className="task-types-header">
              <h2 className="task-types-title">Task types</h2>
            </div>
            <div className="task-types-body">
              <div className="task-types-chips">
                {projectTypes.map(type => (
                  <div key={type.name} className="task-type-chip">
                    <div className="type-color-box" style={{ backgroundColor: type.color }}></div>
                    <span>{type.name}</span>
                  </div>
                ))}
              </div>
              <button className="task-types-edit-btn">Edit types</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KanbanBoard
