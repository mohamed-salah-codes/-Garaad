import { useMemo, useState } from 'react'

type PageKey =
  | 'dashboard'
  | 'calendar'
  | 'projects'
  | 'notes'
  | 'settings'
  | 'connected'
  | 'requests'

type NoteItem = {
  id: string
  title: string
  category: string
  content: string
  project: string
  updated: string
}

type Subtask = {
  id: string
  title: string
  done: boolean
}

type TaskItem = {
  id: string
  title: string
  status: 'New Task' | 'Scheduled' | 'In Progress' | 'Completed'
  type: string
  due: string
  owner: string
  progress: number
  tags: string[]
  description: string
  schedule: string
  estimated: string
  priority: 'None' | 'Critical' | 'High' | 'Medium' | 'Low' | 'Lowest'
  assignee: string
  assigneeAvatar: string
  subtasks: Subtask[]
}

const sidebarItems: Array<{ key: PageKey; label: string; icon: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home' },
  { key: 'calendar', label: 'Calendar Planner', icon: 'calendar' },
  { key: 'projects', label: 'Projects', icon: 'grid' },
  { key: 'notes', label: 'Notes', icon: 'note' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]

const notesSeed: NoteItem[] = [
  {
    id: 'n1',
    title: 'Sprint planning briefing',
    category: 'Planning',
    content: 'Summarize next sprint goals and backlog priorities.',
    project: 'Garaad Redesign',
    updated: 'Today, 09:18',
  },
  {
    id: 'n2',
    title: 'Client sync notes',
    category: 'Meeting',
    content: 'Review calendar integration and approval workflow.',
    project: 'Calendar Launch',
    updated: 'Yesterday, 17:42',
  },
  {
    id: 'n3',
    title: 'Design tokens checklist',
    category: 'UI',
    content: 'Verify palette, spacing, and responsive mobile rules.',
    project: 'Design System',
    updated: 'May 25',
  },
]

const initialTasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Refine weekly schedule layout',
    status: 'In Progress',
    type: 'Design',
    due: 'May 30',
    owner: 'Amina',
    progress: 65,
    tags: ['UX', 'Mobile'],
    description: 'Build a responsive weekly planner card that matches the updated Bordio style.',
    schedule: 'Today',
    estimated: '3h',
    priority: 'High',
    assignee: 'Amina',
    assigneeAvatar: 'A',
    subtasks: [
      { id: 's1', title: 'Layout header', done: true },
      { id: 's2', title: 'Style cards', done: false },
    ],
  },
  {
    id: 't2',
    title: 'Publish notes workspace',
    status: 'New Task',
    type: 'Docs',
    due: 'Jun 2',
    owner: 'Samir',
    progress: 20,
    tags: ['Notes'],
    description: 'Create the notes editor layout with categories, tags, and search.',
    schedule: 'Tomorrow',
    estimated: '4h',
    priority: 'Medium',
    assignee: 'Samir',
    assigneeAvatar: 'S',
    subtasks: [
      { id: 's3', title: 'Add search', done: false },
    ],
  },
  {
    id: 't3',
    title: 'Review Google Calendar flow',
    status: 'Scheduled',
    type: 'Integration',
    due: 'May 29',
    owner: 'Lina',
    progress: 80,
    tags: ['Sync'],
    description: 'Validate the Google Calendar integration UI and sync logic.',
    schedule: 'Today',
    estimated: '2h',
    priority: 'High',
    assignee: 'Lina',
    assigneeAvatar: 'L',
    subtasks: [
      { id: 's4', title: 'Review event mapping', done: true },
      { id: 's5', title: 'Test recurring tasks', done: false },
    ],
  },
  {
    id: 't4',
    title: 'Finalize project metrics board',
    status: 'Completed',
    type: 'Analytics',
    due: 'May 27',
    owner: 'Omar',
    progress: 100,
    tags: ['Reporting'],
    description: 'Finalize the project progress board and display completed items.',
    schedule: 'Yesterday',
    estimated: '1h',
    priority: 'Low',
    assignee: 'Omar',
    assigneeAvatar: 'O',
    subtasks: [
      { id: 's6', title: 'Confirm metrics', done: true },
      { id: 's7', title: 'Publish board', done: true },
    ],
  },
]

const connectedApps = [
  { name: 'Google Calendar', description: 'Sync meetings and planner timelines.', enabled: true },
  { name: 'Slack', description: 'Receive team notifications and updates.', enabled: false },
  { name: 'Trello', description: 'Sync project boards and status cards.', enabled: true },
  { name: 'Notion', description: 'Link notes and docs to workspace projects.', enabled: false },
]

const requests = [
  { id: 'r1', title: 'New calendar integration', requester: 'Dina H.', status: 'Pending', date: 'Today' },
  { id: 'r2', title: 'Client onboarding update', requester: 'Khaled M.', status: 'Approved', date: 'May 27' },
  { id: 'r3', title: 'Add meeting notes template', requester: 'Sara A.', status: 'Pending', date: 'May 28' },
]

const projectItems = [
  {
    id: 'p1',
    name: 'Garaad Productivity Suite',
    status: 'Active',
    progress: 82,
    team: ['Amina', 'Samir', 'Omar'],
  },
  {
    id: 'p2',
    name: 'Calendar Planner Beta',
    status: 'Active',
    progress: 70,
    team: ['Lina', 'Musa'],
  },
  {
    id: 'p3',
    name: 'Notes Workspace MVP',
    status: 'Completed',
    progress: 100,
    team: ['Khadija'],
  },
]

const kanbanColumns = [
  { name: 'New Task', color: '#c8d9ff', tasks: ['Design planner filter', 'Draft notes categories'] },
  { name: 'Scheduled', color: '#fcdbcf', tasks: ['Sync calendar events', 'Prep meeting agenda'] },
  { name: 'In Progress', color: '#d2f8d2', tasks: ['Build kanban board', 'Write project summary'] },
  { name: 'Completed', color: '#e9d7ff', tasks: ['Launch workspace settings'] },
]

function App() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [calendarMode, setCalendarMode] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly')
  const [projectView, setProjectView] = useState<'Table' | 'Kanban'>('Table')
  const [notes, setNotes] = useState<NoteItem[]>(notesSeed)
  const [selectedNoteId, setSelectedNoteId] = useState(notesSeed[0].id)
  const [noteSearch, setNoteSearch] = useState('')
  const [noteCategory, setNoteCategory] = useState('All')
  const [requestFilter, setRequestFilter] = useState<'All' | 'Pending' | 'Approved'>('All')
  const [requestSearch, setRequestSearch] = useState('')
  const [themeMode, setThemeMode] = useState<'Light' | 'Dark'>('Light')
  const [connected, setConnected] = useState(connectedApps)
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedTaskId, setSelectedTaskId] = useState(initialTasks[0]?.id ?? '')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState<TaskItem['status']>('New Task')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('None')
  const [newTaskSchedule, setNewTaskSchedule] = useState('Today')
  const [newTaskDue, setNewTaskDue] = useState('No due date')
  const [newTaskTags, setNewTaskTags] = useState<string[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [newTaskSubtasks, setNewTaskSubtasks] = useState<Subtask[]>([])

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? notes[0],
    [notes, selectedNoteId],
  )

  const filteredNotes = useMemo(
    () =>
      notes.filter((note) => {
        const matchesCategory = noteCategory === 'All' || note.category === noteCategory
        const matchesSearch = note.title.toLowerCase().includes(noteSearch.toLowerCase())
        return matchesCategory && matchesSearch
      }),
    [notes, noteCategory, noteSearch],
  )

  const statusOptions: TaskItem['status'][] = ['New Task', 'Scheduled', 'In Progress', 'Completed']
  const priorityOptions: TaskItem['priority'][] = ['None', 'Critical', 'High', 'Medium', 'Low', 'Lowest']

  const filteredRequests = useMemo(
    () =>
      requests.filter(
        (item) =>
          (requestFilter === 'All' || item.status === requestFilter) &&
          item.title.toLowerCase().includes(requestSearch.toLowerCase()),
      ),
    [requestFilter, requestSearch],
  )

  const selectedTask = useMemo(() => tasks.find((task) => task.id === selectedTaskId) ?? tasks[0], [tasks, selectedTaskId])

  const handleNoteChange = (value: string) => {
    setNotes((current) =>
      current.map((note) => (note.id === selectedNoteId ? { ...note, content: value } : note)),
    )
  }

  const addNote = () => {
    const newNote: NoteItem = {
      id: `n${Date.now()}`,
      title: 'New note',
      category: 'General',
      content: 'Start writing the note here...',
      project: 'Garaad Productivity Suite',
      updated: 'Just now',
    }
    setNotes((current) => [newNote, ...current])
    setSelectedNoteId(newNote.id)
  }

  const deleteNote = () => {
    setNotes((current) => current.filter((note) => note.id !== selectedNoteId))
    setSelectedNoteId(notes[0]?.id ?? '')
  }

  const addTaskTag = (tag: string) => {
    setNewTaskTags((current) => (current.includes(tag) ? current : [...current, tag]))
  }

  const removeTaskTag = (tag: string) => {
    setNewTaskTags((current) => current.filter((item) => item !== tag))
  }

  const addTaskSubtask = () => {
    if (!newSubtask.trim()) return
    const nextSubtask = { id: `sub-${Date.now()}`, title: newSubtask.trim(), done: false }
    setNewTaskSubtasks((current) => [...current, nextSubtask])
    setNewSubtask('')
  }

  const openCreateTask = () => {
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskStatus('New Task')
    setNewTaskPriority('None')
    setNewTaskSchedule('Today')
    setNewTaskDue('No due date')
    setNewTaskTags([])
    setNewSubtask('')
    setNewTaskSubtasks([])
    setShowTaskModal(true)
  }

  const createTask = () => {
    const newTask: TaskItem = {
      id: `t${Date.now()}`,
      title: newTaskTitle || 'New task',
      status: newTaskStatus,
      type: 'Operational',
      due: newTaskDue,
      owner: 'Me',
      progress: 0,
      tags: newTaskTags,
      description: newTaskDescription,
      schedule: newTaskSchedule,
      estimated: '0h',
      priority: newTaskPriority,
      assignee: 'Me',
      assigneeAvatar: 'M',
      subtasks: newTaskSubtasks,
    }
    setTasks((current) => [newTask, ...current])
    setSelectedTaskId(newTask.id)
    setShowTaskModal(false)
  }

  const dragStart = (event: React.DragEvent<HTMLDivElement>, title: string) => {
    event.dataTransfer.setData('text/plain', title)
  }

  const dragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const dropTask = (event: React.DragEvent<HTMLDivElement>, targetColumn: string) => {
    event.preventDefault()
    const taskTitle = event.dataTransfer.getData('text/plain')
    if (!taskTitle) return
    alert(`Moved \"${taskTitle}\" to ${targetColumn}`)
  }

  const toggleApp = (key: string) => {
    setConnected((current) => current.map((app) => (app.name === key ? { ...app, enabled: !app.enabled } : app)))
  }

  const pageTitle = {
    dashboard: 'Dashboard',
    calendar: 'Calendar Planner',
    projects: 'Projects',
    notes: 'Notes',
    settings: 'Settings',
    connected: 'Connected Apps',
    requests: 'Requests',
  }[activePage]

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${themeMode === 'Dark' ? 'dark-mode' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-sigil">G</div>
            <div>
              <strong>Garaad</strong>
              <span>Workspace</span>
            </div>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)}>
            {sidebarCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-heading">WORKSPACE</span>
          <nav className="menu">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`menu-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => setActivePage(item.key)}
            >
              <span className={`menu-icon icon-${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / {pageTitle}</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button">Search notes</button>
            <button className="primary-button" onClick={activePage === 'projects' ? openCreateTask : undefined}>
              {activePage === 'projects' ? 'New task' : 'New item'}
            </button>
          </div>
        </header>

        <section className="page-body">
          {activePage === 'dashboard' && (
            <>
              <div className="summary-grid">
                <article className="card accent-card">
                  <div className="card-title">Weekly planner</div>
                  <div className="card-value">12 meetings</div>
                  <p>All tasks and events synced with Google Calendar.</p>
                </article>
                <article className="card accent-card soft">
                  <div className="card-title">Projects active</div>
                  <div className="card-value">3 ongoing</div>
                  <p>Track progress for priority milestones.</p>
                </article>
                <article className="card accent-card soft">
                  <div className="card-title">Notes saved</div>
                  <div className="card-value">18 files</div>
                  <p>Drafts and meeting notes ready to review.</p>
                </article>
              </div>

              <div className="dashboard-grid">
                <div className="card panel">
                  <div className="panel-header">
                    <h2>Today’s schedule</h2>
                    <span>Daily view</span>
                  </div>
                  <div className="schedule-list">
                    <div className="schedule-item">
                      <span>09:00</span>
                      <div>
                        <strong>Team Standup</strong>
                        <p>Sync on planner updates.</p>
                      </div>
                    </div>
                    <div className="schedule-item">
                      <span>11:30</span>
                      <div>
                        <strong>Client review</strong>
                        <p>Calendar integration demo.</p>
                      </div>
                    </div>
                    <div className="schedule-item">
                      <span>14:00</span>
                      <div>
                        <strong>Design critique</strong>
                        <p>Finalize notes system layout.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card panel">
                  <div className="panel-header">
                    <h2>Project snapshot</h2>
                    <span>Active boards</span>
                  </div>
                  <div className="project-summary">
                    {projectItems.map((project) => (
                      <div key={project.id} className="project-pill">
                        <div>
                          <strong>{project.name}</strong>
                          <small>{project.status}</small>
                        </div>
                        <span>{project.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activePage === 'calendar' && (
            <div className="planner-grid">
              <div className="calendar-main">
                <div className="card panel">
                  <div className="panel-header">
                    <div>
                      <p className="muted-label">Today</p>
                      <h2>{calendarMode} planner</h2>
                    </div>
                    <div className="view-switcher">
                      {(['Daily', 'Weekly', 'Monthly'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          className={calendarMode === mode ? 'active' : ''}
                          onClick={() => setCalendarMode(mode)}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="timeline-card">
                    <div className="timeline-header">
                      <span>{calendarMode} overview</span>
                      <strong>Next meeting: 10:30 AM</strong>
                    </div>
                    <div className="timeline-body">
                      <div className="time-block">09:00 - Team sync</div>
                      <div className="time-block">11:30 - Client call</div>
                      <div className="time-block">13:00 - Review tasks</div>
                      <div className="time-block">15:00 - Planning session</div>
                    </div>
                  </div>
                </div>

                <div className="card panel">
                  <h3>Meeting scheduler</h3>
                  <p>Reserve blocks for calls, reviews, and team syncs.</p>
                  <div className="meeting-list">
                    <div className="meeting-card">
                      <span>10:30</span>
                      <div>
                        <strong>Planning call</strong>
                        <p>Team and client sync</p>
                      </div>
                    </div>
                    <div className="meeting-card">
                      <span>14:00</span>
                      <div>
                        <strong>Design review</strong>
                        <p>Notes workspace walkthrough</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="sidebar-panel">
                <div className="card panel">
                  <h3>Waiting list</h3>
                  <div className="task-pill">
                    <span>Awaiting approval</span>
                    <strong>Calendar sync fix</strong>
                  </div>
                  <div className="task-pill soft">
                    <span>Pending</span>
                    <strong>New note category</strong>
                  </div>
                </div>
                <div className="card panel">
                  <h3>Google Calendar</h3>
                  <p>Connect your events and schedule seamlessly.</p>
                  <button className="primary-button">Connect</button>
                </div>
                <div className="card panel soft-card">
                  <h3>Team schedule</h3>
                  <div className="avatar-row">
                    <span>A</span>
                    <span>S</span>
                    <span>L</span>
                    <span>O</span>
                  </div>
                  <p>All team members are synced for the week.</p>
                </div>
              </aside>
            </div>
          )}

          {activePage === 'projects' && (
            <>
              <div className="project-header-row">
                <div>
                  <div className="stats-pill">
                    <strong>{tasks.length} active tasks</strong>
                  </div>
                  <div className="stats-pill soft">
                    <strong>78% completion</strong>
                  </div>
                </div>
                <div className="view-switcher">
                  {(['Table', 'Kanban'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={projectView === mode ? 'active' : ''}
                      onClick={() => setProjectView(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {projectView === 'Table' ? (
                <div className="projects-table-layout">
                  <div className="card panel table-panel">
                    <table>
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Status</th>
                          <th>Due</th>
                          <th>Team</th>
                          <th>Progress</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr
                            key={task.id}
                            className={selectedTaskId === task.id ? 'selected-row' : ''}
                            onClick={() => setSelectedTaskId(task.id)}
                          >
                            <td>{task.title}</td>
                            <td>
                              <span className={`status-tag ${task.status.replace(' ', '-').toLowerCase()}`}>
                                {task.status}
                              </span>
                            </td>
                            <td>{task.due}</td>
                            <td>{task.owner}</td>
                            <td>
                              <div className="progress-bar">
                                <div style={{ width: `${task.progress}%` }} />
                              </div>
                            </td>
                            <td>{task.priority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <aside className="task-detail-panel card panel">
                    <div className="panel-header">
                      <div>
                        <span className="status-chip">{selectedTask.status}</span>
                        <h3>{selectedTask.title}</h3>
                      </div>
                      <span>{selectedTask.type}</span>
                    </div>
                    <p>{selectedTask.description}</p>
                    <div className="task-detail-grid">
                      <div>
                        <strong>Assignee</strong>
                        <p>{selectedTask.assignee}</p>
                      </div>
                      <div>
                        <strong>Schedule</strong>
                        <p>{selectedTask.schedule}</p>
                      </div>
                      <div>
                        <strong>Estimated time</strong>
                        <p>{selectedTask.estimated}</p>
                      </div>
                      <div>
                        <strong>Due date</strong>
                        <p>{selectedTask.due}</p>
                      </div>
                      <div>
                        <strong>Priority</strong>
                        <p>{selectedTask.priority}</p>
                      </div>
                    </div>
                    <div className="task-detail-section">
                      <strong>Tags</strong>
                      <div className="tag-list">
                        {selectedTask.tags.map((tag) => (
                          <span key={tag} className="tag-pill">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="task-detail-section">
                      <strong>Subtasks</strong>
                      <div className="subtask-list">
                        {selectedTask.subtasks.map((subtask) => (
                          <div key={subtask.id} className="subtask-item">
                            <span>{subtask.done ? '✓' : '○'}</span>
                            <p>{subtask.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              ) : (
                <div className="kanban-board">
                  {kanbanColumns.map((column) => (
                    <div key={column.name} className="board-column" onDragOver={dragOver} onDrop={(event) => dropTask(event, column.name)}>
                      <div className="column-header" style={{ backgroundColor: column.color }}>
                        <strong>{column.name}</strong>
                      </div>
                      <div className="column-body">
                        {column.tasks.map((task) => (
                          <div key={task} className="kanban-card" draggable onDragStart={(event) => dragStart(event, task)}>
                            <strong>{task}</strong>
                            <div className="card-chip">Design</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="project-list-card card panel">
                <div className="panel-header">
                  <h3>Project list</h3>
                  <span>Active and completed</span>
                </div>
                <div className="project-list">
                  {projectItems.map((project) => (
                    <div key={project.id} className="project-row">
                      <div>
                        <strong>{project.name}</strong>
                        <small>{project.status}</small>
                      </div>
                      <div>{project.progress}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activePage === 'notes' && (
            <div className="notes-grid">
              <div className="card panel notes-sidebar">
                <div className="panel-header">
                  <h2>Notes</h2>
                  <button className="ghost-button" onClick={addNote}>New note</button>
                </div>
                <div className="note-filters">
                  {['All', 'Planning', 'Meeting', 'UI', 'General'].map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={noteCategory === category ? 'active' : ''}
                      onClick={() => setNoteCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <input
                  className="search-input"
                  placeholder="Search notes"
                  value={noteSearch}
                  onChange={(event) => setNoteSearch(event.target.value)}
                />
                <div className="notes-list">
                  {filteredNotes.map((note) => (
                    <button
                      key={note.id}
                      className={`note-item ${selectedNoteId === note.id ? 'selected' : ''}`}
                      onClick={() => setSelectedNoteId(note.id)}
                    >
                      <strong>{note.title}</strong>
                      <small>{note.project}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="card panel note-editor">
                <div className="panel-header">
                  <div>
                    <span className="tag">{selectedNote?.category}</span>
                    <h2>{selectedNote?.title}</h2>
                  </div>
                  <button className="ghost-button danger" onClick={deleteNote}>Delete</button>
                </div>
                <div
                  className="editor-body"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => handleNoteChange((event.target as HTMLDivElement).innerText)}
                >
                  {selectedNote?.content}
                </div>
              </div>
            </div>
          )}

          {activePage === 'settings' && (
            <div className="settings-grid">
              <div className="card panel">
                <h3>Profile settings</h3>
                <div className="settings-row">
                  <label>Full name</label>
                  <input value="Hassan Ali" disabled />
                </div>
                <div className="settings-row">
                  <label>Email</label>
                  <input value="hassan@garaad.com" disabled />
                </div>
              </div>
              <div className="card panel">
                <h3>Workspace settings</h3>
                <div className="settings-row">
                  <label>Workspace name</label>
                  <input value="Garaad" disabled />
                </div>
                <div className="settings-row">
                  <label>Team size</label>
                  <input value="12" disabled />
                </div>
              </div>
              <div className="card panel">
                <h3>Notification settings</h3>
                <label className="toggle-row">
                  <span>Enable email alerts</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label className="toggle-row">
                  <span>Push notifications</span>
                  <input type="checkbox" />
                </label>
              </div>
              <div className="card panel">
                <h3>Theme settings</h3>
                <div className="theme-buttons">
                  {(['Light', 'Dark'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={themeMode === mode ? 'active' : ''}
                      onClick={() => setThemeMode(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePage === 'connected' && (
            <div className="cards-grid">
              {connected.map((app) => (
                <div key={app.name} className="card panel app-card">
                  <div>
                    <strong>{app.name}</strong>
                    <p>{app.description}</p>
                  </div>
                  <button className={app.enabled ? 'primary-button' : 'ghost-button'} onClick={() => toggleApp(app.name)}>
                    {app.enabled ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activePage === 'requests' && (
            <div className="requests-grid">
              <div className="card panel request-filters">
                <h3>Incoming requests</h3>
                <input
                  className="search-input"
                  placeholder="Search requests"
                  value={requestSearch}
                  onChange={(event) => setRequestSearch(event.target.value)}
                />
                <div className="filter-row">
                  {(['All', 'Pending', 'Approved'] as const).map((filter) => (
                    <button
                      key={filter}
                      className={requestFilter === filter ? 'active' : ''}
                      onClick={() => setRequestFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="requests-list">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="card panel request-card">
                    <div>
                      <strong>{request.title}</strong>
                      <p>{request.requester}</p>
                    </div>
                    <div>
                      <span className={`status-tag ${request.status.toLowerCase()}`}>{request.status}</span>
                      <small>{request.date}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-window" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Create task</h2>
                <button type="button" className="ghost-button" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="field-group">
                <label>Task name</label>
                <input value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="Task name" />
              </div>
              <div className="field-group">
                <label>Task description</label>
                <textarea value={newTaskDescription} onChange={(event) => setNewTaskDescription(event.target.value)} placeholder="Task description" />
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>Status</label>
                  <select value={newTaskStatus} onChange={(event) => setNewTaskStatus(event.target.value as TaskItem['status'])}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="field-group">
                  <label>Priority</label>
                  <select value={newTaskPriority} onChange={(event) => setNewTaskPriority(event.target.value as TaskItem['priority'])}>
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>Schedule this task for</label>
                  <input value={newTaskSchedule} onChange={(event) => setNewTaskSchedule(event.target.value)} />
                </div>
                <div className="field-group">
                  <label>Due date</label>
                  <input value={newTaskDue} onChange={(event) => setNewTaskDue(event.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field-group full-width">
                  <label>Add tag</label>
                  <div className="tag-input-row">
                    <input value={newTaskTags.join(', ')} readOnly placeholder="Press tab to add tags" />
                    <button type="button" className="ghost-button" onClick={() => addTaskTag('Health')}>
                      Add tag
                    </button>
                  </div>
                  <div className="tag-list">
                    {newTaskTags.map((tag) => (
                      <span key={tag} className="tag-pill" onClick={() => removeTaskTag(tag)}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="field-group">
                <label>Subtasks</label>
                <div className="subtask-add-row">
                  <input value={newSubtask} onChange={(event) => setNewSubtask(event.target.value)} placeholder="Subtask name" />
                  <button type="button" className="ghost-button" onClick={addTaskSubtask}>
                    Add subtask
                  </button>
                </div>
                {newTaskSubtasks.length > 0 && (
                  <div className="subtask-list">
                    {newTaskSubtasks.map((subtask) => (
                      <div key={subtask.id} className="subtask-item">
                        <span>{subtask.done ? '✓' : '○'}</span>
                        <p>{subtask.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="ghost-button" onClick={() => setShowTaskModal(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={createTask}>
                Create task
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bottom-nav">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            className={activePage === item.key ? 'active' : ''}
            onClick={() => setActivePage(item.key)}
          >
            <span className={`menu-icon icon-${item.icon}`} />
            <span>{item.label}</span>
          </button>
        ))}
      </footer>
    </div>
  )
}

export default App
