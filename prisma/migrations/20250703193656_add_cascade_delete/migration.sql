-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_created_by_fkey";

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
