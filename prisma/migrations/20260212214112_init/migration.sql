/*
  Warnings:

  - Added the required column `plan_type` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_plan_id_plan_name_fkey";

-- DropIndex
DROP INDEX "plan_id_name_key";

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "plan_type" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
