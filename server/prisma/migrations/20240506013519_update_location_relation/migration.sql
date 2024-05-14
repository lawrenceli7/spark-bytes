/*
  Warnings:

  - You are about to drop the column `event_id` on the `Location` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_event_id_fkey";

-- DropIndex
DROP INDEX "Location_event_id_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "locationId" INTEGER;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "event_id";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
