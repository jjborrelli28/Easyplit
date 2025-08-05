/*
  Warnings:

  - You are about to drop the column `changed_by` on the `expense_history` table. All the data in the column will be lost.
  - Added the required column `updated_by` to the `expense_history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expense_history" DROP CONSTRAINT "expense_history_changed_by_fkey";

-- AlterTable
ALTER TABLE "expense_history" DROP COLUMN "changed_by",
ADD COLUMN     "updated_by" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "expense_history" ADD CONSTRAINT "expense_history_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
