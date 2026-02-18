/*
  Warnings:

  - You are about to drop the column `description` on the `plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plan" DROP COLUMN "description";

-- CreateTable
CREATE TABLE "features" (
    "plan_id" TEXT NOT NULL,
    "services_limit" INTEGER NOT NULL,
    "service_executions_limit" INTEGER NOT NULL,
    "clients_company_limit" INTEGER NOT NULL,
    "invoices_limit" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "features_plan_id_key" ON "features"("plan_id");

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
