const db = require('../config/database');
const adminDataMapper = {
    listTicketsForAdmin: async function () {
        const query = {
            text: `SELECT DISTINCT("ticket"."ticket_code") , (case when "ticket"."updated_at" IS NULL then "ticket"."created_at" else "ticket"."updated_at" end) as datee,  "ticket"."subject", "ticket"."status"
            FROM "ticket"
            JOIN "ticket_messages" ON "ticket_messages"."ticket_code" = "ticket"."ticket_code"
            JOIN "ticket_participants" ON "ticket_participants"."ticket_code" = "ticket_messages"."ticket_code"
            WHERE "ticket_participants"."participant_1" = (SELECT "user"."id" FROM "user" WHERE "user"."isadmin" = true)
            OR "ticket_participants"."participant_2" = (SELECT "user"."id" FROM "user" WHERE "user"."isadmin" = true)
            ORDER BY "ticket"."status" DESC,
                     datee DESC`,
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    checkIfAdmin: async function (id) {
        const query = {
            text: `select bool(case when "user"."isadmin" = 'true' then true else false END)
            from "user"
            where "id" = $1`,
            values: [id]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows[0];
    },
    createTicket: async function (ticket_code, subject) {
        const query = {
            text: `INSERT INTO "ticket" (ticket_code, subject, status) VALUES ($1, $2, 'in progress') RETURNING "ticket"."ticket_code", "ticket"."subject", "ticket"."status"`,
            values: [ticket_code, subject]
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows[0];
    },
    addParticipantToTicket: async (ticket_code, participant_1, participant_2) => {
        const query = {
            text: `INSERT INTO "ticket_participants" (ticket_code, participant_1, participant_2) VALUES ($1, $2, $3)`,
            values: [ticket_code, participant_1, participant_2]
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows[0];
    },
    submitMessageToTicket: async function (ticket_code, sender_id, text) {
        const query = {
            text: `INSERT INTO "ticket_messages" (ticket_code, sender_id, text) VALUES ($1, $2, $3) RETURNING "ticket_messages"."text", "ticket_messages"."created_at"`,
            values: [ticket_code, sender_id, text]
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows[0];
    },
    updateTicketToClosed: async function (ticket_code) {
        const query = {
            text: `UPDATE "ticket" SET status = 'finished', updated_at = now() WHERE "ticket"."ticket_code" = $1  RETURNING *`,
            values: [ticket_code]
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    updateTicketToAnswered: async function (ticket_code) {
        const query = {
            text: `UPDATE "ticket" SET status = 'answered', updated_at = now() WHERE "ticket"."ticket_code" = $1  RETURNING *`,
            values: [ticket_code]
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    updateTicketToInProgress: async function (ticket_code) {
        const query = {
            text: `UPDATE "ticket" SET status = 'in progress', updated_at = now() WHERE "ticket"."ticket_code" = $1  RETURNING *`,
            values: [ticket_code]
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    deleteTicket: async (ticket_code) => {
        const query = {
            text: `DELETE FROM "ticket" WHERE "ticket"."ticket_code" = $1 RETURNING *`,
            values: [ticket_code]
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows[0];
    },
    listTicketByCode: async function (ticket_code) {
        const query = {
            text: `SELECT 		"ticket_messages"."created_at",
            "user"."username",
            substring("avatar"."avatar_path", 16) as "avatar_path",
            "ticket"."ticket_code",
            "ticket"."subject",
            "ticket"."status",
            "ticket_messages"."text"
            FROM   "ticket"
            JOIN "ticket_messages"
              ON "ticket_messages"."ticket_code" = "ticket"."ticket_code"
            JOIN "ticket_participants"
              ON "ticket_participants"."ticket_code" =
                 "ticket_messages"."ticket_code"
            JOIN "user"
              ON "ticket_messages"."sender_id" = "user"."id"
            INNER JOIN "user_has_avatar"
                    ON "user_has_avatar"."user_id" = "user"."id"
            INNER JOIN "avatar"
                    ON "user_has_avatar"."avatar_id" = "avatar"."id"
            WHERE  "ticket"."ticket_code" = ($1)
			ORDER BY "ticket_messages"."created_at" ASC`,
            values: [ticket_code]
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    listUsersOfWebsite: async function () {
        const query = {
            text: `SELECT "user"."id", "user"."username"
            FROM "user" 
            ORDER BY username ASC`,
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    listUsersOfWebsiteSomeDetails: async function () {
        const query = {
            text: `SELECT "user"."id", "user"."username", "user"."email"
            FROM "user" 
            ORDER BY username ASC`,
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    listMessagesOfTicket: async function () {
        const query = {
            text: `SELECT "user"."id", "user"."username"
            FROM "user" 
            ORDER BY username ASC`,
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    checkIfUserCanSendToTicket: async (user_id, ticket_code) => {
        const query = {
            text: `select * from "ticket_participants"
            WHERE "ticket_participants"."ticket_code" = lower($2) 
            AND "ticket_participants"."participant_1" = $1 
            OR "ticket_participants"."participant_2" = $1`,
            values: [user_id, ticket_code]
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    getAllInfosOfUser: async (user_id) => {
        const query = {
            text: `SELECT "u"."id", "u"."username", "u"."firstname", "u"."lastname", "u"."email", "u"."koalacoin", 
            CASE WHEN "u"."koalacoin" < 249 AND "u"."koalacoin" >= 100 THEN 'Koala Bronze' 
             WHEN "u"."koalacoin" < 349 AND "u"."koalacoin" >= 250 THEN 'Koala Silver'
             WHEN "u"."koalacoin" < 449  AND "u"."koalacoin" >= 350 THEN 'Koala Gold'
             WHEN "u"."koalacoin" < 699  AND "u"."koalacoin" >= 450 THEN 'Koala Platinum' 
             WHEN "u"."koalacoin" < 999 AND "u"."koalacoin" >= 700 THEN 'Koala Diamond'
            WHEN "u"."koalacoin" < 1149 AND "u"."koalacoin" >= 1000 THEN 'Koala Titanium'
            WHEN "u"."koalacoin" > 1250 THEN 'Koala Supreme'
            ELSE 'Super N00b' END
            AS grade ,
            bool_or(case when "g"."group_leader_id" = 
              (SELECT "user"."id" FROM "user" WHERE "user"."id" = $1) then true else false end) AS "isLeading",
              substring("a"."avatar_path", 16) as "avatar_path",
              "u"."isadmin"
            FROM "user" u
            INNER JOIN "user_has_avatar" uha
            ON "uha"."user_id" = "u"."id"
            INNER JOIN "avatar" a
            ON "uha"."avatar_id" = "a"."id"
            LEFT JOIN "group" g
            ON "g".group_leader_id = "u".id
            WHERE "u".id = $1
            GROUP BY "u"."id", "a"."avatar_path"`,
            values: [user_id]
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows[0];
    },
};
module.exports = adminDataMapper;