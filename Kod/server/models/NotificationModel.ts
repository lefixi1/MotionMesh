import db from "../config/DB";

const NotificationModel = {
  async getNotifications(userId: number) {
    const sql = `
    SELECT 
      notifications.*,
      users.username,
      projects.title AS project_title
    FROM notifications

    LEFT JOIN project_join_request 
      ON notifications.reference_id = project_join_request.request_id

    LEFT JOIN users
      ON project_join_request.user_id = users.user_id

    LEFT JOIN projects
      ON project_join_request.project_id = projects.project_id

    WHERE notifications.user_id = ?
      AND (delete_after IS NULL OR delete_after > NOW())

    ORDER BY notifications.created_at DESC
    `;

    const [rows]: any = await db.query(sql, [userId]);
    return rows;
  },

  async getJoinRequest(requestId: number) {
    const sql = `
      SELECT project_join_request.*, projects.owner_user_id
      FROM project_join_request
      JOIN projects ON project_join_request.project_id = projects.project_id
      WHERE project_join_request.request_id = ?
    `;

    const [rows]: any = await db.query(sql, [requestId]);
    return rows[0] || null;
  },

  async acceptJoinRequest(requestId: number) {
    await db.query(
      `
      UPDATE project_join_request
      SET status = 'accepted'
      WHERE request_id = ?
      `,
      [requestId],
    );
  },

  async declineJoinRequest(requestId: number) {
    await db.query(
      `
      UPDATE project_join_request
      SET status = 'declined'
      WHERE request_id = ?
      `,
      [requestId],
    );
  },

  async addParticipant(projectId: number, userId: number) {
    await db.query(
      `
      INSERT IGNORE INTO project_participants
      (project_id, user_id, role_name, participation_status)
      VALUES (?, ?, 'Teammate', 'confirmed')
      `,
      [projectId, userId],
    );
  },

  async updateOwnerNotification(
    requestId: number,
    ownerUserId: number,
    status: "accepted" | "declined",
  ) {
    await db.query(
      `
    UPDATE notifications
    SET status = ?,
        is_read = 1,
        delete_after = DATE_ADD(NOW(), INTERVAL 24 HOUR)
    WHERE reference_id = ?
      AND type = 'join_request'
      AND user_id = ?
    `,
      [status, requestId, ownerUserId],
    );
  },

  async createUserNotification(
    userId: number,
    type: "request_accepted" | "request_declined",
    requestId: number,
  ) {
    await db.query(
      `
    INSERT INTO notifications
    (user_id, type, reference_id, delete_after)
    VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
    `,
      [userId, type, requestId],
    );
  },

  async markSeen(userId: number) {
    await db.query(
      `
    UPDATE notifications
    SET seen_at = NOW()
    WHERE user_id = ?
      AND seen_at IS NULL
    `,
      [userId],
    );
  },

  async deleteOldNotifications() {
    await db.query(
      `
    DELETE FROM notifications
    WHERE delete_after IS NOT NULL
      AND delete_after <= NOW()
    `,
    );
  },
};

export default NotificationModel;
