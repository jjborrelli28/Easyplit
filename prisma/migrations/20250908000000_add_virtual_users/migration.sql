-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "isVirtual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "virtual_created_by_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_contact_email_virtual_created_by_id_key" ON "User"("contact_email", "virtual_created_by_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_virtual_created_by_id_fkey" FOREIGN KEY ("virtual_created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
