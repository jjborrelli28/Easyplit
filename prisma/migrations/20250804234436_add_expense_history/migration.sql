-- CreateTable
CREATE TABLE "expense_history" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changed_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_history_expenseId_idx" ON "expense_history"("expenseId");

-- AddForeignKey
ALTER TABLE "expense_history" ADD CONSTRAINT "expense_history_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_history" ADD CONSTRAINT "expense_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
