BEGIN;
DROP TABLE IF EXISTS 
"group",
"user",
"bet",
"match",
"avatar";
CREATE TABLE IF NOT EXISTS "avatar" (
  "id" serial PRIMARY KEY NOT NULL,
  "avatar_path" varchar(255) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "user" (
  "id" serial PRIMARY KEY NOT NULL,
  "username" varchar(255) NOT NULL,
  "firstname" varchar(255) NOT NULL,
  "lastname" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "isadmin" boolean NOT NULL DEFAULT '0',
  "recovery_code" varchar(64) DEFAULT '?',
  "refresh_token" varchar(255),
  "password" varchar(255) NOT NULL,
  "koalacoin" integer NOT NULL,
  "avatar_id" integer NOT NULL REFERENCES "avatar"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "group" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "invitation_link" varchar(64) NOT NULL,
  "players_number" integer NOT NULL,
  "group_leader_id" integer NOT NULL,
  "status" varchar(16) NOT NULL,
  "isprivate" boolean NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "user_has_avatar" (
    "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "user" ("id")  on delete cascade,
    "avatar_id" INT NOT NULL REFERENCES "avatar" ("id")
);
CREATE TABLE IF NOT EXISTS "match" (
  "id" serial PRIMARY KEY NOT NULL,
  "match_pandascore" integer NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "appartient" (
  "group_id" integer NOT NULL REFERENCES "group"("id") on delete cascade,
  "match_id" integer NOT NULL REFERENCES "match"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "group_matchs" (
  "group_id" integer NOT NULL REFERENCES "group"("id") on delete cascade,
  "matchs_infos" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "bet" (
  "id" serial PRIMARY KEY NOT NULL,
  "bet" integer NOT NULL,
  "is_winner" boolean NOT NULL,
  "status" varchar(255) NOT NULL,
  "user_id" integer NOT NULL REFERENCES "user"("id") on delete cascade,
  "group_id" integer NOT NULL REFERENCES "group"("id") on delete cascade,
  "match_id" integer NOT NULL REFERENCES "match"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "participe" (
  "group_id" integer NOT NULL REFERENCES "group"("id") on delete cascade,
  "user_id" integer NOT NULL REFERENCES "user"("id")  on delete cascade,
  "hasBet" boolean NOT NULL,
  "winned_points" integer DEFAULT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "tchat" (
  "id" serial PRIMARY KEY NOT NULL,
  "username" varchar(64) NOT NULL,
  "room" varchar(32) NOT NULL,
  "color" varchar(32) NOT NULL, 
  "text" varchar(255) NOT NULL,
  "avatar_path" varchar(64) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "ticket" (
  "id" serial UNIQUE PRIMARY KEY NOT NULL,
  "ticket_code" varchar(8) UNIQUE NOT NULL,
  "subject" varchar(16) NOT NULL,
  "status" varchar(16) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "ticket_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "ticket_code" varchar(8) NOT NULL REFERENCES "ticket"("ticket_code") ON DELETE CASCADE,
  "sender_id" integer NOT NULL REFERENCES "user"("id"),
  "text" varchar(255) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "ticket_participants" (
  "id" serial PRIMARY KEY NOT NULL,
  "ticket_code" varchar(8) NOT NULL REFERENCES "ticket"("ticket_code") ON DELETE CASCADE,
  "participant_1" integer NOT NULL REFERENCES "user"("id"),
  "participant_2" integer NOT NULL REFERENCES "user"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;