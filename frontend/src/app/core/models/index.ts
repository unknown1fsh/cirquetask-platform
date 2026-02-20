// Auth Models
export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

// User
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// Project
export interface Project {
  id: number;
  name: string;
  description?: string;
  prefix: string;
  color: string;
  icon: string;
  isArchived: boolean;
  owner: User;
  memberCount: number;
  taskCount: number;
  members?: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
  prefix: string;
  color?: string;
  icon?: string;
}

export interface Member {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: ProjectRole;
  joinedAt: string;
}

export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

// Board
export interface Board {
  id: number;
  name: string;
  description?: string;
  projectId: number;
  position: number;
  isDefault: boolean;
  columns: Column[];
  createdAt: string;
}

export interface Column {
  id: number;
  name: string;
  color: string;
  position: number;
  wipLimit: number;
  isDoneColumn: boolean;
  tasks: Task[];
}

// Task
export interface Task {
  id: number;
  title: string;
  description?: string;
  taskKey: string;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  storyPoints: number;
  columnId?: number;
  position: number;
  projectId: number;
  reporter: User;
  assignees: User[];
  labels: Label[];
  parentTaskId?: number;
  subtasks?: Task[];
  commentCount: number;
  attachmentCount: number;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  type?: TaskType;
  storyPoints?: number;
  columnId?: number;
  assigneeIds?: number[];
  labelIds?: number[];
  parentTaskId?: number;
  dueDate?: string;
}

export interface TaskMoveRequest {
  columnId: number;
  position: number;
}

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type TaskType = 'TASK' | 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'EPIC';

// Label
export interface Label {
  id: number;
  name: string;
  color: string;
}

// Attachment
export interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  contentType?: string;
  taskId: number;
  uploadedBy?: User;
  createdAt: string;
}

// Comment
export interface Comment {
  id: number;
  content: string;
  author: User;
  taskId: number;
  parentCommentId?: number;
  replies?: Comment[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRequest {
  content: string;
  parentCommentId?: number;
}

// Notification
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  sender?: User;
  projectId?: number;
  taskId?: number;
  createdAt: string;
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'COMMENT_ADDED'
  | 'MEMBER_ADDED'
  | 'PROJECT_UPDATED'
  | 'MENTION'
  | 'DEADLINE_APPROACHING';

// Activity Log
export interface ActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  description: string;
  oldValue?: string;
  newValue?: string;
  user: User;
  projectId?: number;
  createdAt: string;
}

// Billing / Plan
export type Plan = 'FREE' | 'PRO' | 'BUSINESS';
export type Feature = 'GANTT' | 'REPORTS' | 'CUSTOM_FIELDS' | 'TIME_LOG' | 'API_ACCESS';

export interface PlanDto {
  plan: Plan;
  subscriptionStatus?: string;
  currentPeriodEnd?: string;
  maxProjects: number;
  maxMembersPerProject: number;
  currentProjectCount: number;
  currentMembersInProject: number;
  enabledFeatures: Feature[];
}

// Dashboard
export interface Dashboard {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  recentActivities: ActivityLog[];
  upcomingDeadlines?: Task[];
  myTasks?: Task[];
}
