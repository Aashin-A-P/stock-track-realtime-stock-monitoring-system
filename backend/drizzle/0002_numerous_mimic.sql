ALTER TABLE "UsersTable" RENAME COLUMN "first_name" TO "user_name";--> statement-breakpoint
ALTER TABLE "UsersTable" DROP CONSTRAINT "UsersTable_first_name_unique";--> statement-breakpoint
ALTER TABLE "UsersTable" ADD CONSTRAINT "UsersTable_user_name_unique" UNIQUE("user_name");