/*
  Warnings:

  - You are about to drop the `features` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id,name]` on the table `plan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_companys_limit` to the `plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoices_limit` to the `plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_executions_limit` to the `plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `services_limit` to the `plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clients_company_limit` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoices_limit` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan_name` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_executions_limit` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_limit` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "features" DROP CONSTRAINT "features_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_plan_id_fkey";

-- DropIndex
DROP INDEX "plan_name_key";

-- AlterTable
ALTER TABLE "plan" ADD COLUMN     "client_companys_limit" INTEGER NOT NULL,
ADD COLUMN     "invoices_limit" INTEGER NOT NULL,
ADD COLUMN     "service_executions_limit" INTEGER NOT NULL,
ADD COLUMN     "services_limit" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "clients_company_limit" INTEGER NOT NULL,
ADD COLUMN     "invoices_limit" INTEGER NOT NULL,
ADD COLUMN     "plan_name" TEXT NOT NULL,
ADD COLUMN     "service_executions_limit" INTEGER NOT NULL,
ADD COLUMN     "service_limit" INTEGER NOT NULL;

-- DropTable
DROP TABLE "features";

-- CreateIndex
CREATE UNIQUE INDEX "plan_id_name_key" ON "plan"("id", "name");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_plan_id_plan_name_fkey" FOREIGN KEY ("plan_id", "plan_name") REFERENCES "plan"("id", "name") ON DELETE CASCADE ON UPDATE CASCADE;
