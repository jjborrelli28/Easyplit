-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contact_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_attempts" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_contact_user_id_idx" ON "contacts"("contact_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_user_id_contact_user_id_key" ON "contacts"("user_id", "contact_user_id");

-- CreateIndex
CREATE INDEX "rate_limit_attempts_actor_id_action_created_at_idx" ON "rate_limit_attempts"("actor_id", "action", "created_at");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_contact_user_id_fkey" FOREIGN KEY ("contact_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_limit_attempts" ADD CONSTRAINT "rate_limit_attempts_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: pairs of real users who share (or once shared) a group
INSERT INTO contacts (id, user_id, contact_user_id, created_at)
SELECT md5(gm1."userId" || gm2."userId" || 'grp' || gm1."groupId"), gm1."userId", gm2."userId", now()
FROM "GroupMember" gm1
JOIN "GroupMember" gm2 ON gm1."groupId" = gm2."groupId" AND gm1."userId" <> gm2."userId"
JOIN "User" u1 ON u1.id = gm1."userId" AND u1."isVirtual" = false
JOIN "User" u2 ON u2.id = gm2."userId" AND u2."isVirtual" = false
ON CONFLICT (user_id, contact_user_id) DO NOTHING;

-- Backfill: pairs of real users who share (or once shared) an expense
INSERT INTO contacts (id, user_id, contact_user_id, created_at)
SELECT md5(ep1."userId" || ep2."userId" || 'exp' || ep1."expenseId"), ep1."userId", ep2."userId", now()
FROM "ExpenseParticipant" ep1
JOIN "ExpenseParticipant" ep2 ON ep1."expenseId" = ep2."expenseId" AND ep1."userId" <> ep2."userId"
JOIN "User" u1 ON u1.id = ep1."userId" AND u1."isVirtual" = false
JOIN "User" u2 ON u2.id = ep2."userId" AND u2."isVirtual" = false
ON CONFLICT (user_id, contact_user_id) DO NOTHING;
