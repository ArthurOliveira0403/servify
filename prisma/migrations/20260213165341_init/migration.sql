/*
  Warnings:

  - Added the required column `company_id` to the `invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
