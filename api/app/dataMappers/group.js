const db = require('../config/database');
const groupDataMapper = {
    createGroup: async function (groupName, invitation_link, players_number, group_leader_id, isprivate) {
        const query = {
            text: `INSERT INTO "group" (name, invitation_link, players_number, group_leader_id, status, isprivate) VALUES ($1, $2, $3, $4, 'in progress', $5)`,
            values: [groupName, invitation_link, players_number, group_leader_id, isprivate]
        };
        const result = await db.query(query);
        return result.rows;
    },
    updateStatusGroup: async function (groupid, status) {
        const query = {
            text: `UPDATE "group" SET status = $2, updated_at = now() WHERE id = $1 ;`,
            values: [groupid, status]
        };
        const result = await db.query(query);
        return result.rows;
    },
    getGroupIdByGroupName: async function (groupName) {
        const query = {
            text: `SELECT id FROM "group" WHERE lower(name) = $1`,
            values: [groupName]
        };
        const result = await db.query(query);
        return result.rows[0];
    },
    getGroupById: async function (group_id) {
        const query = {
            text: `SELECT * FROM "group" WHERE id = $1`,
            values: [group_id]
        };
        const result = await db.query(query);
        return result.rows[0];
    },
    linkGroupAndUser: async function (group_id, user_id) {
        const query = {
            text: `INSERT INTO "participe" (group_id, user_id, "hasBet") VALUES ($1, $2, false)`,
            values: [group_id, user_id]
        };
        const result = await db.query(query);
        return result.rows;
    },
    deleteGroup: async function (user_id) {
        const query = {
            text: `DELETE from "group" WHERE id = $1`,
            values: [user_id]
        };
        const result = await db.query(query);
        return result.rows;
    },
    LinkMatchsForOneGroup: async function (group_id, matchs_id) {
        const query = {
            text: `INSERT INTO "appartient" (group_id, match_id) VALUES ($1, (SELECT id FROM "match" WHERE match_pandascore = $2))`,
            values: [group_id, matchs_id]
        };
        const result = await db.query(query);
        return result.rows;
    },
    addMatchsToGroup: async function (group_id, matchs_id) {
        const query = {
            text: `INSERT INTO "appartient" (group_id, match_id) VALUES ($1, $2)`,
            values: [group_id, matchs_id]
        };
        const result = await db.query(query);
        return result.rows;

    },
    addMatchsToDatabase: async function (match_id) {
        const query = {
            text: `INSERT INTO "match" (match_pandascore) VALUES ( $1 ) ON CONFLICT(match_pandascore) DO NOTHING`,
            values: [match_id],
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));;
        return result.rows[0];

    },
    linkGroupAndMatches: async function (group_id, matchs_infos) {
        const query = {
            text: `INSERT INTO "group_matchs" (group_id, matchs_infos) VALUES ( $1, $2 )`,
            values: [group_id, matchs_infos],
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));;
        return result.rows[0];

    },
    getMatchesInfosOfPublicGroup: async function (group_id) {
        const query = {
            text: `SELECT matchs_infos FROM "group_matchs" WHERE group_id =  ( $1 ) `,
            values: [group_id],
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));;
        return result.rows[0];

    },
    getMatchesInfosOfPublicGroups: async function () {
        const query = {
            text: `SELECT matchs_infos FROM "group_matchs" `,
            values: [],
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));;
        return result.rows[0];
    },
    findIfMatchIsAllready: async function (match_id) {
        const query = {
            text: `SELECT * FROM "match" WHERE match_pandascore =  ( $1 ) `,
            values: [match_id],
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));;
        return result.rows[0];

    },

    verifyValidityOfInvitationLink: async function (invitation_link) {
        const query = {
            text: `SELECT * FROM "group" WHERE lower(invitation_link) = $1`,
            values: [invitation_link]
        };
        const result = await db.query(query);
        return result.rows;
    },
    getInfosFromGroup: async function (group_id) {
        const query = {
            text: `SELECT "p"."group_id", "p"."user_id", "u"."id", "u"."username", "g"."group_leader_id", "g"."invitation_link"
            FROM "user" u
            INNER JOIN participe p
                ON p.user_id = u.id
            LEFT JOIN "group" g
                ON p.group_id = g.id
            WHERE "g"."id" = $1
                AND "p"."group_id" = $1`,
            values: [group_id]
        };
        const result = await db.query(query);
        return result.rows;
    },
    getInfosFromGroupByName: async function (group_name, user_id) {
        const query = {
            text: `SELECT "p"."group_id", "g"."name", count("p"."user_id") AS nb_participants , "g"."players_number" AS nb_participants_max,
            bool_or(case when user_id = $2 then "p"."hasBet" end) AS "hasBet"
            FROM "participe" p 
            INNER JOIN "group" g ON "g"."id" = "p"."group_id"
            WHERE "g"."name" = $1
             GROUP BY "p"."group_id", "g"."name", "g"."players_number"`,
            values: [group_name, user_id]
        };
        const result = await db.query(query);
        return result.rows[0];
    },
    getInfosFromGroupIfPublic: async function (username) {
        const query = {
            text: `SELECT "p"."group_id", "g"."name", 
            count("p"."user_id") AS nb_participants , 
            "g"."players_number" AS nb_participants_max, 
            "g"."status",
            "user"."username" AS leader_username,
			json_agg("group_matchs"."matchs_infos") AS matchs_infos,
			bool_or(case when "p"."user_id" = (SELECT "u"."id" FROM "user" u WHERE "u"."username" = $1) then true else false end) AS "playerJoined"
            FROM "participe" p 
            INNER JOIN "group" g ON "g"."id" = "p"."group_id"
            INNER JOIN "user" ON "g"."group_leader_id" = "user"."id"
			INNER JOIN "group_matchs" ON "group_matchs"."group_id" = "g"."id"
            WHERE "g"."isprivate" = false AND "g"."status" != 'expired' AND "g"."status" != 'finished'
            GROUP BY "p"."group_id", "g"."name", "g"."players_number", "g"."status", "user"."username", "g"."created_at"
			HAVING count("p"."user_id") <> "g"."players_number"
			ORDER BY "g"."created_at" DESC`,
            values: [username]
        };
        const result = await db.query(query);
        return result.rows;
    },
    getInfosFromGroupIfPublicByName: async function (group_name) {
        const query = {
            text: `SELECT "p"."group_id", "g"."name", 
            count("p"."user_id") AS nb_participants , 
            "g"."players_number" AS nb_participants_max, 
            "g"."status",
            "user"."username" AS leader_username,
			"group_matchs"."matchs_infos" AS matchs_infos
            FROM "participe" p 
            INNER JOIN "group" g ON "g"."id" = "p"."group_id"
            INNER JOIN "user" ON "g"."group_leader_id" = "user"."id"
			RIGHT JOIN "group_matchs" ON "group_matchs"."group_id" = "g"."id"
            WHERE "g"."isprivate" = false AND "g"."name" = $1
            GROUP BY "p"."group_id", "g"."name", "g"."players_number", "g"."status", "user"."username", "group_matchs"."matchs_infos"`,
            values: [group_name]
        };
        const result = await db.query(query);
        return result.rows[0];
    },
    getInfosFromGroupIfPublicById: async function (group_id) {
        const query = {
            text: `SELECT "p"."group_id", "g"."name", 
            count("p"."user_id") AS nb_participants , 
            "g"."players_number" AS nb_participants_max, 
            "g"."status",
            "user"."username" AS leader_username,
			"group_matchs"."matchs_infos" AS matchs_infos
            FROM "participe" p 
            INNER JOIN "group" g ON "g"."id" = "p"."group_id"
            INNER JOIN "user" ON "g"."group_leader_id" = "user"."id"
			INNER JOIN "group_matchs" ON "group_matchs"."group_id" = "g"."id"
            WHERE "g"."isprivate" = false AND "g"."id" = $1
            GROUP BY "p"."group_id", "g"."name", "g"."players_number", "g"."status", "user"."username", "group_matchs"."matchs_infos"`,
            values: [group_id]
        };
        const result = await db.query(query);
        return result.rows[0];
    },
    getInfosFromGroupIfPublicByIdAndAvalaible: async function (group_id) {
        const query = {
            text: `SELECT "p"."group_id", "g"."name", 
            count("p"."user_id") AS nb_participants , 
            "g"."players_number" AS nb_participants_max, 
            "g"."status",
            "user"."username" AS leader_username,
			"group_matchs"."matchs_infos" AS matchs_infos
            FROM "participe" p 
            INNER JOIN "group" g ON "g"."id" = "p"."group_id"
            INNER JOIN "user" ON "g"."group_leader_id" = "user"."id"
			INNER JOIN "group_matchs" ON "group_matchs"."group_id" = "g"."id"
            WHERE "g"."isprivate" = false AND "g"."id" = $1 AND "g"."status" = 'in progress'
            GROUP BY "p"."group_id", "g"."name", "g"."players_number", "g"."status", "user"."username", "group_matchs"."matchs_infos"`,
            values: [group_id]
        };
        const result = await db.query(query);
        return result.rows[0];
    },
    getNumberOfPlayersByGroupId: async function (group_id) {
        const query = {
            text: `SELECT count("p"."user_id") AS nb_participants , 
            "g"."players_number" AS nb_participants_max
            FROM "participe" p 
            INNER JOIN "group" g ON "g"."id" = "p"."group_id"
            INNER JOIN "user" ON "g"."group_leader_id" = "user"."id"
            WHERE "g"."isprivate" = false AND "g"."id" = $1
            GROUP BY "g"."players_number"`,
            values: [group_id]
        };
        const result = await db.query(query);
        return result.rows[0];
    },
    getAllInfosFromGroupByUserId: async function (group_id, user_id) {
        const query = {
            text: `SELECT "p"."group_id", "g"."name", count("p"."user_id") AS nb_participants , "g"."players_number" AS nb_participants_max,
            bool_or(case when user_id = $2 then "p"."hasBet" end) AS "hasBet"
            FROM "participe" p 
            INNER JOIN "group" g ON "g"."id" = "p"."group_id"
            WHERE "p"."group_id" 
            IN ( SELECT group_id FROM participe WHERE user_id = $2 AND group_id = $1)
             GROUP BY "p"."group_id", "g"."name", "g"."players_number"`,
            values: [group_id, user_id]
        };
        const result = await db.query(query);
        return result.rows;
    },
    checkIfUserBetOnGroup: async function (group_id, user_id) {
        const query = {
            text: `SELECT bool_or(case when user_id = $2 then "p"."hasBet" end) AS "hasBet"
            FROM "participe" p 
            INNER JOIN "group" g ON "g"."id" = "p"."group_id"
            WHERE "p"."group_id" 
            IN ( SELECT group_id FROM participe WHERE user_id = $2 AND group_id = $1)`,
            values: [group_id, user_id]
        };
        const result = await db.query(query);
        return result.rows[0];
    },
    getLeaderFromGroup: async function (user_id) {
        const query = {
            text: `SELECT "p"."group_id", "u"."id", "u"."username", "g"."group_leader_id"
            FROM "user" u
            INNER JOIN participe p
                ON p.user_id = u.id
            INNER JOIN "group" g
                ON p.group_id = g.id
            WHERE "u"."id" = $1
                AND "g"."group_leader_id" = $1`,
            values: [user_id]
        };
        const result = await db.query(query);
        return result.rows;
    },
    getGroupsOfUser: async function (user_id) {
        const query = {
            text: `SELECT "p"."group_id", 
            "g"."name", 
            count("p"."user_id")::int AS nb_participants , 
            "g"."players_number" AS nb_participants_max,
            "g"."status",
            bool_or(case when user_id = $1 then "p"."hasBet" end) AS "hasBet",
			bool_or(case when "g"."group_leader_id" = $1 then true else false end) AS "isLeader",
			"g"."isprivate"
            FROM "participe" p 
            INNER JOIN "group" g ON "g"."id" = "p"."group_id"
            WHERE "p"."group_id" 
            IN ( SELECT group_id FROM participe WHERE user_id = $1)
             GROUP BY "p"."group_id", "g"."name", "g"."players_number", "g"."status", "g"."isprivate" `,
            values: [user_id],
        };
        const result = await db.query(query);
        return result.rows;
    },
    getInfosGroupsByUserId: async function (group_id, user_id) {
        const query = {
            text: `SELECT "p"."group_id","p"."user_id", "m"."id", "m"."match_pandascore"
                    FROM "participe" p
                    FULL JOIN appartient a
                        ON p.group_id = a.group_id
                    FULL JOIN "user" u
                        ON u.id = a.user_id
                    WHERE "a"."group_id" = $1 ORDER BY match_pandascore DESC`,
            values: [group_id, user_id]
        };
        const result = await db.query(query);
        return result.rows;
    },
    leaveGroup: async function (user_id, group_id) {
        const query = {
            text: `DELETE from "participe" WHERE user_id = $1 AND group_id = $2 `,
            values: [user_id, group_id]
        };
        const result = await db.query(query);
        return result.rows;
    },
    getResultOfGroup: async function (group_id, user_id) {
        const query = {
            text: `select "bet"."id", "match"."match_pandascore", "bet"."bet", "bet"."status", "bet"."is_winner", "bet"."group_id"
            from "bet"
            INNER JOIN "match" ON "bet"."match_id" = "match"."id" 
            WHERE ("bet"."group_id" = $1 AND "bet"."user_id" = $2)`,
            values: [group_id, user_id]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    getMatchOfGroup: async function (group_id, user_id) {
        const query = {
            text: `SELECT "p"."group_id", "m"."id", "m"."match_pandascore"
            FROM "participe" p
            INNER JOIN appartient a
                ON p.group_id = a.group_id
            FULL JOIN "match" m
                ON a.match_id = m.id
            WHERE "a"."group_id" = $1
                AND "p"."user_id" = $2 ORDER BY "m"."match_pandascore" DESC`,
            values: [group_id, user_id]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    getRankOfGroup: async function (group_id) {
        const query = {
            text: `SELECT     row_number() OVER ( ORDER BY Count(*) filter (WHERE is_winner)  DESC ) AS position,
            "user"."id", 
            "group"."name",
            "user"."username",
            CASE WHEN "user"."koalacoin" < 249 AND "user"."koalacoin" >= 100 THEN 'Koala Bronze' 
            WHEN "user"."koalacoin" < 349 AND "user"."koalacoin" >= 250 THEN 'Koala Silver'
            WHEN "user"."koalacoin" < 449  AND "user"."koalacoin" >= 350 THEN 'Koala Gold'
            WHEN "user"."koalacoin" < 699  AND "user"."koalacoin" >= 450 THEN 'Koala Platinum' 
            WHEN "user"."koalacoin" < 999 AND "user"."koalacoin" >= 700 THEN 'Koala Diamond'
            WHEN "user"."koalacoin" < 1149 AND "user"."koalacoin" >= 1000 THEN 'Koala Titanium'
            WHEN "user"."koalacoin" > 1250 THEN 'Koala Supreme'
            ELSE 'Super N00b' END
            AS grade,
            Count(*) filter (WHERE is_winner)     AS "winning_bet",
            count("bet"."id")                     AS "bet_total_number",
            min("participe"."winned_points") AS "winned_points",
			substring("avatar"."avatar_path", 16) as "avatar_path"
            FROM       "bet"
            inner join "user"
            ON         "user"."id" = "bet"."user_id" 
            INNER JOIN "group" 
            ON "bet"."group_id" = "group"."id"
            INNER JOIN "participe"
            ON "participe"."group_id" = "group"."id" AND "participe"."user_id" = "bet"."user_id"
			INNER JOIN "user_has_avatar"
            ON "user_has_avatar"."user_id" = "user"."id"
			INNER JOIN "avatar"
            ON "user_has_avatar"."avatar_id" = "avatar"."id"
            WHERE      "bet"."group_id" = $1
            GROUP BY   "user"."id", "group"."name", "avatar"."avatar_path"
            ORDER BY   winning_bet DESC`,
            values: [group_id]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
};
module.exports = groupDataMapper;