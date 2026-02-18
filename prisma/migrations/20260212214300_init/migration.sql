/*
  Warnings:

  - Changed the type of `plan_type` on the `subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "plan_type",
ADD COLUMN     "plan_type" "PlanType" NOT NULL;
