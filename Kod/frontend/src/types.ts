export type Visibility = "public" | "private";

export type ProjectStatus = "open" | "completed";

export type TaskStatus = "todo" | "done";

export type ParticipationStatus = "confirmed" | "pending";

export interface User {
  user_id: number;
  name: string;
  surname: string;
  email: string;
  username: string;
  description: string;
  role: "user" | "admin";
  tags?: string[];
}

export interface FileItem {
  file_id?: number;
  project_file_id?: number;
  post_id?: number;
  project_id?: number;
  file_name: string;
  file_path: string;
  file_type: string;
}

export interface Post {
  post_id: number;
  user_id: number;
  title: string;
  description: string;
  concept: string;
  result: string;
  visibility: Visibility;
  created_at: string;
  username: string;
  file: FileItem | null;
  tags?: string[];
}

export interface ProjectParticipant {
  participant_id: number;
  user_id: number;
  username: string;
  role_name: string;
  participation_status: ParticipationStatus;
}

export interface ProjectTask {
  task_id: number;
  title: string;
  status: TaskStatus;
}

export interface ParticipationPost {
  post_id: number;
  user_id: number;
  title: string;
  description: string;
  username: string;
  file: FileItem | null;
}

export interface Comment {
  comment_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

export interface Project {
  project_id: number;
  title: string;
  overview: string | null;
  progress_percent: number;
  status: ProjectStatus;
  deadline: string | null;
  created_at: string;
  username: string;
  file: FileItem | null;
  lookingFor?: string[];
}

export interface ProjectDetail {
  project_id: number;
  title: string;
  overview: string;
  progress_percent: number;
  status: ProjectStatus;
  deadline: string | null;
  owner: {
    user_id: number;
    username: string;
  };
  tags: string[];
  lookingFor: string[];
  created_at: string;
  file: FileItem | null;
  participants: ProjectParticipant[];
  tasks: ProjectTask[];
}
