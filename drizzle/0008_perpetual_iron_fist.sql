ALTER TABLE "pg-drizzle_contact" DROP CONSTRAINT "pg-drizzle_contact_companyId_pg-drizzle_company_id_fk";
--> statement-breakpoint
ALTER TABLE "pg-drizzle_contact" ADD CONSTRAINT "pg-drizzle_contact_companyId_pg-drizzle_company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."pg-drizzle_company"("id") ON DELETE set null ON UPDATE no action;