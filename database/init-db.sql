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
	"product_price" integer DEFAULT 0 NOT NULL,
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

--
-- Data for Name: BudgetsTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."BudgetsTable" (budget_id, start_date, end_date, amount, budget_name) OVERRIDING SYSTEM VALUE VALUES (3, '2021-01-01', '2021-12-31', 1500000, 'Main Budget 2020-2021');
INSERT INTO public."BudgetsTable" (budget_id, start_date, end_date, amount, budget_name) OVERRIDING SYSTEM VALUE VALUES (2, '2020-01-01', '2020-12-31', 1200000, 'Main Budget 2019-2020');
INSERT INTO public."BudgetsTable" (budget_id, start_date, end_date, amount, budget_name) OVERRIDING SYSTEM VALUE VALUES (4, '2022-01-01', '2022-12-31', 2000000, 'Main Budget 2021-2022');
INSERT INTO public."BudgetsTable" (budget_id, start_date, end_date, amount, budget_name) OVERRIDING SYSTEM VALUE VALUES (5, '2023-01-01', '2023-12-31', 2000000, 'Main Budget 2022-2023');
INSERT INTO public."BudgetsTable" (budget_id, start_date, end_date, amount, budget_name) OVERRIDING SYSTEM VALUE VALUES (6, '2024-01-01', '2024-12-31', 3000000, 'Main Budget 2023-2024');
INSERT INTO public."BudgetsTable" (budget_id, start_date, end_date, amount, budget_name) OVERRIDING SYSTEM VALUE VALUES (1, '2019-01-01', '2019-12-31', 1000000, 'Main Budget 2018-2019');


--
-- Data for Name: CategoriesTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (1, 'Electronics');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (2, 'Vehicles');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (3, 'Hardwares');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (4, 'Systems');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (5, 'Projectors');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (7, 'New category Add');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (8, 'Category1');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (9, 'Category2');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (11, 'Another Category');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (12, 'Another new one');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (13, 'NewLoc');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (14, 'NewTestLoc');
INSERT INTO public."CategoriesTable" (category_id, category_name) OVERRIDING SYSTEM VALUE VALUES (15, 'TEST Category');


--
-- Data for Name: CategoryWiseBudgetsTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (25, 5, 5, 50000, '2024-11-23 00:42:51.269257');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (1, 1, 1, 10000.00, '2019-01-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (2, 1, 2, 8000.00, '2019-03-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (3, 1, 3, 12000.00, '2019-05-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (4, 1, 4, 10000.00, '2019-07-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (5, 2, 1, 11000.00, '2020-01-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (6, 2, 2, 8500.00, '2020-04-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (7, 2, 3, 12500.00, '2020-05-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (8, 2, 4, 11000.00, '2020-08-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (9, 3, 1, 12000.00, '2021-02-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (10, 3, 2, 9000.00, '2021-05-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (11, 3, 3, 13000.00, '2021-06-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (12, 3, 4, 12000.00, '2021-09-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (13, 4, 1, 13000.00, '2022-03-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (14, 4, 2, 9500.00, '2022-04-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (15, 4, 3, 13500.00, '2022-07-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (16, 4, 4, 13000.00, '2022-11-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (17, 5, 1, 14000.00, '2023-01-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (18, 5, 2, 10000.00, '2023-03-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (19, 5, 3, 14000.00, '2023-06-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (20, 5, 4, 14000.00, '2023-11-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (21, 6, 1, 15000.00, '2024-02-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (22, 6, 2, 10500.00, '2024-04-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (23, 6, 3, 14500.00, '2024-06-22 19:12:51.269');
INSERT INTO public."CategoryWiseBudgetsTable" (category_wise_budget_id, budget_id, category_id, amount, created_at) OVERRIDING SYSTEM VALUE VALUES (24, 6, 4, 15000.00, '2024-08-22 19:12:51.269');


--
-- Data for Name: InvoiceTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (22, '123 Main St, Cityville', '456 Elm St, Townsville', 1000.0, '2024-11-29', '/uploads/invoice-12345.png', 'ABC1234', '2024-11-27', 5);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (26, 'sjkksj', 'ksjkfds', 100, '2025-02-14', '', '123kjds', '2025-02-11', 2);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (27, 'sjkksj', 'ksjkfds', 100, '2025-02-14', '', '123kjds', '2025-02-11', 2);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (28, 'sljfskd', 'sfsa', 5000, '2025-02-15', '', 'jskfsd', '2025-02-11', 5);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (29, 'sfsd', 'slkjsdh', 1000, '2025-02-14', '', '1', '2025-02-11', 3);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (25, 'sjkskjfk
skjsdkjfs
lsiejfsd
kwuijsdkc', 'scnijklsfdmc,n
xvn mejrikdsfmcxslk
xvjmeiojdsn', 1000, '2025-02-14', '', '123CDEF', '2025-02-13', 1);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (24, 'Aashin A P kjasghfjfbfkjarwrhjfrwffwkjffkhwfk
KJSFDFHJDFHJ
djhjshjf', 'MIT IT DEPT 
', 1234567.5, '2019-01-21', '', '123456ABC', '2019-01-20', 6);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (30, 'kjskfls', 'kshjksdh', 100, '2025-02-18', '', '12ABBA21', '2025-02-05', 3);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (31, 'jshsj', 'kshjkfs', 100, '2025-02-18', '', '1234374863', '2025-02-12', 1);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (23, 'from addr', 'to addr', 120, '2025-02-10', '/uploads/0a78bf06-a44a-4044-b25a-f393b483624a.jpg', 'TEST1234', '2025-02-04', 3);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (32, 'ksjhfsdjf', 'jdshjsdfk', 1000, '2025-03-21', '', '237847jkshfjh', '2025-03-20', 5);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (33, 'ksjhfsdjf', 'jdshjsdfk', 10000, '2025-03-21', '', '237847jkshfjh', '2025-03-20', 5);
INSERT INTO public."InvoiceTable" (invoice_id, from_address, to_address, total_amount, invoice_date, invoice_image, invoice_no, po_date, budget_id) OVERRIDING SYSTEM VALUE VALUES (34, 'ksjhfsdjf', 'jdshjsdfk', 10000, '2025-03-21', '', '237847jkshfjh', '2025-03-20', 5);


--
-- Data for Name: LocationTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (2, 'PR-LAB1', NULL);
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (3, 'PR-LAB2', NULL);
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (4, 'PRGM-LAB1', NULL);
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (5, 'PRGM-LAB2', NULL);
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (6, 'Staff Room', NULL);
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (7, 'OFFICE', NULL);
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (8, 'F0', NULL);
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (9, 'F1', NULL);
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (10, 'F2', NULL);
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (12, 'NewLoc', 'testStaff');
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (13, 'testLoc', 'test Staff');
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (14, 'sampleLoc', 'Staff test');
INSERT INTO public."LocationTable" (location_id, location_name, staff_incharge) OVERRIDING SYSTEM VALUE VALUES (15, 'newLab', 'Dr. Aashin AP ');


--
-- Data for Name: LogsTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (1, 'Stock with id 4 added successfully | Performed by: mukun', '2024-11-30 08:42:44.981509');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (2, 'Stock with id 4 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: mukun', '2024-11-30 08:46:05.391041');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (3, 'Category Another Category added successfully | Performed by: admin', '2024-12-01 16:23:59.885927');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (4, 'Stock with id 5 added successfully | Performed by: admin', '2024-12-01 17:05:30.236288');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (5, 'Stock with id 6 added successfully | Performed by: admin', '2024-12-01 17:05:30.226354');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (6, 'Stock with id 8 added successfully | Performed by: admin', '2024-12-03 09:01:43.04285');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (7, 'Stock with id 7 added successfully | Performed by: admin', '2024-12-03 09:01:43.03168');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (8, 'Stock with id 9 added successfully | Performed by: admin', '2024-12-03 09:01:43.146714');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (9, 'Stock with id 10 added successfully | Performed by: admin', '2024-12-03 09:01:43.151774');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (10, 'Stock with id 13 added successfully | Performed by: admin', '2024-12-03 10:06:43.088003');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (11, 'Stock with id 11 added successfully | Performed by: admin', '2024-12-03 10:06:43.047269');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (12, 'Stock with id 12 added successfully | Performed by: admin', '2024-12-03 10:06:43.072355');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (13, 'Stock with id 14 added successfully | Performed by: admin', '2024-12-03 10:06:43.492164');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (14, 'Stock with id 15 added successfully | Performed by: admin', '2024-12-03 10:06:43.517233');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (15, 'Stock with id 16 added successfully | Performed by: admin', '2024-12-03 10:06:43.737184');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (16, 'Stock with id 17 added successfully | Performed by: admin', '2024-12-03 10:06:43.75214');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (17, 'Category Another new one added successfully | Performed by: admin', '2024-12-03 11:20:37.272431');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (18, 'Stock with id 18 added successfully | Performed by: admin', '2024-12-03 11:21:10.007951');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (19, 'Stock with id 19 added successfully | Performed by: admin', '2024-12-03 11:21:10.022077');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (20, 'User created. | Performed by: admin', '2024-12-06 20:24:45.07371');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (21, 'User created. | Performed by: admin', '2024-12-06 20:29:18.875318');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (22, 'User created. | Performed by: admin', '2024-12-06 20:29:33.30072');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (23, 'User created. | Performed by: admin', '2024-12-06 20:33:40.070846');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (24, 'User created. | Performed by: admin', '2024-12-06 20:34:07.331122');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (25, 'User created. | Performed by: admin', '2024-12-06 20:36:29.476034');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (26, 'User created. | Performed by: admin', '2024-12-06 20:44:03.826664');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (27, 'User created. | Performed by: admin', '2024-12-06 20:46:31.216085');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (28, 'User created. | Performed by: admin', '2024-12-06 20:49:29.615712');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (29, 'User created. | Performed by: admin', '2024-12-06 20:52:41.30733');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (30, 'User created. | Performed by: admin', '2024-12-06 21:01:27.040763');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (31, 'User created. | Performed by: admin', '2024-12-06 21:14:17.382212');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (32, 'User created. | Performed by: admin', '2024-12-06 21:15:02.760939');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (33, 'User created. | Performed by: admin', '2024-12-06 21:17:39.940696');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (34, 'User created. | Performed by: admin', '2024-12-06 21:18:26.282522');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (35, 'User created. | Performed by: admin', '2024-12-06 21:19:34.055803');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (36, 'User created. | Performed by: admin', '2024-12-06 21:30:51.030564');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (37, 'User created. | Performed by: admin', '2024-12-06 21:33:24.711258');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (38, 'User created. | Performed by: admin', '2024-12-06 21:35:02.942794');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (39, 'User created. | Performed by: admin', '2024-12-06 21:35:18.292946');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (40, 'User with id 49 created. | Performed by: admin', '2024-12-07 07:07:06.011342');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (41, 'User with id 50 created. | Performed by: admin', '2024-12-07 07:09:02.816456');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (42, 'User with id 51 created. | Performed by: admin', '2024-12-07 09:01:46.187003');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (43, 'Stock with id 4 deleted. 
Deleted Data : [object Object] | Performed by: admin', '2024-12-08 17:48:55.806372');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (44, 'Stock with id 19 deleted. 
Deleted Data : [object Object] | Performed by: admin', '2024-12-08 17:50:00.532326');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (45, 'User with ID 2 updated. | Performed by: admin', '2024-12-08 17:53:26.571575');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (46, 'User with ID 7 updated. | Performed by: admin', '2024-12-08 19:38:07.513951');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (47, 'User with ID 7 updated. | Performed by: admin', '2024-12-08 19:42:16.638694');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (48, 'User with ID 43 updated. | Performed by: admin', '2024-12-09 04:58:01.622726');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (49, 'User with id 43 deleted. | Performed by: admin', '2024-12-09 05:10:35.422281');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (50, 'User with id 52 created. | Performed by: admin', '2024-12-09 05:39:06.953857');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (51, 'Stock with id 21 added successfully | Performed by: admin', '2024-12-09 06:06:45.875497');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (52, 'Stock with id 20 added successfully | Performed by: admin', '2024-12-09 06:06:45.884019');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (53, 'User with ID 46 updated. | Performed by: admin', '2025-01-27 11:19:10.372556');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (54, 'User with id 52 deleted. | Performed by: admin', '2025-01-27 11:19:13.070007');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (55, 'User with ID 46 updated. | Performed by: admin', '2025-01-27 11:19:13.611157');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (56, 'User with ID 46 updated. | Performed by: admin', '2025-01-27 11:19:15.345744');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (57, 'User with id 44 deleted. | Performed by: admin', '2025-01-27 11:19:41.382384');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (58, 'Stock with id 24 added successfully | Performed by: admin', '2025-02-05 17:59:27.103908');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (59, 'Stock with id 25 added successfully | Performed by: admin', '2025-02-05 18:01:02.515408');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (60, 'Stock with id 25 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-05 18:44:45.862442');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (61, 'Stock with id 25 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-05 18:47:56.721803');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (62, 'Stock with id 26 added successfully | Performed by: admin', '2025-02-06 10:01:36.209828');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (63, 'Stock with id 27 added successfully | Performed by: admin', '2025-02-06 10:55:09.068081');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (64, 'Stock with id 28 added successfully | Performed by: admin', '2025-02-06 14:55:00.984885');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (65, 'Stock with id 29 added successfully | Performed by: admin', '2025-02-07 12:17:09.33868');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (66, 'Stock with id 29 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-07 13:04:41.388588');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (67, 'Stock with id 14 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-08 11:14:11.298151');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (68, 'Stock with id 14 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-08 11:15:21.141368');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (69, 'Stock with id 30 added successfully | Performed by: admin', '2025-02-09 09:41:47.697299');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (70, 'Stock with id 31 added successfully | Performed by: admin', '2025-02-09 12:03:48.026935');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (71, 'Category NewLoc added successfully | Performed by: admin', '2025-02-09 12:15:06.162108');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (72, 'Stock with id 33 added successfully | Performed by: admin', '2025-02-09 12:24:09.047346');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (73, 'Stock with id 32 added successfully | Performed by: admin', '2025-02-09 12:24:09.04265');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (74, 'Stock with id 38 added successfully | Performed by: admin', '2025-02-10 17:13:18.291488');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (75, 'Stock with id 39 added successfully | Performed by: admin', '2025-02-10 17:56:56.21134');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (76, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-10 21:29:09.432259');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (77, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-10 21:29:27.021892');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (78, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-10 21:31:05.186936');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (79, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-10 21:33:43.78272');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (80, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-10 21:33:57.041338');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (81, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-10 21:36:53.011839');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (82, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-10 21:56:42.971134');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (83, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-10 21:56:51.26111');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (84, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-13 14:50:59.640181');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (85, 'Stock with id 40 added successfully | Performed by: admin', '2025-02-13 14:54:29.239882');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (86, 'Stock with id 40 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-13 14:56:41.922253');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (87, 'Stock with id 41 added successfully | Performed by: admin', '2025-02-15 20:28:20.338658');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (88, 'Stock with id 42 added successfully | Performed by: admin', '2025-02-15 20:28:20.343712');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (89, 'Stock with id 43 added successfully | Performed by: admin', '2025-02-15 20:28:20.345705');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (90, 'Stock with id 44 added successfully | Performed by: admin', '2025-02-15 20:28:21.381673');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (91, 'Stock with id 45 added successfully | Performed by: admin', '2025-02-15 20:28:21.686165');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (92, 'Stock with id 46 added successfully | Performed by: admin', '2025-02-15 20:45:26.900914');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (93, 'Stock with id 47 added successfully | Performed by: admin', '2025-02-16 03:28:24.357265');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (94, 'Stock with id 48 added successfully | Performed by: admin', '2025-02-16 03:28:24.362808');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (95, 'Stock with id 49 added successfully | Performed by: admin', '2025-02-16 03:28:24.837603');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (96, 'Stock with id 50 added successfully | Performed by: admin', '2025-02-16 03:28:26.847938');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (97, 'Stock with id 51 added successfully | Performed by: admin', '2025-02-16 03:28:27.022224');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (98, 'Stock with id 52 added successfully | Performed by: admin', '2025-02-16 08:43:36.688722');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (99, 'Stock with id 53 added successfully | Performed by: admin', '2025-02-16 08:43:36.708954');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (100, 'Stock with id 55 added successfully | Performed by: admin', '2025-02-16 08:43:37.099111');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (101, 'Stock with id 54 added successfully | Performed by: admin', '2025-02-16 08:43:37.099412');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (102, 'Stock with id 56 added successfully | Performed by: admin', '2025-02-16 08:43:37.317723');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (103, 'Stock with id 58 added successfully | Performed by: admin', '2025-02-16 08:43:37.344007');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (104, 'Stock with id 59 added successfully | Performed by: admin', '2025-02-16 08:43:37.34337');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (105, 'Stock with id 57 added successfully | Performed by: admin', '2025-02-16 08:43:37.34596');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (106, 'Stock with id 60 added successfully | Performed by: admin', '2025-02-16 08:43:37.76878');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (107, 'Stock with id 61 added successfully | Performed by: admin', '2025-02-16 08:43:39.774345');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (109, 'Stock with id 63 added successfully | Performed by: admin', '2025-02-19 07:13:53.095615');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (108, 'Stock with id 62 added successfully | Performed by: admin', '2025-02-19 07:13:53.092644');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (110, 'Stock with id 64 added successfully | Performed by: admin', '2025-02-19 07:13:53.488342');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (111, 'Stock with id 65 added successfully | Performed by: admin', '2025-02-19 07:13:53.677271');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (112, 'Stock with id 66 added successfully | Performed by: admin', '2025-02-19 07:13:53.67866');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (113, 'Stock with id 68 added successfully | Performed by: admin', '2025-02-19 07:19:23.917309');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (114, 'Stock with id 67 added successfully | Performed by: admin', '2025-02-19 07:19:23.917662');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (115, 'Stock with id 69 added successfully | Performed by: admin', '2025-02-19 07:19:24.333808');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (116, 'Stock with id 70 added successfully | Performed by: admin', '2025-02-19 07:19:24.552725');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (117, 'Stock with id 71 added successfully | Performed by: admin', '2025-02-19 07:19:24.553722');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (118, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-20 18:08:17.290496');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (119, 'Stock with id 39 updated. 
old data: [object Object] 
new data: [object Object] | Performed by: admin', '2025-02-20 18:08:59.640356');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (120, 'Category NewTestLoc added successfully | Performed by: admin', '2025-03-11 15:53:02.107097');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (121, 'User with ID 46 updated. | Performed by: admin', '2025-03-11 16:00:41.25722');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (122, 'Category TEST Category added successfully | Performed by: admin', '2025-03-12 11:32:02.185589');
INSERT INTO public."LogsTable" (log_id, description, created_at) OVERRIDING SYSTEM VALUE VALUES (123, 'User with ID 47 updated. | Performed by: admin', '2025-03-12 11:38:42.080709');


--
-- Data for Name: PrivilegesTable; Type: TABLE DATA; Schema: public; Owner: admin
--

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
-- Data for Name: StatusTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."StatusTable" (status_id, status_description) OVERRIDING SYSTEM VALUE VALUES (3, 'NEW');
INSERT INTO public."StatusTable" (status_id, status_description) OVERRIDING SYSTEM VALUE VALUES (4, 'WORKING');
INSERT INTO public."StatusTable" (status_id, status_description) OVERRIDING SYSTEM VALUE VALUES (5, 'CONDEMN');
INSERT INTO public."StatusTable" (status_id, status_description) OVERRIDING SYSTEM VALUE VALUES (6, 'TO-SELL');
INSERT INTO public."StatusTable" (status_id, status_description) OVERRIDING SYSTEM VALUE VALUES (7, 'REFURBISHED');
INSERT INTO public."StatusTable" (status_id, status_description) OVERRIDING SYSTEM VALUE VALUES (8, 'Maintenance');
INSERT INTO public."StatusTable" (status_id, status_description) OVERRIDING SYSTEM VALUE VALUES (9, 'TRANSFERED');
INSERT INTO public."StatusTable" (status_id, status_description) OVERRIDING SYSTEM VALUE VALUES (10, 'RECIEVED');
INSERT INTO public."StatusTable" (status_id, status_description) OVERRIDING SYSTEM VALUE VALUES (11, 'TestStatus');


--
-- Data for Name: ProductsTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (40, '1-1-1', 'PC', 'ajkhskjfhksfhhfshfkjsfhkjsfhkjshsiufj', 2, 3, 0.5, '', 24, 4, 1234567, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (41, '123-45-2', 'Desktop', 'jskjwij
kcnklsjd
skncklms
ssfkjsw09ewi', 2, 3, 50, '', 25, 1, 150, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (42, '123-45-2', 'Desktop', 'jskjwij
kcnklsjd
skncklms
ssfkjsw09ewi', 2, 3, 50, '', 25, 1, 150, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (43, '123-45-2', 'Desktop', 'jskjwij
kcnklsjd
skncklms
ssfkjsw09ewi', 2, 3, 50, '', 25, 1, 150, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (44, '123-45-2', 'Desktop', 'jskjwij
kcnklsjd
skncklms
ssfkjsw09ewi', 2, 3, 50, '', 25, 1, 150, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (45, '123-45-2', 'Desktop', 'jskjwij
kcnklsjd
skncklms
ssfkjsw09ewi', 2, 3, 50, '', 25, 1, 150, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (46, '1-3-4', 'skjfd', 'skjfkslj', 3, 3, 20, '', 27, 1, 80, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (47, 'js-rr3-234rf', 'sdfdsfd', 'sfad', 8, 7, 100, '', 28, 12, 900, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (48, 'js-rr3-234rf', 'sdfdsfd', 'sfad', 8, 7, 100, '', 28, 12, 900, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (49, 'js-rr3-234rf', 'sdfdsfd', 'sfad', 8, 7, 100, '', 28, 12, 900, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (50, 'js-rr3-234rf', 'sdfdsfd', 'sfad', 8, 7, 100, '', 28, 12, 900, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (51, 'js-rr3-234rf', 'sdfdsfd', 'sfad', 7, 7, 100, '', 28, 12, 900, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (52, '1-3-4', '243', 'sjdkfdjs', 10, 5, 10, '', 29, 3, 90, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (53, '1-3-4', '243', 'sjdkfdjs', 10, 5, 10, '', 29, 3, 90, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (54, '1-3-4', '243', 'sjdkfdjs', 10, 5, 10, '', 29, 3, 90, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (55, '1-3-4', '243', 'sjdkfdjs', 10, 5, 10, '', 29, 3, 90, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (56, '1-3-4', '243', 'sjdkfdjs', 15, 5, 10, '', 29, 3, 90, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (57, '1-3-4', '243', 'sjdkfdjs', 15, 5, 10, '', 29, 3, 90, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (58, '1-3-4', '243', 'sjdkfdjs', 15, 5, 10, '', 29, 3, 90, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (59, '1-3-4', '243', 'sjdkfdjs', 15, 5, 10, '', 29, 3, 90, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (60, '1-3-4', '243', 'sjdkfdjs', 15, 5, 10, '', 29, 3, 90, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (61, '1-3-4', '243', 'sjdkfdjs', 15, 5, 10, '', 29, 3, 90, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (62, '2-3-1-[1/1]', 'jskfh', 'kjshfd', 3, 3, 2, '', 30, 2, 18, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (63, '2-3-1-[1/1]', 'jskfh', 'kjshfd', 3, 3, 2, '', 30, 2, 18, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (64, '2-3-1-[1/1]', 'jskfh', 'kjshfd', 3, 3, 2, '', 30, 2, 18, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (65, '2-3-1-[1/1]', 'jskfh', 'kjshfd', 8, 3, 2, '', 30, 2, 18, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (66, '2-3-1-[1/1]', 'jskfh', 'kjshfd', 8, 3, 2, '', 30, 2, 18, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (67, '12-123-8-[1/1]', 'jdskh', 'hjkjkh', 5, 3, 2, '', 31, 2, 18, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (68, '12-123-8-[1/1]', 'jdskh', 'hjkjkh', 5, 3, 2, '', 31, 2, 18, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (69, '12-123-8-[1/1]', 'jdskh', 'hjkjkh', 5, 3, 2, '', 31, 2, 18, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (70, '12-123-8-[1/1]', 'jdskh', 'hjkjkh', 9, 3, 2, '', 31, 2, 18, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (71, '12-123-8-[1/1]', 'jdskh', 'hjkjkh', 9, 3, 2, '', 31, 2, 18, 'new', '', '');
INSERT INTO public."ProductsTable" (product_id, product_vol_page_serial, product_name, product_description, location_id, status_id, "GST_amount", product_image, invoice_id, category_id, product_price, status_description, transfer_letter, remarks) OVERRIDING SYSTEM VALUE VALUES (39, '1-2-3', 'sample product', 'sample test data', 4, 4, 18, '/uploads/d51533f7-0e69-4df5-bb65-f3e02919d37a.jpg', 23, 1, 102, 'new', '/uploads/7abecd8f-a7b3-4c78-9cc4-1fcf3332b959.jpg', 'this is working');


--
-- Data for Name: UsersTable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (1, 'admin', '$2a$10$DPGW5SMSxi52ZhzaXT7M/OGBkXVbZSAJnR7D7ajlEjkf14D76V8uq', '2024-11-19 13:40:15.016923', 'admin');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (4, 'john', '$2a$10$ah5WU.Iktlpy3Hlw/C4TWuHinQ0BGXxV3jpx7F2BHpM9FgldpkKYS', '2024-11-26 16:37:52.806592', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (5, 'madhu', '$2a$10$uRDz/.DSdO7vNfjsPv4gMOm8hS83QxkE5CoQ6194twsW.1p3mD2y2', '2024-11-26 16:39:15.50641', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (6, 'vasuki', '$2a$10$Aq3Jh2oLSNasJuwg8q7NQuo5BENTnFt19xqodPIw2/4F67q42QScO', '2024-11-26 16:39:29.171942', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (8, 'malik', '$2a$10$EcfxZ6NJouMqmgrHvBV9iuPRPb.E3s5OgsYmIA3acnI1pFxS.TgE2', '2024-11-26 16:39:40.36177', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (9, 'gayu', '$2a$10$IgcgM58UPFT1kgWWuXEu0.WComTCFaA8zYdPsTaaxPOmw6ot7HBzW', '2024-11-26 16:39:47.346894', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (10, 'aash', '$2a$10$mp5uGaRw7QlJI1RCzSmKzuw7ygwAczhILB1G4cHe90uokj54tKmru', '2024-11-26 16:39:52.436807', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (11, 'sandy', '$2a$10$Amnyfd.haEcRBD3cnpckbOe8eEbBf6d2BNH/d0zATzWvr9LOZsFsS', '2024-11-26 16:40:04.176497', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (15, 'mara', '$2a$10$07QCEQuFCq9K6rMT3jrEz.iSt33ueLrjx89O8OXcUxO7fAI/WYuMa', '2024-11-27 01:47:28.162115', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (3, 'mukun', '$2a$10$DPGW5SMSxi52ZhzaXT7M/OGBkXVbZSAJnR7D7ajlEjkf14D76V8uq', '2024-11-26 16:26:03.993052', 'admin');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (12, 'kumar', '$2a$10$5it/CvRi7sPE.B1W9Xy9YewISX.SK9u6ZYcVud9Tb5wvXo/1mOl9u', '2024-11-26 16:40:12.2314', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (29, 'testuser1', '$2a$10$WFr5EqBcAH0Mi.uhv18WXO3fNwwfqmqkhwjQbhBTYyzf/pIP5DN2e', '2024-12-06 20:24:44.658669', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (30, 'testuser3', '$2a$10$3weuJQafrMB/.xbC2o0dx.NFjq3IxJYKL73CARpEEaeFYYQoChoSW', '2024-12-06 20:29:18.705829', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (31, 'testuser4', '$2a$10$fuSozc4evqJoj9j/W4ptjed0RPrJAnMYttWwJIO.XCXO6IUR71c5K', '2024-12-06 20:29:33.110494', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (32, 'testuser5', '$2a$10$zUHHP7XS64cLPkPlRxq2e.Bwv1euQd5VVnRnI4N1e9dRxNbs/qAFy', '2024-12-06 20:33:39.861095', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (33, 'tempuser1', '$2a$10$hj0fPQJE.h//px6i59fGf.Vk6U8woeys2lpOVAXlP41L.gXqmTxqq', '2024-12-06 20:34:07.076857', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (34, 'tempuser100', '$2a$10$0LGyVAKvIh2GP79mWNmq6uFfwKPVpQpV2UXmNvNZ.AmHPV/WqP23i', '2024-12-06 20:36:29.310949', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (35, 'newuser100', '$2a$10$HO998JwlD3yhvzfXBNg4Humu8ySWH5JlYWc.lHqyYCnhR.96X6xLu', '2024-12-06 20:44:03.411168', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (36, 'tempuser101', '$2a$10$oR58k4vd.vlvFTzW4U7hKOs4k6oVJO67QjOuUncEtEH7.DsjAPyvW', '2024-12-06 20:46:31.041339', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (37, 'tempuser102', '$2a$10$vLH3MSikXsvjnbNXasqjA.Dk1JE7R0FrO12RpabUrRdvZ0Vc/Q2da', '2024-12-06 20:49:29.39582', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (38, 'tempuser109', '$2a$10$gJXlWl1ZZRrvfnq66ntUR.UmULpf.zuZfm5qh389MM.Ct7wmzwTMe', '2024-12-06 20:52:40.982792', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (39, 'tempuser105', '$2a$10$ONO8kxymXnCHrWlbSyZv0O28lKWTadXUum8HDrzg84Gf.3CCOJifG', '2024-12-06 21:01:26.821643', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (40, 'tempuser106', '$2a$10$X5zDkjcGFDQnTb9gqpab6OWvZQzL6cf3KnVtI58Rlfj2U8iWfl0Yq', '2024-12-06 21:14:16.967594', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (41, 'tempuser107', '$2a$10$SXx8KLaIfl4OmwobeIi8CeA.Ja9kbE4NWRZU6eX3fuA3mzKSWUaGa', '2024-12-06 21:15:02.296198', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (42, 'tempuser108', '$2a$10$mIivSCL4nU.nn5epDJfqreRbFposPzGJGxsF2fznMAnPa9dkk0E.q', '2024-12-06 21:17:39.761134', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (45, 'RandomUsername2', '$2a$10$0XVxZk2HMpxhKeI2nrR96ODHUFVz4hc3vqdes5Ps49znvdDjvA.Hm', '2024-12-06 21:30:50.615633', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (48, 'mukun1', '$2a$10$v32LvqZBrG0JIRIDTG6Se.ljCZaC6ZCSN1ybry3oynjrsKGnOGE2.', '2024-12-06 21:35:17.957911', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (49, 'user1343', '$2a$10$m3k5d3dFpOle37j26CoZRuuviWhuxKSL/vqQ4pVuxlCs36aj2PsXa', '2024-12-07 07:07:05.856284', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (50, 'user1432', '$2a$10$Jq4/2wUFQrNzwcfT92PwPuhdG0NWVOOgNkgzZXopL457ctP4Ht51.', '2024-12-07 07:09:02.586463', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (51, 'tempuser1000', '$2a$10$Hs2h/..C3OjmaoUeud.WTeYAwPas66BcpShj7gQU2.OeBFG4zYZGS', '2024-12-07 09:01:45.967061', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (2, 'user', '$2a$10$DPGW5SMSxi52ZhzaXT7M/OGBkXVbZSAJnR7D7ajlEjkf14D76V8uq', '2024-11-20 16:40:06.259228', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (7, 'babu', '$2a$10$42ZEO42MRZBn805sa5MoCeHaLv0v0ie8SKuC8l2BpEFyeADF/0mp2', '2024-11-26 16:39:35.741847', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (46, 'RandomUser3', '$2a$10$JJX5wyt.KajwG/nBYos5SO/Hm6h5sVEdrJCk.QVzGi9C/GRtzqVhm', '2024-12-06 21:33:24.490973', 'user');
INSERT INTO public."UsersTable" (user_id, user_name, password, created_at, role) OVERRIDING SYSTEM VALUE VALUES (47, 'mukun100', '$2a$10$wGQv8YnkwFeRzP4YiUdmUuEs3i3G3Jy7BSGm32Nd3YhoebIpU4WI.', '2024-12-06 21:35:02.787722', 'user');


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
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (18, 3, 5);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (19, 3, 6);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (20, 3, 7);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (21, 3, 10);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (22, 4, 1);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (23, 4, 3);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (24, 4, 9);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (25, 4, 13);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (26, 5, 2);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (27, 5, 6);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (28, 5, 10);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (29, 6, 7);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (30, 6, 11);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (31, 6, 13);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (35, 8, 1);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (36, 8, 5);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (37, 8, 9);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (38, 9, 2);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (39, 9, 6);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (40, 10, 3);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (41, 10, 7);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (42, 11, 4);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (43, 11, 8);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (55, 11, 5);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (56, 12, 1);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (57, 12, 2);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (58, 12, 3);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (59, 2, 1);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (60, 2, 2);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (61, 2, 3);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (62, 2, 4);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (63, 2, 5);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (64, 2, 6);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (65, 2, 7);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (66, 2, 8);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (67, 2, 9);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (68, 2, 10);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (69, 2, 11);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (70, 2, 12);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (71, 2, 13);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (77, 7, 4);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (78, 7, 6);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (79, 7, 8);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (80, 7, 10);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (81, 7, 12);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (82, 7, 13);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (92, 46, 5);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (93, 46, 7);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (94, 46, 13);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (95, 47, 5);
INSERT INTO public."UserPrivilegeTable" (user_privilege_id, user_id, privilege_id) OVERRIDING SYSTEM VALUE VALUES (96, 47, 7);


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

