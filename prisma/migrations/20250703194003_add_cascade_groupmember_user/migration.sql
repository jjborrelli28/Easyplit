-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_userId_fkey";

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
