/*
  Warnings:

  - You are about to drop the column `clients_company_limit` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `service_limit` on the `subscription` table. All the data in the column will be lost.
  - Added the required column `client_companys_limit` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `services_limit` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "clients_company_limit",
DROP COLUMN "service_limit",
ADD COLUMN     "client_companys_limit" INTEGER NOT NULL,
ADD COLUMN     "services_limit" INTEGER NOT NULL;
