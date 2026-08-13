-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pending_real_user_id" TEXT;

-- CreateIndex
CREATE INDEX "User_pending_real_user_id_idx" ON "User"("pending_real_user_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pending_real_user_id_fkey" FOREIGN KEY ("pending_real_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
