-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('HOUSEHOLD', 'TRIP', 'FRIENDS', 'COUPLE', 'FAMILY', 'OTHER');

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "type" "GroupType" NOT NULL DEFAULT 'OTHER';
