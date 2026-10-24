import db from "../config/DB";

const CommentModel = {
  async getPostComments(postId: number) {
    const sql = `
      SELECT comments.*, users.username
      FROM comments
      JOIN users ON comments.user_id = users.user_id
      WHERE comments.post_id = ?
      ORDER BY comments.created_at DESC
    `;

    const [rows]: any = await db.query(sql, [postId]);
    return rows;
  },

  async addPostComment(userId: number, postId: number, content: string) {
    await db.query(
      `
      INSERT INTO comments
      (user_id, post_id, content)
      VALUES (?, ?, ?)
      `,
      [userId, postId, content],
    );
  },

  async getProjectComments(projectId: number) {
    const sql = `
      SELECT comments.*, users.username
      FROM comments
      JOIN users ON comments.user_id = users.user_id
      WHERE comments.project_id = ?
      ORDER BY comments.created_at DESC
    `;

    const [rows]: any = await db.query(sql, [projectId]);
    return rows;
  },

  async addProjectComment(userId: number, projectId: number, content: string) {
    await db.query(
      `
      INSERT INTO comments
      (user_id, project_id, content)
      VALUES (?, ?, ?)
      `,
      [userId, projectId, content],
    );
  },

  async updateComment(commentId: number, userId: number, content: string) {
    const [result]: any = await db.query(
      `
    UPDATE comments
    SET content = ?
    WHERE comment_id = ? AND user_id = ?
    `,
      [content, commentId, userId],
    );

    return result.affectedRows;
  },

  async deleteComment(commentId: number, userId: number) {
    const [dbResult]: any = await db.query(
      `
      DELETE FROM comments
      WHERE comment_id = ?
        AND user_id = ?
      `,
      [commentId, userId],
    );

    return dbResult.affectedRows;
  },

  async adminDeleteComment(commentId: number) {
    const [result]: any = await db.query(
      `DELETE FROM comments WHERE comment_id = ?`,
      [commentId],
    );

    return result.affectedRows;
  },
};

export default CommentModel;
