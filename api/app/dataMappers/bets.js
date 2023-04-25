const db = require('../config/database');
const betDataMapper = {
    createBet: async function (bets, userId, group_id, match_id) {
        const query = {
            text: `INSERT INTO "bet" (bet, is_winner, status, user_id, group_id, match_id) VALUES ($1, false, 'in progress', $2, $3, $4)`,
            values: [bets, userId, group_id, match_id],
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    updateParticipe: async function (userId, group_id) {
        const query = {
            text: `UPDATE "participe" SET "hasBet" = true , updated_at = now() WHERE user_id = $1 AND group_id = $2 `,
            values: [userId, group_id],
        };
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    getBetsByGroupAndUser: async function (group_id, user_id) {
        const query = {
            text: `select "bet"."id", "match"."match_pandascore", "match"."id" as match_id, "bet"."bet", "bet"."status", "bet"."is_winner", "bet"."group_id"
            from "bet"
            INNER JOIN "match" ON "bet"."match_id" = "match"."id" 
            WHERE ("bet"."group_id" = $1 AND "bet"."user_id" = $2) ORDER BY match_pandascore DESC`,
            values: [group_id, user_id]
        }
        const result = await db.query(query).then((e) => e).catch((er) => console.error(er));
        return result.rows;
    },
    getBetsByGroup: async function (group_id) {
        const query = {
            text: `select "bet"."id", "match"."match_pandascore", "match"."id" as match_id, "bet"."bet", "bet"."status", "bet"."is_winner", "bet"."group_id"
            from "bet"
            INNER JOIN "match" ON "bet"."match_id" = "match"."id" 
            WHERE ("bet"."group_id" = $1) ORDER BY match_pandascore DESC`,
            values: [group_id]
        }
        const result = await db.query(query).then((e) => e).catch((er) => console.error(er));
        return result.rows;
    },
    addPointsToUser: async function (user_id, nbKoalaWin) {
        const query = {
            text: `UPDATE "user" SET koalacoin = koalacoin + $2 WHERE id = $1`,
            values: [user_id, nbKoalaWin]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    addPointsToHistory: async function (user_id, group_id, nbKoalaWin) {
        const query = {
            text: `UPDATE "participe" SET winned_points = $3 WHERE user_id = $1 AND group_id = $2`,
            values: [user_id, group_id, nbKoalaWin]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    updateBetStatusWinner: async function (id) {
        const query = {
            text: `UPDATE "bet" SET is_winner = 'true', status = 'finished' , updated_at = now() WHERE id = $1 RETURNING * ;`,
            values: [id]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    updateBetStatusLoser: async function (id) {
        const query = {
            text: `UPDATE "bet" SET is_winner = 'false', status = 'finished' , updated_at = now() WHERE id = $1 RETURNING * ;`,
            values: [id]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    updateBetStatusCanceled: async function (match_id) {
        const query = {
            text: `UPDATE "bet" SET is_winner = 'false', status = 'canceled' , updated_at = now() WHERE match_id = $1 `,
            values: [match_id]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    updateBetStatusPostponed: async function (match_id) {
        const query = {
            text: `UPDATE "bet" SET is_winner = 'false', status = 'postponed' , updated_at = now() WHERE match_id = $1 `,
            values: [match_id]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },
    updateBetAfterGivenPoints: async function (bet_id) {
        const query = {
            text: `UPDATE "bet" SET status = 'pointsdistributed' , updated_at = now() WHERE id = $1`,
            values: [bet_id]
        }
        const result = await db.query(query).then((e) => e).catch((e) => console.error(e));
        return result.rows;
    },

};
module.exports = betDataMapper;