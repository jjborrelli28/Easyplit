-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "paymentDate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
