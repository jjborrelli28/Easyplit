-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('HOUSE', 'FOOD', 'ENTERTAINMENT', 'UNCATEGORIZED', 'TRANSPORT', 'UTILITIES', 'LIFE');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "type" "ExpenseType";

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "type" DROP NOT NULL;
