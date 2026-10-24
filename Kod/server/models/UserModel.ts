import db from "../config/DB";

const UserModel = {
  async getUserEditData(userId: number) {
    const sql = `SELECT name, surname, username, description FROM users WHERE user_id = ?`;

    const [user]: any = await db.query(sql, [userId]);
    return user[0] || null;
  },

  async checkUsernameExists(username: string, userId: number) {
    const sql = `SELECT * FROM USERS WHERE username = ? AND user_id != ?`;

    const [users]: any = await db.query(sql, [username, userId]);
    return users.length > 0;
  },

  async updateUser(
    userId: number,
    name: string,
    surname: string,
    username: string,
    description: string,
  ) {
    const sql = `UPDATE users SET name = ?, surname = ?, username = ?, description = ? WHERE user_id = ?`;

    const [dbResult]: any = await db.query(sql, [
      name,
      surname,
      username,
      description,
      userId,
    ]);

    return dbResult.affectedRows;
  },

  async insertTags(userId: number, tags: string[]) {
    if (!tags || tags.length === 0) return;

    const values = tags.map((tag) => [userId, tag]);

    await db.query(`INSERT INTO user_tags (user_id, tag_name) VALUES ?`, [
      values,
    ]);
  },

  async clearUserTags(userId: number) {
    await db.query(`DELETE FROM user_tags WHERE user_id = ?`, [userId]);
  },

  async getUserTags(userId: number) {
    const [tags]: any = await db.query(
      `SELECT tag_name FROM user_tags WHERE user_id = ?`,
      [userId],
    );

    return tags.map((tag: any) => tag.tag_name);
  },

  async searchUsers(q: string) {
    const sql = `SELECT user_id, username, name, surname
    FROM users
    WHERE username LIKE ?
    LIMIT 10`;

    const [users]: any = await db.query(sql, [`%${q}%`]);
    return users;
  },

  async getUserById(userId: number) {
    const sql = `SELECT user_id, username, name, surname, description
    FROM users
    WHERE user_id = ?`;

    const [users]: any = await db.query(sql, [userId]);

    if (users.length === 0) return null;

    const user = users[0];

    const tags = await this.getUserTags(userId);
    user.tags = tags;

    const [posts]: any = await db.query(
      `
    SELECT posts.*, users.username
    FROM posts
    JOIN users ON posts.user_id = users.user_id
    WHERE posts.user_id = ?
      AND posts.visibility = 'public'
    ORDER BY posts.post_id DESC
    `,
      [userId],
    );

    const postIds = posts.map((p: any) => p.post_id);

    let postFiles: any[] = [];

    if (postIds.length > 0) {
      const [files]: any = await db.query(
        `SELECT * FROM files WHERE post_id IN (?)`,
        [postIds],
      );
      postFiles = files;
    }

    const postsWithFile = posts.map((post: any) => ({
      ...post,
      file:
        postFiles.find((file: any) => file.post_id === post.post_id) || null,
    }));

    const [projects]: any = await db.query(
      `
    SELECT projects.*, users.username
    FROM projects
    JOIN users ON projects.owner_user_id = users.user_id
    WHERE projects.owner_user_id = ?
    ORDER BY projects.project_id DESC
    `,
      [userId],
    );

    const projectIds = projects.map((p: any) => p.project_id);

    let projectFiles: any[] = [];
    let skills: any[] = [];

    if (projectIds.length > 0) {
      const [files]: any = await db.query(
        `SELECT * FROM project_files WHERE project_id IN (?)`,
        [projectIds],
      );

      const [skillsResult]: any = await db.query(
        `SELECT * FROM project_skills_needed WHERE project_id IN (?)`,
        [projectIds],
      );

      projectFiles = files;
      skills = skillsResult;
    }

    const projectsWithFile = projects.map((project: any) => ({
      ...project,
      file:
        projectFiles.find(
          (file: any) => file.project_id === project.project_id,
        ) || null,
      lookingFor: skills
        .filter((skill: any) => skill.project_id === project.project_id)
        .map((skill: any) => skill.skill_name),
    }));

    return {
      user,
      posts: postsWithFile,
      projects: projectsWithFile,
    };
  },

  async getAllUsers() {
    const [rows]: any = await db.query(`
    SELECT user_id, name, surname, email, username, description, role
    FROM users
    ORDER BY user_id DESC
  `);

    return rows;
  },

  async adminUpdateUser(
    userId: number,
    name: string,
    surname: string,
    username: string,
    description: string,
    role: "user" | "admin",
  ) {
    const [result]: any = await db.query(
      `
    UPDATE users
    SET name = ?, surname = ?, username = ?, description = ?, role = ?
    WHERE user_id = ?
    `,
      [name, surname, username, description, role, userId],
    );

    return result.affectedRows;
  },

  async adminDeleteUser(userId: number) {
    const [result]: any = await db.query(
      `DELETE FROM users WHERE user_id = ?`,
      [userId],
    );

    return result.affectedRows;
  },
};

export default UserModel;
