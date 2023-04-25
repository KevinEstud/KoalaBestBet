const db = require('../config/database');
const tchatDataMapper = {
    addMessage: async function (username, text, avatar_path, color, room) {
        const query = {
            text: `INSERT INTO "tchat" (username, text, avatar_path, color, room) VALUES ($1, $2, $3, $4, $5)`,
            values: [username, text, avatar_path, color, room]
        };
        const result = await db.query(query);
        return result.rows;
    },
    getAllMessageByRoom: async function (room) {
        const query = {
            text: `SELECT "tchat"."username", "tchat"."text" AS "message", "tchat"."avatar_path", "tchat"."room", "tchat"."created_at" AS "createdAt", "tchat"."color" FROM "tchat" WHERE room = $1`,
            values: [room]
        };
        const result = await db.query(query);
        return result.rows;
    },
}
module.exports = tchatDataMapper ;