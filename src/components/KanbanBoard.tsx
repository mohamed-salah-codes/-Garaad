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

export function KanbanBoard({ columns, onColumnsChange }: KanbanBoardProps) {

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

    // Add task to destination
    destColumn.tasks.splice(destination.index, 0, movedTask)

    onColumnsChange?.(newColumns)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board-container">
        {columns.map((column) => (
          <div key={column.id} className="kanban-column">
            {/* Column Header */}
            <div
              className={`kanban-column-header ${COLUMN_HEADER_CLASS_MAP[column.name] || ''}`}
            >
              <div className="kanban-column-header-title">{column.name}</div>
              <div className="kanban-column-header-count">
                {column.tasks.length}
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
                              } ${snapshot.isDragging ? 'dragged' : ''}`}
                            >
                              <div className="kanban-task-header">
                                <div
                                  className={`kanban-task-dot ${
                                    COLUMN_DOT_CLASS_MAP[column.name] || 'new-task'
                                  }`}
                                ></div>
                                <div className="kanban-task-title">
                                  {task.title}
                                </div>
                              </div>
                              {task.description && (
                                <div className="kanban-task-description">
                                  {task.description}
                                </div>
                              )}
                              <div className="kanban-task-label">
                                {task.label}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}

export default KanbanBoard
