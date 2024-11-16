ALTER TABLE "UsersTable" DROP CONSTRAINT "UsersTable_email_unique";--> statement-breakpoint
ALTER TABLE "UsersTable" DROP COLUMN IF EXISTS "last_name";--> statement-breakpoint
ALTER TABLE "UsersTable" DROP COLUMN IF EXISTS "email";--> statement-breakpoint
ALTER TABLE "UsersTable" ADD CONSTRAINT "UsersTable_first_name_unique" UNIQUE("first_name");