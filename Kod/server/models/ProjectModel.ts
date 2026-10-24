import { title } from "process";
import db from "../config/DB";
import { ProjectStatus } from "../types/Types";

const ProjectModel = {
  async createProject(
    ownerUserId: number,
    title: string,
    overview: string,
    progressPercent: number,
    status: ProjectStatus,
    deadline: string | null,
  ) {
    const sql = ` INSERT INTO projects
      (owner_user_id, title, overview, progress_percent, status, deadline)
      VALUES (?, ?, ?, ?, ?, ?)`;

    const [dbResult]: any = await db.query(sql, [
      ownerUserId,
      title,
      overview,
      progressPercent,
      status,
      deadline,
    ]);

    return dbResult.insertId;
  },

  async insertFile(
    projectId: number,
    fileName: string,
    filePath: string,
    fileType: string,
  ) {
    const sql = `INSERT INTO project_files (project_id, file_name, file_path, file_type) VALUES (?, ?, ?, ?)`;

    await db.query(sql, [projectId, fileName, filePath, fileType]);
  },

  async insertTasks(projectId: number, tasks: any[]) {
    if (!tasks || tasks.length === 0) return;

    const values = tasks
      .filter((task) => task.title?.trim())
      .map((task) => [projectId, task.title, task.status || "todo"]);

    if (values.length === 0) return;

    await db.query(
      `INSERT INTO project_tasks (project_id, title, status) VALUES ?`,
      [values],
    );
  },

  async insertTags(projectId: number, tags: string[]) {
    if (!tags || tags.length === 0) return;

    const values = tags.map((tag) => [projectId, tag]);

    await db.query(`INSERT INTO project_tags (project_id, tag_name) VALUES ?`, [
      values,
    ]);
  },

  async insertSkills(projectId: number, skills: string[]) {
    if (!skills || skills.length === 0) return;

    const values = skills.map((skill) => [projectId, skill]);

    await db.query(
      `INSERT INTO project_skills_needed (project_id, skill_name) VALUES ?`,
      [values],
    );
  },

  async insertParticipants(projectId: number, participants: any[]) {
    if (!participants || participants.length === 0) return;

    const values = participants.map((participant) => [
      projectId,
      participant.user_id,
      participant.role_name || "Teammate",
      "confirmed",
    ]);

    await db.query(
      `INSERT INTO project_participants (project_id, user_id, role_name, participation_status) VALUES ?`,
      [values],
    );
  },

  async getPublicProjects() {
    const sql = `SELECT projects.*, users.username
    FROM projects
    JOIN users  ON projects.owner_user_id = users.user_id
    ORDER BY projects.created_at DESC`;

    const [projects]: any = await db.query(sql);

    if (projects.length === 0) return [];

    const projectIds = projects.map((project: any) => project.project_id);

    const [files]: any = await db.query(
      `SELECT * FROM project_files WHERE project_id IN (?)`,
      [projectIds],
    );

    const [skills]: any = await db.query(
      `SELECT * FROM project_skills_needed WHERE project_id IN (?)`,
      [projectIds],
    );

    return projects.map((project: any) => ({
      ...project,
      file:
        files.find((file: any) => file.project_id === project.project_id) ||
        null,
      lookingFor: skills
        .filter((skill: any) => skill.project_id === project.project_id)
        .map((skill: any) => skill.skill_name),
    }));
  },

  async getUserProjects(userId: number) {
    const sql = `SELECT DISTINCT projects.*, users.username
    FROM projects 
    JOIN users ON projects.owner_user_id = users.user_id
    LEFT JOIN project_participants  ON projects.project_id = project_participants.project_id
    WHERE projects.owner_user_id = ? OR project_participants.user_id = ?
    ORDER BY projects.created_at DESC`;

    const [projects]: any = await db.query(sql, [userId, userId]);

    if (projects.length === 0) return [];

    const projectIds = projects.map((project: any) => project.project_id);

    const [files]: any = await db.query(
      `SELECT * FROM project_files WHERE project_id IN (?)`,
      [projectIds],
    );

    const [skills]: any = await db.query(
      `SELECT * FROM project_skills_needed WHERE project_id IN (?)`,
      [projectIds],
    );

    return projects.map((project: any) => ({
      ...project,
      file:
        files.find((file: any) => file.project_id === project.project_id) ||
        null,
      lookingFor: skills
        .filter((skill: any) => skill.project_id === project.project_id)
        .map((skill: any) => skill.skill_name),
    }));
  },

  async getProjectById(projectId: number) {
    const sql = `SELECT projects.*, users.user_id, users.username FROM projects JOIN users ON projects.owner_user_id=users.user_id WHERE projects.project_id=?`;

    const [projects]: any = await db.query(sql, [projectId]);

    if (projects.length === 0) return null;

    const project = projects[0];

    const [tags]: any = await db.query(
      `SELECT * FROM project_tags WHERE project_id = ?`,
      [projectId],
    );

    const [skills]: any = await db.query(
      `SELECT * FROM project_skills_needed WHERE project_id IN (?)`,
      [projectId],
    );

    const [files]: any = await db.query(
      `SELECT * FROM project_files WHERE project_id IN (?)`,
      [projectId],
    );

    const [tasks]: any = await db.query(
      `SELECT * FROM project_tasks WHERE project_id = ?`,
      [projectId],
    );

    const [participants]: any = await db.query(
      `SELECT project_participants.participant_id, project_participants.user_id, project_participants.role_name, project_participants.participation_status, users.username
                  FROM project_participants
                  JOIN users ON project_participants.user_id = users.user_id
                  WHERE project_participants.project_id = ?`,
      [projectId],
    );

    return {
      project_id: project.project_id,
      title: project.title,
      overview: project.overview,
      progress_percent: project.progress_percent,
      status: project.status,
      deadline: project.deadline,
      owner: {
        user_id: project.user_id,
        username: project.username,
      },
      tags: tags.map((tag: any) => tag.tag_name),
      lookingFor: skills.map((skill: any) => skill.skill_name),
      file: files[0] || null,
      tasks,
      participants,
      created_at: project.created_at,
    };
  },

  async getParticipationPosts(projectId: number) {
    const [projectResult]: any = await db.query(
      `
    SELECT owner_user_id
    FROM projects
    WHERE project_id = ?
    `,
      [projectId],
    );

    if (projectResult.length === 0) return [];

    const ownerUserId = projectResult[0].owner_user_id;

    const [participantsResult]: any = await db.query(
      `
    SELECT user_id
    FROM project_participants
    WHERE project_id = ?
      AND participation_status = 'confirmed'
    `,
      [projectId],
    );

    const [posts]: any = await db.query(
      `
    SELECT posts.*, users.username
    FROM posts
    JOIN users ON posts.user_id = users.user_id
    WHERE posts.project_id IN (?)
      AND posts.visibility = 'public'
    ORDER BY posts.created_at DESC
    `,
      [projectId],
    );

    if (posts.length === 0) return [];

    const postIds = posts.map((post: any) => post.post_id);

    const [files]: any = await db.query(
      `
    SELECT *
    FROM files
    WHERE post_id IN (?)
    `,
      [postIds],
    );

    return posts.map((post: any) => ({
      ...post,
      file: files.find((file: any) => file.post_id === post.post_id) || null,
    }));
  },

  async createJoinRequest(projectId: number, userId: number, message: string) {
    const [result]: any = await db.query(
      `
    INSERT INTO project_join_request
    (project_id, user_id, status)
    VALUES (?, ?,  'pending')
    `,
      [projectId, userId],
    );

    return result.insertId;
  },

  async createJoinRequestNotification(ownerUserId: number, requestId: number) {
    await db.query(
      `
    INSERT INTO notifications
    (user_id, type, reference_id,  status)
    VALUES (?, 'join_request', ?, 'pending')
    `,
      [ownerUserId, requestId],
    );
  },

  async updateProject(
    projectId: number,
    userId: number,
    title: string,
    overview: string,
    progressPercent: number,
    status: ProjectStatus,
    deadline: string | null,
  ) {
    const sql = `UPDATE projects
    SET title = ?, overview = ?, progress_percent = ?, status = ?, deadline = ?
    WHERE project_id = ? AND owner_user_id = ?`;

    const [dbResult]: any = await db.query(sql, [
      title,
      overview,
      progressPercent,
      status,
      deadline,
      projectId,
      userId,
    ]);

    return dbResult.affectedRows;
  },

  async clearProjectData(projectId: number) {
    await db.query(`DELETE FROM project_tasks WHERE project_id = ?`, [
      projectId,
    ]);
    await db.query(`DELETE FROM project_tags WHERE project_id = ?`, [
      projectId,
    ]);
    await db.query(`DELETE FROM project_skills_needed WHERE project_id = ?`, [
      projectId,
    ]);
  },

  async deleteProject(projectId: number, userId: number) {
    const [dbResult]: any = await db.query(
      `DELETE FROM projects WHERE project_id = ? AND owner_user_id = ?`,
      [projectId, userId],
    );

    return dbResult.affectedRows;
  },

  async adminDeleteProject(projectId: number) {
    const [result]: any = await db.query(
      `DELETE FROM projects WHERE project_id = ?`,
      [projectId],
    );

    return result.affectedRows;
  },
};

export default ProjectModel;
