const db = require('../config/database');
const userDataMapper = {
  findByEmail: async function (email) {
    const query = {
      text: `SELECT * FROM "user" WHERE lower(email) = ($1)`,
      values: [email]
    };
    const result = await db.query(query);
    return result.rows;
  },
  findByUsername: async function (username) {
    const query = {
      text: `SELECT * FROM "user" WHERE lower(username) = ($1)`,
      values: [username]
    };
    const result = await db.query(query);
    return result.rows;
  },
  checkIfUserGotAvatar: async function (user_id, avatar_id) {
    const query = {
      text: `select * from "user_has_avatar" WHERE user_id = $1 AND avatar_id = $2`,
      values: [user_id, avatar_id]
    };
    const result = await db.query(query);
    return result.rows;
  },
  getNumberOfAvatar: async function () {
    const query = {
      text: `select count(*) from "avatar";`,
    };
    const result = await db.query(query);
    return result.rows[0];
  },
  updateAvatarOfUser: async function (user_id, avatar_id) {
    const query = {
      text: `UPDATE "user_has_avatar" SET avatar_id = $2 WHERE user_id = $1`,
      values: [user_id, avatar_id]
    };
    const result = await db.query(query);
    return result.rows[0];
  },
  getPathOfAvatar: async function (avatar_id) {
    const query = {
      text: `select avatar_path from "avatar" WHERE id = $1`,
      values: [avatar_id]
    };
    const result = await db.query(query);
    return result.rows[0];
  },
  findByUsernameUser: async function (username) {
    const query = {
      text: `SELECT "u"."id", "u"."username", "u"."firstname", "u"."lastname", "u"."email", "u"."koalacoin", to_char("u"."created_at", 'DD-MM-YYYY'), 
      CASE WHEN "u"."koalacoin" < 249 AND "u"."koalacoin" >= 100 THEN 'Koala Bronze' 
       WHEN "u"."koalacoin" < 349 AND "u"."koalacoin" >= 250 THEN 'Koala Silver'
       WHEN "u"."koalacoin" < 449  AND "u"."koalacoin" >= 350 THEN 'Koala Gold'
       WHEN "u"."koalacoin" < 699  AND "u"."koalacoin" >= 450 THEN 'Koala Platinum' 
       WHEN "u"."koalacoin" < 999 AND "u"."koalacoin" >= 700 THEN 'Koala Diamond'
      WHEN "u"."koalacoin" < 1149 AND "u"."koalacoin" >= 1000 THEN 'Koala Titanium'
      WHEN "u"."koalacoin" > 1250 THEN 'Koala Supreme'
      ELSE 'Super N00b' END
      AS grade , CASE WHEN "g"."group_leader_id" = "u"."id" THEN "g"."invitation_link" ELSE null END AS invitation_link,
      "a"."avatar_path"                              
                              FROM "user" u
                              INNER JOIN "user_has_avatar" uha
                              ON "uha"."user_id" = "u"."id"
                              INNER JOIN "avatar" a
                              ON "uha"."avatar_id" = "a"."id"
                              LEFT JOIN "group" g
                              ON "uha"."user_id" = "g"."group_leader_id" 
                              WHERE "u"."username" = $1`,
      values: [username]
    };
    const result = await db.query(query);
    return result.rows[0];
  },
  findByIdUser: async function (id) {
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
              AS grade , CASE WHEN "g"."group_leader_id" = "u"."id" THEN "g"."invitation_link" ELSE null END AS invitation_link,
              "a"."avatar_path"                              
                                      FROM "user" u
                                      INNER JOIN "user_has_avatar" uha
                                      ON "uha"."user_id" = "u"."id"
                                      INNER JOIN "avatar" a
                                      ON "uha"."avatar_id" = "a"."id"
                                      LEFT JOIN "group" g
                                      ON "uha"."user_id" = "g"."group_leader_id" 
                                      WHERE "u"."id" = $1`,
      values: [id]
    };
    const result = await db.query(query);
    return result.rows[0];
  },
  findByRefreshTokenUser: async function (token) {
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
	   CASE WHEN "u"."koalacoin" < 249 AND "u"."koalacoin" >= 100 THEN 'brown' 
       WHEN "u"."koalacoin" < 349 AND "u"."koalacoin" >= 250 THEN 'gray'
       WHEN "u"."koalacoin" < 449  AND "u"."koalacoin" >= 350 THEN 'yellow'
       WHEN "u"."koalacoin" < 699  AND "u"."koalacoin" >= 450 THEN 'rgba(10, 148, 255, 0.7)' 
       WHEN "u"."koalacoin" < 999 AND "u"."koalacoin" >= 700 THEN 'rgba(149, 17, 255, 0.7)'
      WHEN "u"."koalacoin" < 1149 AND "u"."koalacoin" >= 1000 THEN 'rgba(255, 155, 0, 0.7)'
      WHEN "u"."koalacoin" > 1250 THEN 'rgba(255, 101, 46, 1)'
      ELSE 'white' END
      AS color ,
      bool_or(case when "g"."group_leader_id" = 
		(SELECT "user"."id" FROM "user" WHERE "user"."refresh_token" = $1) then true else false end) AS "isLeading",
		"a"."avatar_path",
		"u"."isadmin"
      FROM "user" u
	  INNER JOIN "user_has_avatar" uha
      ON "uha"."user_id" = "u"."id"
      INNER JOIN "avatar" a
      ON "uha"."avatar_id" = "a"."id"
      LEFT JOIN "group" g
      ON "g".group_leader_id = "u".id
      WHERE "u".refresh_token = $1
      GROUP BY "u"."id", "a"."avatar_path"`,
      values: [token]
    };
    const result = await db.query(query);
    return result.rows[0];
  },
  updateUser: async function (id, userData) {
    const fields = Object.keys(userData).map((prop, index) => `"${prop}" = $${index + 1}`);
    const values = Object.values(userData);

    const result = await db.query(
      `
                    UPDATE "user" SET
                        ${fields} , updated_at = now()
                    WHERE id = $${fields.length + 1}
                    RETURNING *

                `,
      [...values, id],
    );

    return result.rows[0];
  },
  updatePassword: async function (id, newPassword) {
    const result = await db.query(
    `UPDATE "user" SET
      password = $2, updated_at = now()
      WHERE id = $1`,
      [id, newPassword],
    );

    return result.rows[0];
  },
  findAllInfosOfUser: async function (id) {
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
	   CASE WHEN "u"."koalacoin" < 249 AND "u"."koalacoin" >= 100 THEN 'brown' 
       WHEN "u"."koalacoin" < 349 AND "u"."koalacoin" >= 250 THEN 'gray'
       WHEN "u"."koalacoin" < 449  AND "u"."koalacoin" >= 350 THEN 'yellow'
       WHEN "u"."koalacoin" < 699  AND "u"."koalacoin" >= 450 THEN 'rgba(10, 148, 255, 0.7)' 
       WHEN "u"."koalacoin" < 999 AND "u"."koalacoin" >= 700 THEN 'rgba(149, 17, 255, 0.7)'
      WHEN "u"."koalacoin" < 1149 AND "u"."koalacoin" >= 1000 THEN 'rgba(255, 155, 0, 0.7)'
      WHEN "u"."koalacoin" > 1250 THEN 'rgba(255, 101, 46, 1)'
      ELSE 'white' END
      AS color ,
      bool_or(case when "g"."group_leader_id" = 
		(SELECT "user"."id" FROM "user" WHERE "user"."id" = $1) then true else false end) AS "isLeading",
		"a"."avatar_path",
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
      values: [id]
    };
    const result = await db.query(query);
    return result.rows;
  },
  createUser: async function (username, firstname, lastname, email, password, avatar_id) {
    const query = {
      text: `INSERT INTO "user" (username, firstname, lastname, email, isadmin, password, koalacoin, avatar_id) VALUES ($1, $2, $3, $4, 'f', $5, 50, $6) returning id ;`,
      values: [username, firstname, lastname, email, password, avatar_id]
    };
    const result = await db.query(query);
    return result.rows;
  },
  linkUserAndAvatar: async function (user_id, avatar_id) {
    const query = {
      text: `INSERT INTO "user_has_avatar" (user_id, avatar_id) VALUES ($1, $2) ;`,
      values: [user_id, avatar_id]
    };
    const result = await db.query(query);
    return result.rows;
  },
  deleteUser: async function (id) {
    const query = {
      text: `DELETE FROM "user" WHERE id = $1`,
      values: [id]
    };
    const result = await db.query(query);
    return result.rows;
  },
  getRank: async function () {
    const query = {
      text: `select row_number() OVER ( ORDER BY "u"."koalacoin" DESC ) AS position, "u"."username", "u"."koalacoin",
                      CASE WHEN "u"."koalacoin" < 249 AND "u"."koalacoin" >= 100 THEN 'Koala Bronze' 
                                    WHEN "u"."koalacoin" < 349 AND "u"."koalacoin" >= 250 THEN 'Koala Silver'
                                    WHEN "u"."koalacoin" < 449  AND "u"."koalacoin" >= 350 THEN 'Koala Gold'
                                    WHEN "u"."koalacoin" < 699  AND "u"."koalacoin" >= 450 THEN 'Koala Platinum' 
                                    WHEN "u"."koalacoin" < 999 AND "u"."koalacoin" >= 700 THEN 'Koala Diamond'
                                    WHEN "u"."koalacoin" < 1149 AND "u"."koalacoin" >= 1000 THEN 'Koala Titanium'
                                    WHEN "u"."koalacoin" > 1250 THEN 'Koala Supreme'
                                    ELSE 'Super N00b' END
                                    AS grade from "user" u ORDER BY "u"."koalacoin" DESC ;`,
    }
    const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
    return result.rows;
  },
  addRefreshTokenToUser: async function (id, token) {
    const query = {
      text: `UPDATE "user" SET refresh_token = $2, updated_at = now() WHERE id = $1 ;`,
      values: [id, token]
    }
    const result = await db.query(query)
    return result.rows;
  },
  deleteRefreshTokenOfUser: async function (id) {
    const query = {
      text: `UPDATE "user" SET refresh_token = '', updated_at = now() WHERE id = $1 ;`,
      values: [id]
    }
    const result = await db.query(query)
    return result.rows;
  },
  getRankLimited: async function () {
    const query = {
      text: `select row_number() OVER ( ORDER BY "u"."koalacoin" DESC ) AS position, "u"."username", "u"."koalacoin",
                      CASE WHEN "u"."koalacoin" < 249 AND "u"."koalacoin" >= 100 THEN 'Koala Bronze' 
                                    WHEN "u"."koalacoin" < 349 AND "u"."koalacoin" >= 250 THEN 'Koala Silver'
                                    WHEN "u"."koalacoin" < 449  AND "u"."koalacoin" >= 350 THEN 'Koala Gold'
                                    WHEN "u"."koalacoin" < 699  AND "u"."koalacoin" >= 450 THEN 'Koala Platinum' 
                                    WHEN "u"."koalacoin" < 999 AND "u"."koalacoin" >= 700 THEN 'Koala Diamond'
                                    WHEN "u"."koalacoin" < 1149 AND "u"."koalacoin" >= 1000 THEN 'Koala Titanium'
                                    WHEN "u"."koalacoin" > 1250 THEN 'Koala Supreme'
                                    ELSE 'Super N00b' END
                                    AS grade from "user" u ORDER BY "u"."koalacoin" DESC ;`,
    }
    const result = await db.query(query)
    return result.rows;
  },
  verifyRecoveryCode: async function (recoveryCode) {
    const query = {
        text: `SELECT * FROM "user" WHERE lower(recovery_code) = $1`,
        values: [recoveryCode]
    };
    const result = await db.query(query);
    return result.rows[0];
},
addRecoveryCodeToUser: async function (recoveryCode, email) {
  const query = {
      text: `UPDATE "user" SET recovery_code = $1 WHERE lower(email) = $2`,
      values: [recoveryCode, email]
  };
  const result = await db.query(query);
  return result.rows;
},
updatePasswordFromForgot: async function (recoveryCode, newPassword) {
  const result = await db.query(
  `UPDATE "user" SET
    password = $2, updated_at = now()
    WHERE lower(recovery_code) = $1`,
    [recoveryCode, newPassword],
  );

  return result.rows[0];
},
deleteRecoveryCode: async function (recoveryCode) {
  const result = await db.query(
  `UPDATE "user" SET
    recovery_code = '?', updated_at = now()
    WHERE lower(recovery_code) = $1`,
    [recoveryCode],
  );

  return result.rows[0];
},
listTicketsByUserId: async function (id) {
  const query = {
    text: `SELECT DISTINCT("ticket"."ticket_code") , (case when "ticket"."updated_at" IS NULL then "ticket"."created_at" else "ticket"."updated_at" end) as datee,  "ticket"."subject", "ticket"."status"
    FROM "ticket"
    JOIN "ticket_messages" ON "ticket_messages"."ticket_code" = "ticket"."ticket_code"
    JOIN "ticket_participants" ON "ticket_participants"."ticket_code" = "ticket_messages"."ticket_code"
    WHERE "ticket_participants"."participant_1" = (SELECT "user"."id" FROM "user" WHERE "user"."id" = $1)
    OR "ticket_participants"."participant_2" = (SELECT "user"."id" FROM "user" WHERE "user"."id" = $1)
    ORDER BY "ticket"."status" ASC,
             datee DESC`,
    values: [id]
  }
  const result = await db.query(query)
  return result.rows;
},
};
module.exports = userDataMapper;