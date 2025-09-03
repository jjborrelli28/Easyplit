-- CreateTable
CREATE TABLE "group_history" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "group_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_history_groupId_idx" ON "group_history"("groupId");

-- AddForeignKey
ALTER TABLE "group_history" ADD CONSTRAINT "group_history_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_history" ADD CONSTRAINT "group_history_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
