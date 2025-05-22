CREATE TABLE IF NOT EXISTS "BudgetsTable" (
	"budget_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "BudgetsTable_budget_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"budget_name" varchar DEFAULT 'New Budget' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"amount" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CategoriesTable" (
	"category_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "CategoriesTable_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category_name" varchar NOT NULL,
	CONSTRAINT "CategoriesTable_category_name_unique" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CategoryWiseBudgetsTable" (
	"category_wise_budget_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "CategoryWiseBudgetsTable_category_wise_budget_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"budget_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InvoiceTable" (
	"invoice_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "InvoiceTable_invoice_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"invoice_no" varchar DEFAULT 'ABCDEFGH12345' NOT NULL,
	"from_address" varchar NOT NULL,
	"to_address" varchar NOT NULL,
	"total_amount" numeric NOT NULL,
	"invoice_date" date NOT NULL,
	"invoice_image" varchar,
	"po_date" date DEFAULT '2025-02-06' NOT NULL,
	"budget_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LocationTable" (
	"location_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "LocationTable_location_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"location_name" varchar,
	"staff_incharge" varchar,
	CONSTRAINT "LocationTable_location_name_unique" UNIQUE("location_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LogsTable" (
	"log_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "LogsTable_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"description" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PrivilegesTable" (
	"privilege_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "PrivilegesTable_privilege_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"privilege" varchar NOT NULL,
	CONSTRAINT "PrivilegesTable_privilege_unique" UNIQUE("privilege")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductsTable" (
	"product_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ProductsTable_product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_vol_page_serial" varchar NOT NULL,
	"product_name" varchar NOT NULL,
	"product_description" text,
	"location_id" integer,
	"status_id" integer,
	"status_description" varchar DEFAULT 'new',
	"GST_amount" numeric,
	"product_image" varchar,
	"product_price" numeric NOT NULL,
	"invoice_id" integer,
	"transfer_letter" varchar,
	"remarks" varchar,
	"category_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "StatusTable" (
	"status_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "StatusTable_status_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status_description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserPrivilegeTable" (
	"user_privilege_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "UserPrivilegeTable_user_privilege_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"privilege_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UsersTable" (
	"user_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "UsersTable_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_name" varchar NOT NULL,
	"password" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"role" varchar DEFAULT 'user',
	CONSTRAINT "UsersTable_user_name_unique" UNIQUE("user_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CategoryWiseBudgetsTable" ADD CONSTRAINT "CategoryWiseBudgetsTable_budget_id_BudgetsTable_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."BudgetsTable"("budget_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CategoryWiseBudgetsTable" ADD CONSTRAINT "CategoryWiseBudgetsTable_category_id_CategoriesTable_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."CategoriesTable"("category_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InvoiceTable" ADD CONSTRAINT "InvoiceTable_budget_id_BudgetsTable_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."BudgetsTable"("budget_id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_location_id_LocationTable_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."LocationTable"("location_id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_status_id_StatusTable_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."StatusTable"("status_id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_invoice_id_InvoiceTable_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."InvoiceTable"("invoice_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductsTable" ADD CONSTRAINT "ProductsTable_category_id_CategoriesTable_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."CategoriesTable"("category_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPrivilegeTable" ADD CONSTRAINT "UserPrivilegeTable_user_id_UsersTable_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."UsersTable"("user_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPrivilegeTable" ADD CONSTRAINT "UserPrivilegeTable_privilege_id_PrivilegesTable_privilege_id_fk" FOREIGN KEY ("privilege_id") REFERENCES "public"."PrivilegesTable"("privilege_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;


--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (1, 'create_user');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (2, 'read_user');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (3, 'update_user');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (4, 'delete_user');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (5, 'create_stock');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (6, 'read_stock');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (7, 'update_stock');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (8, 'delete_stock');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (9, 'create_budgets');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (10, 'read_budgets');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (11, 'update_budgets');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (12, 'delete_budgets');
INSERT INTO public."PrivilegesTable" (privilege_id, privilege) OVERRIDING SYSTEM VALUE VALUES (13, 'read_log');

--
-- Data for Name: UsersTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (1, 'admin', '$2a$10$DPGW5SMSxi52ZhzaXT7M/OGBkXVbZSAJnR7D7ajlEjkf14D76V8uq', '2024-11-19 13:40:15.016923', 'admin');

--
-- Data for Name: UserPrivilegeTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (1, 1, 1);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (2, 1, 2);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (3, 1, 3);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (4, 1, 4);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (5, 1, 5);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (6, 1, 6);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (7, 1, 7);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (8, 1, 8);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (9, 1, 9);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (10, 1, 10);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (11, 1, 11);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (12, 1, 12);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (13, 1, 13);


--
-- Name: BudgetsTable_budget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."BudgetsTable_budget_id_seq"', 10, true);


--
-- Name: CategoriesTable_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."CategoriesTable_category_id_seq"', 15, true);


--
-- Name: CategoryWiseBudgetsTable_category_wise_budget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."CategoryWiseBudgetsTable_category_wise_budget_id_seq"', 1, false);


--
-- Name: InvoiceTable_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."InvoiceTable_invoice_id_seq"', 34, true);


--
-- Name: LocationTable_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."LocationTable_location_id_seq"', 15, true);


--
-- Name: LogsTable_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."LogsTable_log_id_seq"', 123, true);


--
-- Name: PrivilegesTable_privilege_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."PrivilegesTable_privilege_id_seq"', 25, true);


--
-- Name: ProductsTable_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."ProductsTable_product_id_seq"', 71, true);


--
-- Name: StatusTable_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."StatusTable_status_id_seq"', 11, true);


--
-- Name: UserPrivilegeTable_user_privilege_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."UserPrivilegeTable_user_privilege_id_seq"', 96, true);


--
-- Name: UsersTable_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."UsersTable_user_id_seq"', 52, true);


--
-- PostgreSQL database dump complete
--

