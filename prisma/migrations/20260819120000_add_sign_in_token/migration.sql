-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sign_in_token" TEXT,
ADD COLUMN     "sign_in_token_exp" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_sign_in_token_key" ON "User"("sign_in_token");

-- CreateIndex
CREATE UNIQUE INDEX "User_sign_in_token_exp_key" ON "User"("sign_in_token_exp");
