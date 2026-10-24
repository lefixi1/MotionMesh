import db from "../config/DB";
import { Visibility, Mode } from "../types/Types";

const PostModel = {
  async createPost(
    userId: number,
    projectId: number | null,
    title: string,
    description: string,
    concept: string,
    result: string,
    visibility: Visibility,
  ) {
    const sql = `INSERT INTO posts (user_id, project_id, title, description, concept, result, visibility) VALUES (?,?,?,?,?,?,?)`;

    const [dbResult]: any = await db.query(sql, [
      userId,
      projectId,
      title,
      description,
      concept,
      result,
      visibility,
    ]);

    return dbResult.insertId;
  },

  async insertFile(
    postId: number,
    fileName: string,
    filePath: string,
    fileType: string,
  ) {
    const sql = `INSERT INTO files (post_id, file_name, file_path, file_type) VALUES (?,?,?,?)`;

    const [dbResult]: any = await db.query(sql, [
      postId,
      fileName,
      filePath,
      fileType,
    ]);

    return dbResult;
  },

  async insertTags(postId: number, tags: string[]) {
    if (!tags || tags.length === 0) return;

    const values = tags.map((tag) => [postId, tag]);

    await db.query(`INSERT INTO post_tags (post_id, tag_name) VALUES ?`, [
      values,
    ]);
  },

  async getPostById(postId: number) {
    const sql = `SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.user_id WHERE posts.post_id = ?`;

    const [posts]: any = await db.query(sql, [postId]);

    if (posts.length === 0) return null;

    const [files]: any = await db.query(
      `SELECT * FROM files WHERE post_id = ?`,
      [postId],
    );

    const [tags]: any = await db.query(
      `SELECT tag_name FROM post_tags WHERE post_id = ?`,
      [postId],
    );

    return {
      ...posts[0],
      file: files[0] || null,
      tags: tags.map((tag: any) => tag.tag_name),
    };
  },

  async getUserPosts(userId: number) {
    const sql = `SELECT posts.*, users.username
      FROM posts
      JOIN users ON posts.user_id = users.user_id
      WHERE posts.user_id = ?
      ORDER BY posts.post_id DESC`;

    const [posts]: any = await db.query(sql, [userId]);

    if (posts.length === 0) return [];

    const postIds = posts.map((post: any) => post.post_id);

    const [files]: any = await db.query(
      `SELECT * FROM files WHERE post_id IN (?)`,
      [postIds],
    );

    return posts.map((post: any) => ({
      ...post,
      file: files.find((file: any) => file.post_id === post.post_id) || null,
    }));
  },

  async getPublicPosts() {
    const sql = `
      SELECT posts.*, users.username
      FROM posts 
      JOIN users ON posts.user_id = users.user_id
      WHERE posts.visibility = 'public'
      ORDER BY posts.created_at DESC
    `;

    const [posts]: any = await db.query(sql);

    if (posts.length === 0) return [];

    const postIds = posts.map((post: any) => post.post_id);

    const [files]: any = await db.query(
      ` SELECT *
            FROM files
            WHERE post_id IN (?)`,
      [postIds],
    );

    return posts.map((post: any) => ({
      ...post,
      file: files.find((file: any) => file.post_id === post.post_id) || null,
    }));
  },

  async getRandomPosts(limit: number = 6) {
    const sql = `SELECT posts.*, 
    users.username FROM posts JOIN users 
    ON posts.user_id = users.user_id 
    WHERE posts.visibility = 'public' 
    ORDER BY RAND() LIMIT ?`;

    const [posts]: any = await db.query(sql, [limit]);

    if (posts.length === 0) return [];

    const postIds = posts.map((post: any) => post.post_id);

    const [files]: any = await db.query(
      ` SELECT *
            FROM files
            WHERE post_id IN (?)`,
      [postIds],
    );

    return posts.map((post: any) => ({
      ...post,
      file: files.find((file: any) => file.post_id === post.post_id) || null,
    }));
  },

  async searchPosts(q: string, mode: Mode) {
    const sql =
      mode === "users"
        ? `SELECT posts.*, users.username
        FROM posts
        JOIN users ON posts.user_id = users.user_id
        WHERE posts.visibility = 'public'
        AND users.username LIKE ?
        ORDER BY posts.created_at DESC`
        : `SELECT posts.*, users.username
        FROM posts
        JOIN users ON posts.user_id = users.user_id
        WHERE posts.visibility = 'public'
        AND posts.title LIKE ?
        ORDER BY posts.created_at DESC`;

    const [posts]: any = await db.query(sql, [`%${q}%`]);

    if (posts.length === 0) return [];

    const postIds = posts.map((post: any) => post.post_id);

    const [files]: any = await db.query(
      `SELECT * FROM files WHERE post_id IN (?)`,
      [postIds],
    );

    return posts.map((post: any) => ({
      ...post,
      file: files.find((file: any) => file.post_id === post.post_id) || null,
    }));
  },

  async updatePost(
    postId: number,
    userId: number,
    projectId: number | null,
    title: string,
    description: string,
    concept: string,
    result: string,
    visibility: Visibility,
  ) {
    const sql = `UPDATE posts SET title = ?, description = ?, concept = ?, result = ?, visibility = ?, project_id=? WHERE post_id = ? AND user_id = ?`;

    const [dbResult]: any = await db.query(sql, [
      title,
      description,
      concept,
      result,
      visibility,
      projectId,
      postId,
      userId,
    ]);

    return dbResult.affectedRows;
  },

  async clearPostTags(postId: number) {
    await db.query(`DELETE FROM post_tags WHERE post_id = ?`, [postId]);
  },

  async deletePost(postId: number, userId: number) {
    await db.query(`DELETE FROM files WHERE post_id = ?`, [postId]);

    const [dbResult]: any = await db.query(
      `DELETE FROM posts WHERE post_id = ? AND user_id = ?`,
      [postId, userId],
    );

    return dbResult.affectedRows;
  },

  async adminDeletePost(postId: number) {
    await db.query(`DELETE FROM files WHERE post_id = ?`, [postId]);

    const [result]: any = await db.query(
      `DELETE FROM posts WHERE post_id = ?`,
      [postId],
    );

    return result.affectedRows;
  },
};

export default PostModel;
