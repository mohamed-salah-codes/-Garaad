import { useMemo, useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import KanbanBoard, { type KanbanColumnLegacy, type KanbanTask } from './components/KanbanBoard'
import { useActiveProject } from './contexts/ActiveProjectContext'
import { ICON_CATEGORIES, getIconById } from './constants/iconLibrary'


const FOLDER_ICONS: Record<string, string> = {
  default: 'M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  code: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  design: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
  music: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
  image: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  video: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
  download: 'M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  work: 'M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.98 16.04 1 13.64 1c-1.3 0-2.43.52-3.27 1.36L10 2.73l-.37-.37C8.79 1.52 7.66 1 6.36 1 3.96 1 2 2.98 2 5.64c0 .48.11.92.18 1.36H0v14h24V6h-4z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  chart: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z',
}

function FolderSVG({ color = '#3b82f6', icon = 'default', size = 16 }: { color?: string; icon?: string; size?: number }) {
  const ReactIcon = getIconById(icon)
  const iconPath = ReactIcon ? null : FOLDER_ICONS[icon] || FOLDER_ICONS['default']
  const folderColor = color || '#3b82f6'
  const darkColor = folderColor + 'bb'
  
  return (
    <svg width={size} height={size} viewBox="0 0 40 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Folder back */}
      <rect x="0" y="8" width="40" height="26" rx="3" fill={darkColor} />
      {/* Folder tab */}
      <rect x="0" y="4" width="16" height="8" rx="2" fill={darkColor} />
      {/* Folder front */}
      <rect x="0" y="10" width="40" height="24" rx="3" fill={folderColor} />
      {/* Icon inside */}
      <g transform="translate(10, 11) scale(0.833)">
        {ReactIcon ? (
          <ReactIcon size={24} color="rgba(255,255,255,0.9)" />
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d={iconPath || undefined} fill="rgba(255,255,255,0.9)" />
          </svg>
        )}
      </g>
    </svg>
  )
}


type PageKey = 'projects' | 'tasks' | 'calendar' | 'notes' | 'settings'

type NoteItem = {
  id: string
  title: string
  category: string
  content: string
  project: string
  projectId: string
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
  estimatedHours: number
  actualHours?: number
  createdAt: string
  completedAt?: string
  priority: 'None' | 'Critical' | 'High' | 'Medium' | 'Low' | 'Lowest'
  assignee: string
  assigneeAvatar: string
  subtasks: Subtask[]
  projectId: string
}

const projectSections: Array<{ key: PageKey; label: string }> = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'notes', label: 'Notes' },
  { key: 'settings', label: 'Settings' },
]

const notesSeed: NoteItem[] = [
  {
    id: 'n1',
    title: 'Sprint planning briefing',
    category: 'Planning',
    content: 'Summarize next sprint goals and backlog priorities.',
    project: 'Garaad Redesign',
    projectId: 'p1',
    updated: 'Today, 09:18',
  },
  {
    id: 'n2',
    title: 'Client sync notes',
    category: 'Meeting',
    content: 'Review calendar integration and approval workflow.',
    project: 'Calendar Launch',
    projectId: 'p2',
    updated: 'Yesterday, 17:42',
  },
  {
    id: 'n3',
    title: 'Design tokens checklist',
    category: 'UI',
    content: 'Verify palette, spacing, and responsive mobile rules.',
    project: 'Design System',
    projectId: 'p1',
    updated: 'May 25',
  },
]

const initialTasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Refine weekly schedule layout',
    status: 'In Progress',
    type: 'Design',
    due: '2026-05-30',
    owner: 'Amina',
    progress: 65,
    tags: ['UX', 'Mobile'],
    description: 'Build a responsive weekly planner card that matches the updated Bordio style.',
    schedule: 'Today',
    estimatedHours: 3,
    priority: 'High',
    assignee: 'Amina',
    assigneeAvatar: 'A',
    subtasks: [
      { id: 's1', title: 'Layout header', done: true },
      { id: 's2', title: 'Style cards', done: false },
    ],
    projectId: 'p1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    title: 'Publish notes workspace',
    status: 'New Task',
    type: 'Docs',
    due: '2026-06-02',
    owner: 'Samir',
    progress: 20,
    tags: ['Notes'],
    description: 'Create the notes editor layout with categories, tags, and search.',
    schedule: 'Tomorrow',
    estimatedHours: 4,
    priority: 'Medium',
    assignee: 'Samir',
    assigneeAvatar: 'S',
    subtasks: [
      { id: 's3', title: 'Add search', done: false },
    ],
    projectId: 'p3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    title: 'Review Google Calendar flow',
    status: 'Scheduled',
    type: 'Integration',
    due: '2026-05-29',
    owner: 'Lina',
    progress: 80,
    tags: ['Sync'],
    description: 'Validate the Google Calendar integration UI and sync logic.',
    schedule: 'Today',
    estimatedHours: 2,
    priority: 'High',
    assignee: 'Lina',
    assigneeAvatar: 'L',
    subtasks: [
      { id: 's4', title: 'Review event mapping', done: true },
      { id: 's5', title: 'Test recurring tasks', done: false },
    ],
    projectId: 'p2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't4',
    title: 'Finalize project metrics board',
    status: 'Completed',
    type: 'Analytics',
    due: '2026-05-27',
    owner: 'Omar',
    progress: 100,
    tags: ['Reporting'],
    description: 'Finalize the project progress board and display completed items.',
    schedule: 'Yesterday',
    estimatedHours: 1,
    actualHours: 1,
    priority: 'Low',
    assignee: 'Omar',
    assigneeAvatar: 'O',
    subtasks: [
      { id: 's6', title: 'Confirm metrics', done: true },
      { id: 's7', title: 'Publish board', done: true },
    ],
    projectId: 'p1',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
]

// projectItems removed as they are supplied by context

const statusColumnMetadata: Array<{ name: TaskItem['status']; color: string }> = [
  { name: 'New Task', color: '#c8d9ff' },
  { name: 'Scheduled', color: '#fcdbcf' },
  { name: 'In Progress', color: '#d2f8d2' },
  { name: 'Completed', color: '#e9d7ff' },
]

const getKanbanColumnsFromTasks = (taskList: TaskItem[]): KanbanColumnLegacy[] =>
  statusColumnMetadata.map((meta) => ({
    id: meta.name.toLowerCase().replace(/\s+/g, '-'),
    name: meta.name,
    color: meta.color,
    tasks: taskList
      .filter((task) => task.status === meta.name)
      .map((task) => ({ id: task.id, title: task.title, label: task.type, estimatedHours: task.estimatedHours, actualHours: task.actualHours, assigneeAvatar: task.assigneeAvatar })),
  }))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/project/p1/tasks" replace />} />
      <Route path="/project/:projectId/:pageKey" element={<ProjectLayout />} />
    </Routes>
  )
}

function ProjectLayout() {
  const { projectId, pageKey } = useParams()
  const navigate = useNavigate()
  const { currentProject, setCurrentProject, projects, setProjects, folders, setFolders } = useActiveProject()

  useEffect(() => {
    const proj = projects.find((p) => p.id === projectId)
    if (proj && currentProject?.id !== proj.id) {
      setCurrentProject(proj)
    }
  }, [projectId, projects, currentProject, setCurrentProject])

  const activePage = (pageKey as PageKey) || 'tasks'
  const setActivePage = (key: PageKey) => navigate(`/project/${projectId}/${key}`)

  const selectedProjectId = currentProject?.id ?? ''
  const setSelectedProjectId = (id: string) => {
    navigate(`/project/${id}/tasks`)
  }

  const [projectView, setProjectView] = useState<'Table' | 'Kanban'>('Kanban')
  const [notes, setNotes] = useState<NoteItem[]>(notesSeed)
  const [selectedNoteId, setSelectedNoteId] = useState(notesSeed[0].id)
  const editorRef = useRef<HTMLDivElement>(null)

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const [folderMenuOpenId, setFolderMenuOpenId] = useState<string | null>(null)
  const [folderToRename, setFolderToRename] = useState<{id: string, name: string} | null>(null)
  const [folderToDelete, setFolderToDelete] = useState<{id: string, name: string} | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ f1: true })
  const [createProjectModal, setCreateProjectModal] = useState<{ open: boolean; folderId?: string }>({ open: false })
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectNameError, setNewProjectNameError] = useState('')
  const [createFolderModal, setCreateFolderModal] = useState<{ open: boolean; name: string; color: string; icon: string; error?: string }>({ open: false, name: '', color: '#3b82f6', icon: 'default' })
  const [customizeFolder, setCustomizeFolder] = useState<any | null>(null)
  
  // Icon Picker state
  const [iconPickerState, setIconPickerState] = useState<{ open: boolean; onSelect: (id: string) => void } | null>(null)
  const [iconSearchQuery, setIconSearchQuery] = useState('')
  const [activeIconCategory, setActiveIconCategory] = useState(ICON_CATEGORIES[0].id)


  useEffect(() => {
    if (editorRef.current) {
      const selectedNote = notes.find((n) => n.id === selectedNoteId)
      editorRef.current.innerHTML = selectedNote?.content === 'Start writing the note here...' ? '' : (selectedNote?.content || '')
    }
  }, [selectedNoteId]) // intentionally only run when selectedNoteId changes

  useEffect(() => {
    const closeMenus = () => {
      setIsAddMenuOpen(false)
      setFolderMenuOpenId(null)
    }
    document.addEventListener('click', closeMenus)
    return () => document.removeEventListener('click', closeMenus)
  }, [])

  const [noteSearch] = useState('')
  const [noteCategory] = useState('All')
  const [themeMode, setThemeMode] = useState<'Light' | 'Dark'>(() => {
    try { return (localStorage.getItem('garaad_theme') as 'Light' | 'Dark') || 'Dark' } catch { return 'Dark' }
  })

  const toggleTheme = () => {
    setThemeMode(prev => {
      const next = prev === 'Dark' ? 'Light' : 'Dark'
      try { localStorage.setItem('garaad_theme', next) } catch {}
      return next
    })
  }
  const [tasks, setTasks] = useState(initialTasks)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [showFormatDropdown, setShowFormatDropdown] = useState(false)
  const [textFormat, setTextFormat] = useState('Normal text')
  
  const projectTasks = useMemo(() => tasks.filter(t => t.projectId === selectedProjectId), [tasks, selectedProjectId])
  const kanbanColumns = useMemo(() => getKanbanColumnsFromTasks(projectTasks), [projectTasks])
  
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState<TaskItem['status']>('New Task')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('None')
  const [newTaskSchedule, setNewTaskSchedule] = useState('Today')
  const [newTaskDue, setNewTaskDue] = useState('')
  const [newTaskEstimatedHours, setNewTaskEstimatedHours] = useState<number>(0)
  const [newTaskTags, setNewTaskTags] = useState<string[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [newTaskSubtasks, setNewTaskSubtasks] = useState<Subtask[]>([])
  const [settingsTab, setSettingsTab] = useState<'Details' | 'Configuration'>('Configuration')

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [pendingOriginalStatus, setPendingOriginalStatus] = useState<TaskItem['status'] | null>(null)

  // Status Modals state
  const [showEditStatusesModal, setShowEditStatusesModal] = useState(false)
  const [showAddTaskStatusModal, setShowAddTaskStatusModal] = useState(false)
  const [showCreateTaskStatusModal, setShowCreateTaskStatusModal] = useState(false)
  const [createStatusName, setCreateStatusName] = useState('')
  const [createStatusGroup, setCreateStatusGroup] = useState<'Open' | 'Closed'>('Closed')
  type TaskStatus = { id: string; name: string; group: string; icon: string | null; isDefault: boolean; isNew?: boolean; isCompleted?: boolean }
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([
    { id: 'status-new-task', name: 'New task', group: 'Open', icon: null, isDefault: true, isNew: true },
    { id: 'status-scheduled', name: 'Scheduled', group: 'Open', icon: '📅', isDefault: false },
    { id: 'status-in-progress', name: 'In Progress', group: 'Open', icon: '🛠', isDefault: false },
    { id: 'status-completed', name: 'Completed', group: 'Closed', icon: '✅', isDefault: true, isCompleted: true },
  ])
  const [editingTaskStatus, setEditingTaskStatus] = useState<{ id: string, name: string, icon: string | null } | null>(null)
  const [showStatusEmojiPicker, setShowStatusEmojiPicker] = useState(false)
  const emojis = ['🛠', '✅', '📅', '🚀', '🔥', '💻', '🎨', '📝', '⚡', '💡', '🔍', '🎯']

  // Task Type Modals state
  const [showEditTypesModal, setShowEditTypesModal] = useState(false)
  const [showAddTaskTypeModal, setShowAddTaskTypeModal] = useState(false)
  const [showCreateTaskTypeModal, setShowCreateTaskTypeModal] = useState(false)
  const [createTypeName, setCreateTypeName] = useState('')
  const [selectedTypeColor, setSelectedTypeColor] = useState('#3b82f6')
  const [showColorPicker, setShowColorPicker] = useState(false)
  
  const [taskTypes, setTaskTypes] = useState([
    { name: 'Operational', color: '#0f766e' },
    { name: 'Health', color: '#3b82f6' },
    { name: 'Home and family', color: '#1e9fb4' },
    { name: 'Finance', color: '#7c3aed' },
    { name: 'Learning', color: '#a21caf' },
    { name: 'Planning', color: '#16a34a' },
    { name: 'Strategic', color: '#4ade80' },
    { name: 'Technical', color: '#a16207' },
  ])
  const [editingTaskType, setEditingTaskType] = useState<{ originalName: string, name: string, color: string } | null>(null)

  const typeColors = [
    '#3b82f6', '#1e9fb4', '#0f766e', '#16a34a', '#4ade80',
    '#92400e', '#a16207', '#b45309', '#a21caf', '#7c3aed'
  ]

  // Event Type Modals state
  const [showEditEventTypesModal, setShowEditEventTypesModal] = useState(false)
  const [showAddEventTypeModal, setShowAddEventTypeModal] = useState(false)
  const [showCreateEventTypeModal, setShowCreateEventTypeModal] = useState(false)
  const [createEventTypeName, setCreateEventTypeName] = useState('')
  const [selectedEventTypeColor, setSelectedEventTypeColor] = useState('#3b82f6')
  const [showEventColorPicker, setShowEventColorPicker] = useState(false)
  const [eventTypes, setEventTypes] = useState([
    { name: 'Meeting', color: '#b45309' },
    { name: 'Phone call', color: '#3b82f6' },
  ])
  const [editingEventType, setEditingEventType] = useState<{ originalName: string, name: string, color: string } | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [pendingTaskId, setPendingTaskId] = useState('')
  const [pendingTaskEstimated, setPendingTaskEstimated] = useState('0h')
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0])
  const [completionHours, setCompletionHours] = useState('0')
  const [completionMode, setCompletionMode] = useState('Manual time')

  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [pickerViewDate, setPickerViewDate] = useState(new Date())

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }))
  }

  const handleCreateFolder = () => {
    setCreateFolderModal({ open: true, name: '', color: '#3b82f6', icon: 'default', error: undefined })
    setIsAddMenuOpen(false)
  }

  const submitCreateFolder = () => {
    const name = createFolderModal.name.trim()
    if (!name) return
    const isDuplicate = folders.some(f => f.name.toLowerCase() === name.toLowerCase())
    if (isDuplicate) {
      setCreateFolderModal(prev => ({ ...prev, error: 'A folder with this name already exists.' }))
      return
    }
    const newFolder = { id: `f${Date.now()}`, name, color: createFolderModal.color, icon: createFolderModal.icon }
    setFolders(prev => [...prev, newFolder])
    setExpandedFolders(prev => ({ ...prev, [newFolder.id]: true }))
    setCreateFolderModal({ open: false, name: '', color: '#3b82f6', icon: 'default' })
  }

  const handleCreateProject = (folderId?: string) => {
    setNewProjectName('')
    setNewProjectNameError('')
    setCreateProjectModal({ open: true, folderId })
    setIsAddMenuOpen(false)
    setFolderMenuOpenId(null)
  }

  const submitCreateProject = () => {
    const name = newProjectName.trim() || 'New Project'
    // Uniqueness check within same folder (or root)
    const folderId = createProjectModal.folderId
    const isDuplicate = projects.some(p => p.folderId === folderId && p.name.toLowerCase() === name.toLowerCase())
    if (isDuplicate) {
      setNewProjectNameError('A project with this name already exists in this location.')
      return
    }
    const newProject = {
      id: `p${Date.now()}`,
      name,
      status: 'Active',
      progress: 0,
      team: ['Mohamed Ahmed Salah'],
      folderId: createProjectModal.folderId
    }
    setProjects(prev => [...prev, newProject])
    setCreateProjectModal({ open: false })
    setNewProjectName('')
    navigate(`/project/${newProject.id}/tasks`)
  }

  const handleDeleteFolder = (folder: {id: string, name: string}) => {
    setFolderToDelete(folder)
    setFolderMenuOpenId(null)
  }

  const confirmDeleteFolder = () => {
    if (folderToDelete) {
      setFolders(prev => prev.filter(f => f.id !== folderToDelete.id))
      setProjects(prev => prev.map(p => p.folderId === folderToDelete.id ? { ...p, folderId: undefined } : p))
      setFolderToDelete(null)
    }
  }



  const confirmDeleteProject = () => {
    if (projectToDelete) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id))
      if (currentProject?.id === projectToDelete.id) {
        setCurrentProject(null)
        navigate('/')
      }
      setProjectToDelete(null)
    }
  }

  const handleRenameFolder = (newName: string) => {
    if (folderToRename) {
      setFolders(prev => prev.map(f => f.id === folderToRename.id ? { ...f, name: newName } : f))
    }
    setFolderToRename(null)
  }

  const getCalendarDays = (startDate: Date) => {
    const d = new Date(startDate)
    d.setHours(12, 0, 0, 0)
    
    return Array.from({ length: 5 }).map((_, i) => {
      const day = new Date(d)
      day.setDate(d.getDate() + i)
      return day
    })
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentCalendarDate(prev => {
      const nextDate = new Date(prev)
      nextDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1))
      return nextDate
    })
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear()
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const monthsList = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const calendarDays = getCalendarDays(currentCalendarDate)
  const pickerDays = getDaysInMonth(pickerViewDate)
  
  // Dummy tasks with fixed dates for demonstration
  const demoTaskDate1 = new Date()
  const demoTaskDate2 = new Date()
  demoTaskDate2.setDate(demoTaskDate2.getDate() - 1) // Yesterday

  const selectedProject = currentProject

  const projectNotes = useMemo(() => notes.filter(n => n.projectId === selectedProjectId), [notes, selectedProjectId])

  const selectedNote = useMemo(
    () => projectNotes.find((note) => note.id === selectedNoteId) ?? projectNotes[0],
    [projectNotes, selectedNoteId],
  )

  const filteredNotes = useMemo(
    () =>
      projectNotes.filter((note) => {
        const matchesCategory = noteCategory === 'All' || note.category === noteCategory
        const matchesSearch = note.title.toLowerCase().includes(noteSearch.toLowerCase())
        return matchesCategory && matchesSearch
      }),
    [projectNotes, noteCategory, noteSearch],
  )

  const statusOptions: TaskItem['status'][] = ['New Task', 'Scheduled', 'In Progress', 'Completed']
  const priorityOptions: TaskItem['priority'][] = ['None', 'Critical', 'High', 'Medium', 'Low', 'Lowest']


  const handleNoteChange = (value: string) => {
    setNotes((current) =>
      current.map((note) => (note.id === selectedNoteId ? { ...note, content: value } : note)),
    )
  }

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      let node: Node | null = selection.anchorNode;
      let inBlockquote = false;
      let inHeading = false;
      
      while (node && node !== e.currentTarget) {
        if (node.nodeName === 'BLOCKQUOTE') inBlockquote = true;
        if (node.nodeName === 'H1' || node.nodeName === 'H2') inHeading = true;
        node = node.parentNode;
      }
      
      // If Shift+Enter, we just let the browser insert a <br> (stay in quote/heading).
      if (e.shiftKey) {
        return; // default behavior
      }

      // If Enter (no shift), we want to exit the quote or heading.
      if (inBlockquote || inHeading) {
        e.preventDefault();
        
        // 1. Create a new line block
        document.execCommand('insertParagraph', false);
        
        // 2. If it was a blockquote, pull this new block out of the blockquote
        if (inBlockquote) {
          document.execCommand('outdent', false);
        }
        
        // 3. Make sure the new block is a standard DIV/P (especially for headings)
        document.execCommand('formatBlock', false, 'DIV');
        
        // 4. Update the UI dropdown state
        setTextFormat('Normal text');
      }
    }
  }

  const addNote = () => {
    const newNote: NoteItem = {
      id: `n${Date.now()}`,
      title: 'New note',
      category: 'General',
      content: 'Start writing the note here...',
      project: selectedProject?.name ?? 'Project',
      projectId: selectedProjectId,
      updated: 'Just now',
    }
    setNotes((current) => [newNote, ...current])
    setSelectedNoteId(newNote.id)
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
    setNewTaskDue('')
    setNewTaskEstimatedHours(0)
    setNewTaskTags([])
    setNewSubtask('')
    setNewTaskSubtasks([])
    setShowTaskModal(true)
  }

  const createTask = () => {
    if (!newTaskTitle.trim() || newTaskEstimatedHours <= 0 || !newTaskDue.trim()) {
      alert("Please provide a Task name, Estimated hours (> 0), and a Due date.");
      return;
    }

    const newTask: TaskItem = {
      id: `t${Date.now()}`,
      title: newTaskTitle.trim(),
      status: newTaskStatus,
      type: 'Operational',
      due: newTaskDue,
      owner: 'Me',
      progress: 0,
      tags: newTaskTags,
      description: newTaskDescription,
      schedule: newTaskSchedule,
      estimatedHours: newTaskEstimatedHours,
      priority: newTaskPriority,
      assignee: 'Me',
      assigneeAvatar: 'M',
      subtasks: newTaskSubtasks,
      projectId: selectedProjectId,
      createdAt: new Date().toISOString(),
    }
    setTasks((current) => [newTask, ...current])
    setShowTaskModal(false)
  }

  const handleKanbanColumnsChange = (newColumns: KanbanColumnLegacy[]) => {
    setTasks((current) => {
      const taskMap = new Map(current.map((task) => [task.id, task]))
      const updatedProjectTasks: TaskItem[] = []
      for (const column of newColumns) {
        for (const taskItem of column.tasks) {
          const existingTask = taskMap.get(taskItem.id)
          if (existingTask) {
            updatedProjectTasks.push({ ...existingTask, status: column.name as TaskItem['status'] })
            taskMap.delete(taskItem.id)
          }
        }
      }
      return [...updatedProjectTasks, ...Array.from(taskMap.values())]
    })
  }

  const handleTaskDropToCompleted = (task: KanbanTask, pending: KanbanColumnLegacy[]) => {
    const originalTask = tasks.find(t => t.id === task.id)
    if (originalTask) {
      setPendingOriginalStatus(originalTask.status)
    }

    setPendingTaskId(task.id)
    setPendingTaskEstimated(`${task.estimatedHours || 0}h`)
    
    // Update state immediately so it doesn't snap back visually
    handleKanbanColumnsChange(pending)
    
    setCompletionDate(new Date().toISOString().split('T')[0])
    setCompletionHours('0')
    setCompletionMode('Manual time')
    setShowCompletionModal(true)
  }

  const handleCompletionSave = () => {
    if (pendingTaskId) {
      setTasks(current => current.map(t => 
        t.id === pendingTaskId 
          ? { ...t, actualHours: parseFloat(completionHours) || 0, completedAt: new Date().toISOString() }
          : t
      ))
    }
    setPendingOriginalStatus(null)
    setShowCompletionModal(false)
  }

  const handleCompletionCancel = () => {
    // Revert the task status
    if (pendingTaskId && pendingOriginalStatus) {
      setTasks(current => current.map(t => 
        t.id === pendingTaskId 
          ? { ...t, status: pendingOriginalStatus }
          : t
      ))
    }
    setPendingOriginalStatus(null)
    setShowCompletionModal(false)
  }

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveMenuId(activeMenuId === id ? null : id)
  }

  const renderMenu = (id: string, typeLabel: string, onEdit?: () => void, onRemove?: () => void) => (
    <div className="kebab-menu-container">
      <button type="button" className="kebab-btn" onClick={(e) => toggleMenu(id, e)}>⋮</button>
      {activeMenuId === id && (
        <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="dropdown-item" onClick={() => { setActiveMenuId(null); onEdit?.(); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Edit {typeLabel}
          </button>
          <button type="button" className="dropdown-item danger" onClick={() => { setActiveMenuId(null); onRemove?.(); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Remove from project
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className={`app-shell ${themeMode === 'Dark' ? 'dark-mode' : ''} ${activePage === 'settings' ? 'settings-active' : ''}`}>
      {activePage !== 'settings' && (
        <aside className="sidebar">
          <div className="sidebar-profile">
          <div className="profile-avatar">M</div>
          <div className="profile-meta">
            <div className="profile-title">My work</div>
            <div className="profile-subtitle">Project management</div>
          </div>
        </div>

        <div className="sidebar-section project-list-section">
          <div className="section-header" style={{ position: 'relative' }}>
            <span>Projects</span>
            <button 
              type="button" 
              className="icon-button" 
              aria-label="New project"
              onClick={(e) => { e.stopPropagation(); setIsAddMenuOpen(!isAddMenuOpen); }}
            >
              +
            </button>
            {isAddMenuOpen && (
              <div className="sidebar-dropdown-menu" onClick={e => e.stopPropagation()}>
                <button className="sidebar-dropdown-item" onClick={() => handleCreateProject()}>
                  <span style={{ border: '1px solid currentColor', borderRadius: '4px', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>+</span> 
                  Create project
                </button>
                <button className="sidebar-dropdown-item" onClick={handleCreateFolder}>
                  <span style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                    </svg>
                  </span>
                  Create folder
                </button>
              </div>
            )}
          </div>

          <div className="project-list">
            {folders.map(folder => {
              const folderProjects = projects.filter(p => p.folderId === folder.id);
              const isExpanded = expandedFolders[folder.id];
              return (
                <div key={folder.id} className="sidebar-folder">
                  <div className={`folder-header ${isExpanded ? 'expanded' : ''}`} style={{ position: 'relative' }} onClick={() => toggleFolder(folder.id)}>
                    <span className="folder-arrow" style={{ display: 'inline-flex', alignItems: 'center', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span className="folder-icon" style={{ display: 'flex', alignItems: 'center' }}>
                      <FolderSVG color={folder.color} icon={folder.icon} size={18} />
                    </span>
                    <span className="folder-name">{folder.name}</span>
                    <button 
                      className="folder-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderMenuOpenId(folderMenuOpenId === folder.id ? null : folder.id);
                      }}
                    >⋮</button>
                    {folderMenuOpenId === folder.id && (
                      <div className="sidebar-dropdown-menu" onClick={e => e.stopPropagation()}>
                          <button className="sidebar-dropdown-item" onClick={() => handleCreateProject(folder.id)}>
                            <span style={{ border: '1px solid currentColor', borderRadius: '4px', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>+</span> 
                            Create project
                          </button>
                          <button className="sidebar-dropdown-item" onClick={() => { setFolderToRename(folder); setFolderMenuOpenId(null); }}>
                            <span>✏️</span>
                            Rename folder
                          </button>
                          <button className="sidebar-dropdown-item" onClick={() => { setCustomizeFolder(folder); setFolderMenuOpenId(null); }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                            </span>
                            Customize folder
                          </button>
                          <button className="sidebar-dropdown-item danger" onClick={() => handleDeleteFolder(folder)}>
                            <span>🗑️</span>
                            Delete folder
                          </button>
                        </div>
                      )}
                  </div>
                  {isExpanded && (
                    <div className="folder-projects">
                      {folderProjects.map(project => (
                        <button
                          key={project.id}
                          type="button"
                          className={`project-link ${selectedProjectId === project.id ? 'active' : ''}`}
                          onClick={() => setSelectedProjectId(project.id)}
                        >
                          <span>{project.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* Root-level projects */}
            {projects.filter(p => !p.folderId).map((project) => (
              <button
                key={project.id}
                type="button"
                className={`project-link ${selectedProjectId === project.id ? 'active' : ''}`}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <span>{project.name}</span>
              </button>
            ))}
          </div>
        </div>
          {/* Theme Toggle Button */}
          <div style={{ marginTop: 'auto', padding: '12px 4px 0' }}>
            <button
              onClick={toggleTheme}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--surface-muted)',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-muted)')}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>
                {themeMode === 'Dark' ? '☀️' : '🌙'}
              </span>
              <span>{themeMode === 'Dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
      </aside>
      )}

      <div className={`content ${activePage === 'settings' ? 'settings-content-area' : ''} ${activePage === 'notes' ? 'notes-content-area' : ''}`}>
        {activePage === 'settings' ? (
          <>
            <header className="topbar settings-topbar">
              <h1>Project settings</h1>
            </header>
            
            <div className="settings-tabs-container">
              <button 
                className={`settings-tab ${settingsTab === 'Details' ? 'active' : ''}`}
                onClick={() => setSettingsTab('Details')}
              >
                Details
              </button>
              <button 
                className={`settings-tab ${settingsTab === 'Configuration' ? 'active' : ''}`}
                onClick={() => setSettingsTab('Configuration')}
              >
                Configuration
              </button>
            </div>
          </>
        ) : (
          <>
            {activePage === 'notes' ? (
              <header className="topbar notes-page-topbar">
                <div className="notes-topbar-left">
                  <button className="primary-button notes-add-btn" onClick={addNote}>+ Add new</button>
                </div>
              </header>
            ) : (
              <header className="topbar">
                <div>
                  <p className="breadcrumb">Project / {selectedProject?.name ?? 'Select a project'}</p>
                  <h1>{selectedProject?.name ?? 'Select a project'}</h1>
                </div>
                <div className="topbar-actions">
                  <button className="ghost-button">Search notes</button>
                  <button className="primary-button" onClick={activePage === 'tasks' ? openCreateTask : undefined}>
                    {activePage === 'tasks' ? 'New task' : 'New item'}
                  </button>
                </div>
              </header>
            )}

            {activePage !== 'notes' && (
              <div className="project-menu">
                {projectSections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    className={`project-nav-button ${activePage === section.key ? 'active' : ''}`}
                    onClick={() => {
                      if (section.key === 'settings') {
                        setActivePage('settings')
                        setSettingsTab('Configuration')
                      } else {
                        setActivePage(section.key)
                      }
                    }}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <section className="page-body">

          {activePage === 'calendar' && (
            <div className="calendar-page">
              <header className="calendar-topbar">
                <div className="calendar-actions-left" style={{ position: 'relative' }}>
                  <button className="primary-button add-new-btn">
                    + Add new
                  </button>
                  <button 
                    className={`dropdown-btn ${showDatePicker ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setShowDatePicker(!showDatePicker); }}
                  >
                    Today <span className="chevron" style={{ transform: showDatePicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>v</span>
                  </button>
                  
                  {showDatePicker && (
                    <div className="date-picker-dropdown" onClick={(e) => e.stopPropagation()}>
                      <div className="picker-container">
                        <div className="picker-months-sidebar">
                          {monthsList.map((month, index) => {
                            const isSelected = pickerViewDate.getMonth() === index;
                            return (
                              <button 
                                key={month}
                                className={`picker-month-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  const newDate = new Date(pickerViewDate);
                                  newDate.setMonth(index);
                                  setPickerViewDate(newDate);
                                }}
                              >
                                {isSelected ? (
                                  <>
                                    {month} <span className="picker-year-badge">{pickerViewDate.getFullYear()}</span>
                                  </>
                                ) : (
                                  month
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <div className="picker-calendar-view">
                          <div className="picker-weekdays-header">
                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                          </div>
                          <div className="picker-days-grid">
                            {pickerDays.map((day, i) => {
                              if (!day) return <div key={`empty-${i}`} className="picker-day empty"></div>;
                              const isToday = isSameDay(day, new Date());
                              const isSelected = isSameDay(day, currentCalendarDate);
                              return (
                                <button 
                                  key={day.toISOString()} 
                                  className={`picker-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    setCurrentCalendarDate(day);
                                    setShowDatePicker(false);
                                  }}
                                >
                                  {day.getDate()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </header>

              <div className="calendar-grid-container" onClick={() => setShowDatePicker(false)}>
                <div className="calendar-header-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Month Row */}
                  <div className="calendar-header-months" style={{ display: 'grid', gridTemplateColumns: '80px repeat(5, 1fr) 40px', paddingBottom: '4px' }}>
                    <div></div> {/* Left nav empty space */}
                    {(() => {
                      const monthSpans: { label: string, count: number }[] = [];
                      calendarDays.forEach(day => {
                        const label = formatMonthYear(day);
                        if (monthSpans.length > 0 && monthSpans[monthSpans.length - 1].label === label) {
                          monthSpans[monthSpans.length - 1].count++;
                        } else {
                          monthSpans.push({ label, count: 1 });
                        }
                      });
                      return monthSpans.map(span => (
                        <div key={span.label} style={{ gridColumn: `span ${span.count}`, paddingLeft: '12px' }}>
                          <div className="month-label" style={{ paddingLeft: 0 }}>{span.label}</div>
                        </div>
                      ));
                    })()}
                    <div></div> {/* Right nav empty space */}
                  </div>

                  {/* Days Row */}
                  <div className="calendar-header-grid" style={{ alignItems: 'center' }}>
                    <div className="calendar-left-nav" style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <button className="nav-arrow" onClick={() => navigateDay('prev')}>{'<'}</button>
                    </div>
                    
                    {calendarDays.map(day => {
                      const isToday = isSameDay(day, new Date())
                      return (
                        <div key={day.toISOString()} className={`day-col-header ${isToday ? 'active' : ''}`}>
                          {day.getDate()} {day.toLocaleDateString('en-US', { weekday: 'short' })}
                          {isToday && <div className="active-indicator"></div>}
                        </div>
                      )
                    })}

                    <div className="calendar-right-nav" style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <button className="nav-arrow" onClick={() => navigateDay('next')}>{'>'}</button>
                    </div>
                  </div>
                </div>

                <div className="calendar-body-grid">
                  <div></div> {/* Left nav empty space */}
                  {calendarDays.map((day) => {
                    const isToday = isSameDay(day, new Date())
                    const hasTask1 = isSameDay(day, demoTaskDate1)
                    const hasTask2 = isSameDay(day, demoTaskDate2)
                    
                    return (
                      <div key={day.toISOString()} className={`calendar-col ${isToday ? 'active' : ''}`}>
                        {(hasTask1 || hasTask2) ? (
                          <>
                            <div className="col-summary-hours">11h / 10h</div>
                            
                            {hasTask1 && (
                              <div className="calendar-task-card">
                                <strong>f</strong>
                                <span>1h / 10h</span>
                              </div>
                            )}
                            {hasTask2 && (
                              <div className="calendar-task-card">
                                <strong>kol</strong>
                                <span>10h / -</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="col-empty-dash">-</span>
                        )}
                      </div>
                    )
                  })}
                  <div></div> {/* Right nav empty space */}
                </div>
              </div>
            </div>
          )}

          {activePage === 'tasks' && (
            <>
              <div className="tasks-topbar">
                <div className="tasks-topbar-left">
                  <button className="primary-button" onClick={openCreateTask}>Add new</button>
                  <button
                    type="button"
                    className={`ghost-button ${projectView === 'Table' ? 'active' : ''}`}
                    onClick={() => setProjectView('Table')}
                  >
                    Table view
                  </button>
                  <button
                    type="button"
                    className={`ghost-button ${projectView === 'Kanban' ? 'active' : ''}`}
                    onClick={() => setProjectView('Kanban')}
                  >
                    Workflow Board
                  </button>
                </div>
                <button type="button" className="icon-button" onClick={() => { setActivePage('settings'); setSettingsTab('Configuration'); }}>
                  ⚙
                </button>
              </div>
              <div className="tasks-status-row">
                {kanbanColumns.map((column) => {
                  const filterClass = `status-filter-button filter-status-${column.name.toLowerCase().replace(/\s+/g, '-')}`;
                  return (
                    <button key={column.name} type="button" className={filterClass}>
                      <span>{column.name}</span>
                      <span>{column.tasks.length}</span>
                    </button>
                  );
                })}
              </div>

              {projectView === 'Table' ? (
                <div className="projects-table-layout">
                  <div className="card panel table-panel dark-table-panel">
                    <div className="table-header-row">
                      <div>
                        <strong>Open tasks</strong>
                        <span>{projectTasks.length} items</span>
                      </div>
                      <button className="ghost-button" onClick={openCreateTask}>Create task</button>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Status</th>
                          <th>Type</th>
                          <th>Due date</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectTasks.map((task) => (
                          <tr key={task.id}>
                            <td>
                              <div className="task-title-cell">
                                <span className="task-icon">✉</span>
                                <div>
                                  <strong>{task.title}</strong>
                                  <small>{task.description}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`status-tag ${task.status.replace(' ', '-').toLowerCase()}`}>
                                {task.status}
                              </span>
                            </td>
                            <td>
                              <span className="type-chip">{task.type}</span>
                            </td>
                            <td>{task.due}</td>
                            <td>{task.priority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              ) : (
                <>
                  <KanbanBoard
                    columns={kanbanColumns}
                    onColumnsChange={handleKanbanColumnsChange}
                    onCreateTask={openCreateTask}
                    onTaskDropToCompleted={handleTaskDropToCompleted}
                    onTaskClick={(kanbanTask) => {
                      const fullTask = tasks.find(t => t.id === kanbanTask.id) || null
                      setSelectedTask(fullTask)
                    }}
                    onInlineCreateTask={(title, estimated, type, status) => {
                      const newTask: TaskItem = {
                        id: `t${Date.now()}`,
                        title: title || 'New task',
                        status: status as TaskItem['status'],
                        type: type || 'Operational',
                        due: 'No due date',
                        owner: 'Me',
                        progress: 0,
                        tags: [],
                        description: '',
                        schedule: 'Today',
                        estimatedHours: parseFloat((estimated || '0').replace('h', '')) || 0,
                        priority: 'None',
                        assignee: 'Me',
                        assigneeAvatar: 'M',
                        subtasks: [],
                        projectId: selectedProjectId,
                        createdAt: new Date().toISOString(),
                      }
                      setTasks((current) => [newTask, ...current])
                    }}
                  />
                  <div className="workflow-footer">
                    <button type="button" className="ghost-button" onClick={openCreateTask}>
                      + Create task
                    </button>
                  </div>
                </>
              )}

            </>
          )}

          {activePage === 'notes' && (
            <div className="notes-app-layout">
              <div className="notes-sidebar-new">
                <div className="notes-list-new">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`note-item-new ${selectedNoteId === note.id ? 'active' : ''}`}
                      onClick={() => setSelectedNoteId(note.id)}
                    >
                      <div className="note-title-new">{note.title || 'New note'}</div>
                      <div className="note-preview-new">{note.content && note.content !== 'Start writing the note here...' ? note.content.replace(/<[^>]+>/g, '').substring(0, 30) + '...' : 'No text yet'}</div>
                      <div className="note-date-new">Today</div>
                    </div>
                  ))}
                </div>
                <div className="recently-deleted">
                  <span>Recently deleted</span>
                  <div className="recently-deleted-right">
                    <span className="rd-badge">1</span>
                    <span className="rd-chevron">^</span>
                  </div>
                </div>
              </div>
              
              <div className="note-editor-new">
                <div className="editor-toolbar-new">
                  <div className="toolbar-left">
                    <div className="toolbar-dropdown-container" style={{ position: 'relative' }}>
                      <button 
                        className="toolbar-dropdown"
                        onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                      >
                        {textFormat} <span>v</span>
                      </button>
                      {showFormatDropdown && (
                        <div className="format-dropdown-menu">
                          {['Normal text', 'Heading 1', 'Heading 2', 'Quote'].map(format => (
                            <button 
                              key={format}
                              className={`format-dropdown-item ${textFormat === format ? 'active' : ''}`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setTextFormat(format)
                                setShowFormatDropdown(false)
                                
                                let commandValue = 'P'
                                if (format === 'Heading 1') commandValue = 'H1'
                                else if (format === 'Heading 2') commandValue = 'H2'
                                else if (format === 'Quote') commandValue = 'BLOCKQUOTE'
                                else if (format === 'Normal text') commandValue = 'P'
                                
                                document.execCommand('formatBlock', false, commandValue)
                              }}
                            >
                              {format}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="toolbar-divider"></div>
                    <button className="toolbar-icon" style={{fontWeight: 'bold'}} onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('bold', false)}>B</button>
                    <button className="toolbar-icon" style={{fontStyle: 'italic'}} onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('italic', false)}>I</button>
                    <button className="toolbar-icon" style={{textDecoration: 'underline'}} onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('underline', false)}>U</button>
                    <button className="toolbar-icon" onMouseDown={e => e.preventDefault()}>A</button>
                    <button className="toolbar-icon" onMouseDown={e => e.preventDefault()} onClick={() => {
                      const url = prompt('Enter link URL:')
                      if (url) document.execCommand('createLink', false, url)
                    }}>🔗</button>
                    <div className="toolbar-divider"></div>
                    <button className="toolbar-icon" onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('justifyLeft', false)}>≡</button>
                    <button className="toolbar-icon" onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('justifyCenter', false)}>☰</button>
                    <div className="toolbar-divider"></div>
                    <button className="toolbar-icon" onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('insertUnorderedList', false)}>☑</button>
                    <button className="toolbar-icon" onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('insertOrderedList', false)}>1.</button>
                    <button className="toolbar-icon" onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('insertUnorderedList', false)}>•</button>
                    <button className="toolbar-icon" onMouseDown={e => e.preventDefault()}>+</button>
                  </div>
                  <div className="toolbar-right">
                    <span>Last edited: Today</span>
                  </div>
                </div>
                <div className="editor-content-wrapper">
                  <input
                    className="editor-title-input"
                    value={selectedNote?.title === 'New note' ? '' : selectedNote?.title || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNotes(current => current.map(n => n.id === selectedNoteId ? { ...n, title: value } : n))
                    }}
                    placeholder="Title"
                  />
                  <div
                    ref={editorRef}
                    key={selectedNoteId}
                    className="editor-body-new"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(event) => handleNoteChange((event.target as HTMLDivElement).innerHTML)}
                    onInput={(event) => handleNoteChange((event.target as HTMLDivElement).innerHTML)}
                    onKeyDown={handleEditorKeyDown}
                    data-placeholder="Write your text here..."
                  />
                </div>
              </div>
            </div>
          )}

          {activePage === 'settings' && settingsTab === 'Details' && (
            <div className="configuration-page">
              <div className="config-section">
                <h3>Project details</h3>
                <div className="settings-field-row">
                  <span className="settings-label">Project name</span>
                  <div className="settings-value-group">
                    <span className="settings-value">{selectedProject?.name || 'kol'}</span>
                    <button className="icon-button small-edit-btn">✎</button>
                  </div>
                </div>
              </div>

              <div className="config-section border-none">
                <h3>Delete project</h3>
                <p className="settings-warning-text">
                  After deleting this project you will lose all related information<br/>
                  including tasks, events, files, notes etc. You will not be able to<br/>
                  recover it later, so think twice before doing this.
                </p>
                <button className="danger-text-btn" onClick={() => setProjectToDelete(selectedProject)}>
                  🗑 Delete project
                </button>
              </div>
            </div>
          )}

          {activePage === 'settings' && settingsTab === 'Configuration' && (
            <div className="configuration-page">
              <div className="config-section">
                <h3>Task statuses</h3>
                <div className="config-row">
                  <div className="status-flow">
                    <div className="status-badge">
                      <span className="status-color new"></span> New task
                    </div>
                    <span className="arrow">→</span>
                    <div className="status-badge">
                      <span className="status-icon">📅</span> Scheduled
                    </div>
                    <span className="arrow">→</span>
                    <div className="status-badge">
                      <span className="status-icon">🛠</span> In Progress
                    </div>
                    <span className="arrow">→</span>
                    <div className="status-badge completed-badge">
                      <span className="status-icon">✅</span> Completed
                    </div>
                  </div>
                </div>
                <button className="edit-btn" onClick={() => setShowEditStatusesModal(true)}>Edit statuses</button>
              </div>

              <div className="config-section">
                <h3>Task types</h3>
                <div className="config-row">
                  <div className="type-badges">
                    <div className="type-badge"><span className="type-color operational"></span> Operational</div>
                    <div className="type-badge"><span className="type-color health"></span> Health</div>
                    <div className="type-badge"><span className="type-color home"></span> Home and family</div>
                    <div className="type-badge"><span className="type-color finance"></span> Finance</div>
                    <div className="type-badge"><span className="type-color learning"></span> Learning</div>
                    <div className="type-badge"><span className="type-color planning"></span> Planning</div>
                    <div className="type-badge"><span className="type-color strategic"></span> Strategic</div>
                    <div className="type-badge"><span className="type-color technical"></span> Technical</div>
                  </div>
                </div>
                <button className="edit-btn" onClick={() => setShowEditTypesModal(true)}>Edit types</button>
              </div>

              <div className="config-section border-none">
                <h3>Event types</h3>
                <div className="config-row">
                  <div className="type-badges">
                    {eventTypes.map((type) => (
                      <div key={type.name} className="type-badge">
                        <span className="type-color-dot" style={{ background: type.color }}></span> {type.name}
                      </div>
                    ))}
                  </div>
                </div>
                <button className="primary-button small edit-btn" onClick={() => setShowEditEventTypesModal(true)}>Edit types</button>
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
                  <label>Due date <span style={{color: '#ef4444'}}>*</span></label>
                  <input type="date" value={newTaskDue} onChange={(event) => setNewTaskDue(event.target.value)} />
                </div>
                <div className="field-group">
                  <label>Estimated Hours <span style={{color: '#ef4444'}}>*</span></label>
                  <input type="number" min="1" step="0.5" value={newTaskEstimatedHours || ''} onChange={(event) => setNewTaskEstimatedHours(Number(event.target.value))} placeholder="e.g. 5" />
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

      {selectedTask && (
        <div className="task-details-overlay" onClick={() => setSelectedTask(null)}>
          <div className="task-details-panel" onClick={e => e.stopPropagation()}>
            {/* Panel Header */}
            <div className="task-details-header">
              <div className="task-details-breadcrumb">
                <span>{currentProject?.name || 'Project'}</span>
                <span className="breadcrumb-sep">/</span>
                <span>{selectedTask.title}</span>
              </div>
              <div className="task-details-header-actions">
                <button className="task-details-icon-btn" title="More options">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
                <button className="task-details-icon-btn" title="Copy link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                </button>
                <button className="task-details-close-btn" onClick={() => setSelectedTask(null)}>✕</button>
              </div>
            </div>

            <div className="task-details-body">
              {/* Left content */}
              <div className="task-details-left">
                <h1 className="task-details-title">{selectedTask.title}</h1>

                {/* Meta fields */}
                <div className="task-details-fields">
                  <div className="task-details-field">
                    <span className="field-label">Status</span>
                    <div className="field-value">
                      <span className={`task-status-pill status-pill-${selectedTask.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {selectedTask.status === 'In Progress' && '🛠'}
                        {selectedTask.status === 'New Task' && '🆕'}
                        {selectedTask.status === 'Scheduled' && '📅'}
                        {selectedTask.status === 'Completed' && '✅'}
                        {' '}{selectedTask.status}
                      </span>
                    </div>
                  </div>
                  <div className="task-details-field">
                    <span className="field-label">Type</span>
                    <div className="field-value">
                      <span className="type-color-dot" style={{ backgroundColor: '#0d9488' }}></span>
                      {selectedTask.type}
                    </div>
                  </div>
                  <div className="task-details-field">
                    <span className="field-label">Due date</span>
                    <div className="field-value">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {selectedTask.due}
                    </div>
                  </div>
                  <div className="task-details-field">
                    <span className="field-label">Assignee</span>
                    <div className="field-value">
                      <div className="task-details-avatar">{selectedTask.assigneeAvatar}</div>
                      {selectedTask.assignee}
                    </div>
                  </div>
                  <div className="task-details-field">
                    <span className="field-label">Estimated time</span>
                    <div className="field-value">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <strong>{selectedTask.estimatedHours}h</strong>
                      {selectedTask.actualHours !== undefined && (
                        <span className="logged-time"> (logged {selectedTask.actualHours}h)</span>
                      )}
                    </div>
                  </div>
                  <div className="task-details-field">
                    <span className="field-label">Priority</span>
                    <div className="field-value">{selectedTask.priority}</div>
                  </div>
                  {selectedTask.tags.length > 0 && (
                    <div className="task-details-field">
                      <span className="field-label">Tags</span>
                      <div className="field-value task-tags-row">
                        {selectedTask.tags.map(tag => (
                          <span key={tag} className="task-tag-chip">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="task-details-actions">
                  <button className="task-action-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    Add subtask
                  </button>
                  <button className="task-action-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                    Attach file
                  </button>
                  <button className="task-action-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Start timer
                  </button>
                  <button className="task-action-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    Log time
                  </button>
                </div>

                {/* Description */}
                <div className="task-details-description-section">
                  <div className="description-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Description
                  </div>
                  <p className="task-details-description-text">
                    {selectedTask.description || 'Task description'}
                  </p>
                </div>

                {/* Subtasks */}
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <div className="task-details-subtasks-section">
                    <div className="description-header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                      Subtasks ({selectedTask.subtasks.length})
                    </div>
                    <div className="subtasks-list">
                      {selectedTask.subtasks.map((st: any) => (
                        <div key={st.id} className="subtask-item">
                          <span className={`subtask-dot ${st.done ? 'done' : ''}`}></span>
                          <span className={st.done ? 'subtask-done-text' : ''}>{st.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scheduled Work */}
                <div className="task-details-scheduled-section">
                  <div className="description-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Scheduled work <span className="scheduled-count">0</span>
                  </div>
                  <p className="no-work-text">No upcoming work</p>
                  <button className="add-scheduled-work">+ Schedule more work</button>
                </div>
              </div>

              {/* Right: activity feed */}
              <div className="task-details-right">
                <div className="task-chat-messages"></div>
                <div className="task-chat-input-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                  <input className="task-chat-input" placeholder="Type a message..." />
                  <button className="task-chat-send">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {createProjectModal.open && (
        <div className="rename-modal-overlay" onClick={() => setCreateProjectModal({ open: false })}>
          <div className="create-project-modal" onClick={e => e.stopPropagation()}>
            <h3>Create project</h3>
            <input
              autoFocus
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={e => { setNewProjectName(e.target.value); setNewProjectNameError('') }}
              onKeyDown={e => {
                if (e.key === 'Enter') submitCreateProject()
                if (e.key === 'Escape') setCreateProjectModal({ open: false })
              }}
              className={`create-project-input ${newProjectNameError ? 'input-error' : ''}`}
            />
            {newProjectNameError && <p className="modal-error-msg">{newProjectNameError}</p>}
            <div className="create-project-members">
              <span className="members-label">Members <span className="members-count">1</span></span>
              <div className="member-row">
                <div className="member-avatar">
                  <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>M</div>
                  <div className="member-online-dot" />
                </div>
                <span className="member-name">MOHAMED AHMED SALAH</span>
              </div>
              <button className="add-people-btn">+ Add people</button>
            </div>
            <div className="create-project-footer">
              <button className="cancel-btn" onClick={() => setCreateProjectModal({ open: false })}>Cancel</button>
              <button
                className={`create-project-submit-btn ${newProjectName.trim() ? 'active' : ''}`}
                onClick={submitCreateProject}
              >Create project</button>
            </div>
          </div>
        </div>
      )}

      {createFolderModal.open && (
        <div className="rename-modal-overlay" onClick={() => setCreateFolderModal({ open: false, name: '', color: '#3b82f6', icon: 'default' })}>
          <div className="create-project-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3>Create folder</h3>
            <input
              autoFocus
              type="text"
              placeholder="Folder name"
              value={createFolderModal.name}
              onChange={e => setCreateFolderModal(prev => ({ ...prev, name: e.target.value, error: undefined }))}
              onKeyDown={e => {
                if (e.key === 'Enter') submitCreateFolder()
                if (e.key === 'Escape') setCreateFolderModal({ open: false, name: '', color: '#3b82f6', icon: 'default' })
              }}
              className={`create-project-input ${createFolderModal.error ? 'input-error' : ''}`}
            />
            {createFolderModal.error && <p className="modal-error-msg">{createFolderModal.error}</p>}
            <div className="folder-customize-section">
              <p className="folder-customize-label">Color</p>
              <div className="folder-color-palette">
                {['#3b82f6','#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#64748b','#374151'].map(color => (
                  <button key={color} className={`color-swatch ${createFolderModal.color === color ? 'selected' : ''}`} style={{ background: color }} onClick={() => setCreateFolderModal(prev => ({ ...prev, color }))} />
                ))}
                <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                  <button 
                    className="color-swatch"
                    style={{
                      background: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                      position: 'absolute', inset: 0, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <span style={{ 
                      background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '16px', height: '16px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', lineHeight: 1 
                    }}>+</span>
                  </button>
                  <input 
                    type="color" 
                    value={createFolderModal.color}
                    onChange={e => setCreateFolderModal(prev => ({ ...prev, color: e.target.value }))}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  />
                </div>
              </div>
              <p className="folder-customize-label" style={{ marginTop: '14px' }}>Icon</p>
              <button 
                className="browse-icons-btn" 
                onClick={() => setIconPickerState({ open: true, onSelect: (id) => setCreateFolderModal(prev => ({ ...prev, icon: id })) })}
              >
                Browse Icons Library (10,000+)
              </button>
            </div>
            <div className="folder-preview">
              <FolderSVG color={createFolderModal.color} icon={createFolderModal.icon} size={48} />
              <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>Preview</span>
            </div>
            <div className="create-project-footer">
              <button className="cancel-btn" onClick={() => setCreateFolderModal({ open: false, name: '', color: '#3b82f6', icon: 'default' })}>Cancel</button>
              <button className={`create-project-submit-btn ${createFolderModal.name.trim() ? 'active' : ''}`} onClick={submitCreateFolder}>Create folder</button>
            </div>
          </div>
        </div>
      )}

      {customizeFolder && (
        <div className="rename-modal-overlay" onClick={() => setCustomizeFolder(null)}>
          <div className="create-project-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3>Customize folder</h3>
            <div className="folder-customize-section">
              <p className="folder-customize-label">Color</p>
              <div className="folder-color-palette">
                {['#3b82f6','#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#64748b','#374151'].map(color => (
                  <button key={color} className={`color-swatch ${(customizeFolder.color || '#3b82f6') === color ? 'selected' : ''}`} style={{ background: color }} onClick={() => { setCustomizeFolder((prev: any) => ({ ...prev, color })); setFolders(flds => flds.map(f => f.id === customizeFolder.id ? { ...f, color } : f)); }} />
                ))}
                <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                  <button 
                    className="color-swatch"
                    style={{
                      background: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                      position: 'absolute', inset: 0, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <span style={{ 
                      background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '16px', height: '16px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', lineHeight: 1 
                    }}>+</span>
                  </button>
                  <input 
                    type="color" 
                    value={customizeFolder.color || '#3b82f6'}
                    onChange={e => {
                      const newColor = e.target.value;
                      setCustomizeFolder((prev: any) => ({ ...prev, color: newColor }));
                      setFolders(flds => flds.map(f => f.id === customizeFolder.id ? { ...f, color: newColor } : f));
                    }}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  />
                </div>
              </div>
              <p className="folder-customize-label" style={{ marginTop: '14px' }}>Icon</p>
              <button 
                className="browse-icons-btn" 
                onClick={() => setIconPickerState({ open: true, onSelect: (id) => {
                  setCustomizeFolder((prev: any) => ({ ...prev, icon: id }))
                  setFolders(flds => flds.map(f => f.id === customizeFolder.id ? { ...f, icon: id } : f))
                }})}
              >
                Browse Icons Library (10,000+)
              </button>
            </div>
            <div className="folder-preview">
              <FolderSVG color={customizeFolder.color || '#3b82f6'} icon={customizeFolder.icon || 'default'} size={48} />
              <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>Preview</span>
            </div>
            <div className="create-project-footer">
              <button className="cancel-btn" onClick={() => setCustomizeFolder(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {folderToRename && (
        <div className="rename-modal-overlay" onClick={() => setFolderToRename(null)}>
          <div className="rename-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Rename folder</h3>
            <input 
              autoFocus
              type="text" 
              value={folderToRename.name} 
              onChange={e => setFolderToRename({ ...folderToRename, name: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRenameFolder(folderToRename.name);
                if (e.key === 'Escape') setFolderToRename(null);
              }}
            />
            <div className="rename-modal-actions">
              <button className="cancel-btn" onClick={() => setFolderToRename(null)}>Cancel</button>
              <button 
                className={`save-btn ${folderToRename.name.trim() ? 'active' : ''}`} 
                onClick={() => handleRenameFolder(folderToRename.name)}
                disabled={!folderToRename.name.trim()}
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {folderToDelete && (
        <div className="rename-modal-overlay" onClick={() => setFolderToDelete(null)}>
          <div className="rename-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete folder</h3>
            <p className="delete-modal-text">Are you sure you want to delete the whole folder?</p>
            <div className="rename-modal-actions">
              <button className="cancel-btn" onClick={() => setFolderToDelete(null)}>Cancel</button>
              <button className="delete-modal-btn" onClick={confirmDeleteFolder}>Delete folder</button>
            </div>
          </div>
        </div>
      )}

      {projectToDelete && (
        <div className="rename-modal-overlay" onClick={() => setProjectToDelete(null)}>
          <div className="rename-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete project</h3>
            <p className="delete-modal-text">Are you sure you want to permanently delete this project?</p>
            <div className="delete-project-info">
              <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.6rem' }}>M</div>
              <span className="delete-project-name">{projectToDelete.name}</span>
            </div>
            <div className="rename-modal-actions">
              <button className="cancel-btn" onClick={() => setProjectToDelete(null)}>Cancel</button>
              <button className="delete-modal-btn" onClick={confirmDeleteProject}>Delete project</button>
            </div>
          </div>
        </div>
      )}

      {showCompletionModal && (
        <div className="completion-modal-overlay" onClick={handleCompletionCancel}>
          <div className="completion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="completion-modal-header">
              <h2 className="completion-modal-title">How much time did the task take?</h2>
              <div className="completion-inputs-row">
                <div className="completion-input-group">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} style={{ width: '110px', background: 'transparent', border: 'none', color: '#fff' }} />
                </div>
                <div className="completion-input-group">
                  <select value={completionMode} onChange={(e) => setCompletionMode(e.target.value)}>
                    <option value="Manual time">Manual time</option>
                    <option value="Timer">Timer</option>
                  </select>
                </div>
                <div className="completion-input-group">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"></path>
                  </svg>
                  <input type="text" value={`${completionHours}h`} onChange={(e) => setCompletionHours(e.target.value.replace('h', ''))} style={{ width: '30px' }} />
                </div>
                <button type="button" className="completion-icon-btn">
                  $
                </button>
                <div className="completion-avatar">M</div>
                <button type="button" className="completion-close-btn" onClick={handleCompletionCancel}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div className="completion-modal-body">
              <div className="completion-stats">
                <div className="completion-stat-item">
                  <div className="stat-dot logged"></div>
                  <span>Logged time: <strong style={{color:'#fff'}}>{completionHours}h</strong></span>
                </div>
                <div className="completion-stat-item">
                  <div className="stat-dot estimated"></div>
                  <span>Estimated time: <strong style={{color:'#fff'}}>{pendingTaskEstimated}</strong></span>
                </div>
              </div>
              <div className="completion-progress-bar">
                <div className="completion-progress-fill" style={{ width: `${Math.min(100, (parseFloat(completionHours) || 0) / 8 * 100)}%` }}></div>
              </div>
            </div>
            <div className="completion-modal-footer">
              <button type="button" className="completion-cancel-btn" onClick={handleCompletionCancel}>
                Cancel
              </button>
              <button type="button" className="completion-save-btn" onClick={handleCompletionSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditStatusesModal && (
        <div className="status-modal-overlay" onClick={() => setShowEditStatusesModal(false)}>
          <div className="status-modal" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}>
            <div className="status-modal-header">
              <h2>Edit statuses</h2>
            </div>
            <div className="status-modal-body">
              <div className="status-group-section">
                <p className="status-group-title">Open</p>
                {taskStatuses.filter(s => s.group === 'Open').map(status => (
                  <div key={status.id} className="status-item-row">
                    <span className="drag-handle">⋮⋮</span>
                    <div className={`status-badge-inline ${status.isCompleted ? 'completed-badge' : ''}`}>
                      {status.icon ? (
                        <span className="status-icon">{status.icon}</span>
                      ) : status.isNew ? (
                        <span className="status-color new"></span>
                      ) : null}
                    </div>
                    <span className="status-name">{status.name}</span>
                    {status.isDefault && <span className="status-default">default</span>}
                    {renderMenu(
                      status.id, 
                      'task status',
                      () => setEditingTaskStatus({ id: status.id, name: status.name, icon: status.icon }),
                      () => setTaskStatuses(current => current.filter(s => s.id !== status.id))
                    )}
                  </div>
                ))}
                <button className="add-status-btn" onClick={() => setShowAddTaskStatusModal(true)}>
                  + Add task status
                </button>
              </div>
              <div className="status-group-section border-top">
                <p className="status-group-title">Closed</p>
                {taskStatuses.filter(s => s.group === 'Closed').map(status => (
                  <div key={status.id} className="status-item-row">
                    <span className="drag-handle">⋮⋮</span>
                    <div className={`status-badge-inline ${status.isCompleted ? 'completed-badge' : ''}`}>
                      {status.icon ? (
                        <span className="status-icon">{status.icon}</span>
                      ) : status.isNew ? (
                        <span className="status-color new"></span>
                      ) : null}
                    </div>
                    <span className="status-name">{status.name}</span>
                    {status.isDefault && <span className="status-default">default</span>}
                    {renderMenu(
                      status.id, 
                      'task status',
                      () => setEditingTaskStatus({ id: status.id, name: status.name, icon: status.icon }),
                      () => setTaskStatuses(current => current.filter(s => s.id !== status.id))
                    )}
                  </div>
                ))}
                <button className="add-status-btn" onClick={() => setShowAddTaskStatusModal(true)}>
                  + Add task status
                </button>
              </div>
            </div>
            <div className="status-modal-footer">
              <button className="status-cancel-btn" onClick={() => setShowEditStatusesModal(false)}>Cancel</button>
              <button className="status-save-btn">Save</button>
            </div>
          </div>
        </div>
      )}

      {showAddTaskStatusModal && (
        <div className="status-modal-overlay" onClick={() => setShowAddTaskStatusModal(false)}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header split">
              <h2>Add task status</h2>
              <button className="status-secondary-btn" onClick={() => setShowCreateTaskStatusModal(true)}>+ Create new</button>
            </div>
            <div className="status-modal-body">
              <div className="status-search-box">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search" />
              </div>
              <p className="status-empty-text">No available task statuses</p>
            </div>
            <div className="status-modal-footer">
              <button className="status-cancel-btn" onClick={() => setShowAddTaskStatusModal(false)}>Cancel</button>
              <button className="status-save-btn disabled">Add task statuses</button>
            </div>
          </div>
        </div>
      )}

      {showCreateTaskStatusModal && (
        <div className="status-modal-overlay" onClick={() => setShowCreateTaskStatusModal(false)}>
          <div className="status-modal create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header">
              <h2>Create task status</h2>
            </div>
            <div className="status-modal-body">
              <div className="create-status-input-row">
                <button className="status-icon-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </button>
                <input 
                  type="text" 
                  className="create-status-input" 
                  placeholder="Status name"
                  value={createStatusName}
                  onChange={(e) => setCreateStatusName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="status-group-toggle-section">
                <label>Status group</label>
                <div className="status-group-toggle">
                  <button 
                    className={`toggle-btn ${createStatusGroup === 'Open' ? 'active' : ''}`}
                    onClick={() => setCreateStatusGroup('Open')}
                  >Open</button>
                  <button 
                    className={`toggle-btn ${createStatusGroup === 'Closed' ? 'active' : ''}`}
                    onClick={() => setCreateStatusGroup('Closed')}
                  >Closed</button>
                </div>
              </div>
            </div>
            <div className="status-modal-footer">
              <button className="status-cancel-btn" onClick={() => setShowCreateTaskStatusModal(false)}>Cancel</button>
              <button className={`status-save-btn ${createStatusName ? '' : 'disabled'}`}>Create task status</button>
            </div>
          </div>
        </div>
      )}

      {showEditTypesModal && (
        <div className="status-modal-overlay" onClick={() => setShowEditTypesModal(false)}>
          <div className="status-modal" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}>
            <div className="status-modal-header">
              <h2>Edit types</h2>
            </div>
            <div className="status-modal-body">
              {taskTypes.map((type) => (
                <div key={type.name} className="status-item-row">
                  <span className="drag-handle">⋮⋮</span>
                  <div className="type-color-circle" style={{ background: type.color }}></div>
                  <span className="status-name">{type.name}</span>
                  {renderMenu(
                    `type-${type.name}`, 
                    'task type',
                    () => setEditingTaskType({ originalName: type.name, name: type.name, color: type.color }),
                    () => setTaskTypes(current => current.filter(t => t.name !== type.name))
                  )}
                </div>
              ))}
              <button className="add-status-btn" onClick={() => setShowAddTaskTypeModal(true)}>
                + Add task type
              </button>
            </div>
            <div className="status-modal-footer">
              <button className="status-cancel-btn" onClick={() => setShowEditTypesModal(false)}>Cancel</button>
              <button className="status-save-btn">Save</button>
            </div>
          </div>
        </div>
      )}

      {showAddTaskTypeModal && (
        <div className="status-modal-overlay" onClick={() => setShowAddTaskTypeModal(false)}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header split">
              <h2>Add task type</h2>
              <button className="status-secondary-btn" onClick={() => setShowCreateTaskTypeModal(true)}>+ Create new</button>
            </div>
            <div className="status-modal-body">
              <div className="status-search-box">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search" />
              </div>
              <p className="status-empty-text">No available task types</p>
            </div>
            <div className="status-modal-footer">
              <button className="status-cancel-btn" onClick={() => setShowAddTaskTypeModal(false)}>Cancel</button>
              <button className="status-save-btn disabled">Add task types</button>
            </div>
          </div>
        </div>
      )}

      {showCreateTaskTypeModal && (
        <div className="status-modal-overlay" onClick={() => { setShowCreateTaskTypeModal(false); setShowColorPicker(false) }}>
          <div className="status-modal create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header">
              <h2>Create task type</h2>
            </div>
            <div className="status-modal-body">
              <div className="create-status-input-row" style={{ position: 'relative' }}>
                <button 
                  className="status-icon-btn"
                  style={{ background: selectedTypeColor, border: 'none' }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </button>
                {showColorPicker && (
                  <div className="color-picker-popup">
                    {typeColors.map((color) => (
                      <button
                        key={color}
                        className={`color-swatch ${selectedTypeColor === color ? 'selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => { setSelectedTypeColor(color); setShowColorPicker(false) }}
                      />
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  className={`create-status-input ${createTypeName ? '' : 'error-outline'}`}
                  placeholder="Type name"
                  value={createTypeName}
                  onChange={(e) => setCreateTypeName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="status-modal-footer">
              <button className="status-cancel-btn" onClick={() => setShowCreateTaskTypeModal(false)}>Cancel</button>
              <button className={`status-save-btn ${createTypeName ? '' : 'disabled'}`}>Create task type</button>
            </div>
          </div>
        </div>
      )}

      {showEditEventTypesModal && (
        <div className="status-modal-overlay" onClick={() => setShowEditEventTypesModal(false)}>
          <div className="status-modal" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}>
            <div className="status-modal-header">
              <h2>Edit types</h2>
            </div>
            <div className="status-modal-body">
              {eventTypes.map((type) => (
                <div key={type.name} className="status-item-row">
                  <span className="drag-handle">⋮⋮</span>
                  <div className="type-color-circle" style={{ background: type.color }}></div>
                  <span className="status-name">{type.name}</span>
                  {renderMenu(
                    `event-${type.name}`, 
                    'event type', 
                    () => setEditingEventType({ originalName: type.name, name: type.name, color: type.color }),
                    () => setEventTypes(current => current.filter(t => t.name !== type.name))
                  )}
                </div>
              ))}
              <button className="add-status-btn" onClick={() => setShowAddEventTypeModal(true)}>
                + Add event type
              </button>
            </div>
            <div className="status-modal-footer">
              <button className="status-cancel-btn" onClick={() => setShowEditEventTypesModal(false)}>Cancel</button>
              <button className="status-save-btn">Save</button>
            </div>
          </div>
        </div>
      )}

      {showAddEventTypeModal && (
        <div className="status-modal-overlay" onClick={() => setShowAddEventTypeModal(false)}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header split">
              <h2>Add event type</h2>
              <button className="status-secondary-btn" onClick={() => setShowCreateEventTypeModal(true)}>+ Create new</button>
            </div>
            <div className="status-modal-body">
              <div className="status-search-box">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search" />
              </div>
              <p className="status-empty-text">No available event types</p>
            </div>
            <div className="status-modal-footer">
              <button className="status-cancel-btn" onClick={() => setShowAddEventTypeModal(false)}>Cancel</button>
              <button className="status-save-btn disabled">Add event types</button>
            </div>
          </div>
        </div>
      )}

      {showCreateEventTypeModal && (
        <div className="status-modal-overlay" onClick={() => { setShowCreateEventTypeModal(false); setShowEventColorPicker(false) }}>
          <div className="status-modal create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header">
              <h2>Create event type</h2>
            </div>
            <div className="status-modal-body">
              <div className="create-status-input-row" style={{ position: 'relative' }}>
                <button
                  className="status-icon-btn"
                  style={{ background: selectedEventTypeColor, border: 'none' }}
                  onClick={() => setShowEventColorPicker(!showEventColorPicker)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </button>
                {showEventColorPicker && (
                  <div className="color-picker-popup">
                    {typeColors.map((color) => (
                      <button
                        key={color}
                        className={`color-swatch ${selectedEventTypeColor === color ? 'selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => { setSelectedEventTypeColor(color); setShowEventColorPicker(false) }}
                      />
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  className={`create-status-input ${createEventTypeName ? '' : 'error-outline'}`}
                  placeholder="Type name"
                  value={createEventTypeName}
                  onChange={(e) => setCreateEventTypeName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="status-modal-footer">
              <button className="status-cancel-btn" onClick={() => setShowCreateEventTypeModal(false)}>Cancel</button>
              <button
                className={`status-save-btn ${createEventTypeName ? '' : 'disabled'}`}
                onClick={() => {
                  if (createEventTypeName.trim()) {
                    setEventTypes(current => [...current, { name: createEventTypeName.trim(), color: selectedEventTypeColor }])
                    setCreateEventTypeName('')
                    setSelectedEventTypeColor('#3b82f6')
                    setShowCreateEventTypeModal(false)
                    setShowAddEventTypeModal(false)
                  }
                }}
              >Create event type</button>
            </div>
          </div>
        </div>
      )}

      {editingEventType && (
        <div className="status-modal-overlay" onClick={() => { setEditingEventType(null); setShowEventColorPicker(false) }}>
          <div className="status-modal create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header">
              <h2>Edit event type</h2>
            </div>
            <div className="status-modal-body">
              <div className="create-status-input-row" style={{ position: 'relative', marginBottom: '8px' }}>
                <button
                  className="status-icon-btn"
                  style={{ background: editingEventType.color, border: 'none' }}
                  onClick={() => setShowEventColorPicker(!showEventColorPicker)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </button>
                {showEventColorPicker && (
                  <div className="color-picker-popup">
                    {typeColors.map((color) => (
                      <button
                        key={color}
                        className={`color-swatch ${editingEventType.color === color ? 'selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => { setEditingEventType({ ...editingEventType, color }); setShowEventColorPicker(false) }}
                      />
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  className={`create-status-input ${editingEventType.name ? '' : 'error-outline'}`}
                  placeholder="Type name"
                  value={editingEventType.name}
                  onChange={(e) => setEditingEventType({ ...editingEventType, name: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
            <div className="status-modal-footer split" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Used in 1 place</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="status-cancel-btn" onClick={() => setEditingEventType(null)}>Cancel</button>
                <button
                  className={`status-save-btn ${editingEventType.name ? '' : 'disabled'}`}
                  onClick={() => {
                    if (editingEventType.name.trim()) {
                      setEventTypes(current => current.map(t => 
                        t.name === editingEventType.originalName 
                          ? { name: editingEventType.name.trim(), color: editingEventType.color }
                          : t
                      ))
                      setEditingEventType(null)
                    }
                  }}
                >Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingTaskType && (
        <div className="status-modal-overlay" onClick={() => { setEditingTaskType(null); setShowColorPicker(false) }}>
          <div className="status-modal create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header">
              <h2>Edit task type</h2>
            </div>
            <div className="status-modal-body">
              <div className="create-status-input-row" style={{ position: 'relative', marginBottom: '8px' }}>
                <button
                  className="status-icon-btn"
                  style={{ background: editingTaskType.color, border: 'none' }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </button>
                {showColorPicker && (
                  <div className="color-picker-popup">
                    {typeColors.map((color) => (
                      <button
                        key={color}
                        className={`color-swatch ${editingTaskType.color === color ? 'selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => { setEditingTaskType({ ...editingTaskType, color }); setShowColorPicker(false) }}
                      />
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  className={`create-status-input ${editingTaskType.name ? '' : 'error-outline'}`}
                  placeholder="Type name"
                  value={editingTaskType.name}
                  onChange={(e) => setEditingTaskType({ ...editingTaskType, name: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
            <div className="status-modal-footer split" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Used in 1 place</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="status-cancel-btn" onClick={() => setEditingTaskType(null)}>Cancel</button>
                <button
                  className={`status-save-btn ${editingTaskType.name ? '' : 'disabled'}`}
                  onClick={() => {
                    if (editingTaskType.name.trim()) {
                      setTaskTypes(current => current.map(t => 
                        t.name === editingTaskType.originalName 
                          ? { name: editingTaskType.name.trim(), color: editingTaskType.color }
                          : t
                      ))
                      setEditingTaskType(null)
                    }
                  }}
                >Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingTaskStatus && (
        <div className="status-modal-overlay" onClick={() => { setEditingTaskStatus(null); setShowStatusEmojiPicker(false) }}>
          <div className="status-modal create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header">
              <h2>Edit task status</h2>
            </div>
            <div className="status-modal-body">
              <div className="create-status-input-row" style={{ position: 'relative', marginBottom: '8px' }}>
                <button
                  className="status-icon-btn"
                  onClick={() => setShowStatusEmojiPicker(!showStatusEmojiPicker)}
                >
                  {editingTaskStatus.icon || (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  )}
                </button>
                {showStatusEmojiPicker && (
                  <div className="color-picker-popup" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        className="color-swatch"
                        style={{ background: 'transparent', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => { setEditingTaskStatus({ ...editingTaskStatus, icon: emoji }); setShowStatusEmojiPicker(false) }}
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      className="color-swatch"
                      style={{ background: 'transparent', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gridColumn: 'span 4' }}
                      onClick={() => { setEditingTaskStatus({ ...editingTaskStatus, icon: null }); setShowStatusEmojiPicker(false) }}
                    >
                      Clear
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  className={`create-status-input ${editingTaskStatus.name ? '' : 'error-outline'}`}
                  placeholder="Status name"
                  value={editingTaskStatus.name}
                  onChange={(e) => setEditingTaskStatus({ ...editingTaskStatus, name: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
            <div className="status-modal-footer split" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Used in 1 place</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="status-cancel-btn" onClick={() => setEditingTaskStatus(null)}>Cancel</button>
                <button
                  className={`status-save-btn ${editingTaskStatus.name ? '' : 'disabled'}`}
                  onClick={() => {
                    if (editingTaskStatus.name.trim()) {
                      setTaskStatuses(current => current.map(s => 
                        s.id === editingTaskStatus.id 
                          ? { ...s, name: editingTaskStatus.name.trim(), icon: editingTaskStatus.icon }
                          : s
                      ))
                      setEditingTaskStatus(null)
                    }
                  }}
                >Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ICON PICKER MODAL */}
      {iconPickerState?.open && (
        <div className="rename-modal-overlay" onClick={() => setIconPickerState(null)} style={{ zIndex: 1000 }}>
          <div className="icon-picker-modal" onClick={e => e.stopPropagation()}>
            <div className="icon-picker-header">
              <h3>Select Icon</h3>
              <input 
                type="text" 
                placeholder="Search 10,000+ icons..." 
                className="icon-search-input"
                value={iconSearchQuery}
                onChange={e => setIconSearchQuery(e.target.value)}
              />
            </div>
            <div className="icon-picker-body">
              <div className="icon-categories-sidebar">
                {ICON_CATEGORIES.map(cat => (
                  <button 
                    key={cat.id} 
                    className={`icon-cat-btn ${activeIconCategory === cat.id ? 'active' : ''}`}
                    onClick={() => { setActiveIconCategory(cat.id); setIconSearchQuery(''); }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="icon-grid-scrollarea">
                {ICON_CATEGORIES.map(cat => {
                  if (iconSearchQuery) return null;
                  if (cat.id !== activeIconCategory) return null;
                  return (
                    <div className="icon-grid-massive" key={cat.id}>
                      {cat.icons.map(iconDef => {
                        const IconComp = iconDef.icon;
                        return (
                          <button 
                            key={iconDef.id} 
                            className="massive-icon-btn" 
                            title={iconDef.name}
                            onClick={() => {
                              iconPickerState.onSelect(iconDef.id);
                              setIconPickerState(null);
                            }}
                          >
                            <IconComp size={24} />
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
                {iconSearchQuery && (
                  <div className="icon-grid-massive">
                    {ICON_CATEGORIES.flatMap(c => c.icons).filter(i => i.name.toLowerCase().includes(iconSearchQuery.toLowerCase())).map(iconDef => {
                      const IconComp = iconDef.icon;
                      return (
                        <button 
                          key={iconDef.id} 
                          className="massive-icon-btn" 
                          title={iconDef.name}
                          onClick={() => {
                            iconPickerState.onSelect(iconDef.id);
                            setIconPickerState(null);
                          }}
                        >
                          <IconComp size={24} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="create-project-footer" style={{ borderTop: '1px solid #2d2f36', padding: '16px', marginTop: 0 }}>
              <button className="cancel-btn" onClick={() => setIconPickerState(null)} style={{ marginLeft: 'auto' }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

