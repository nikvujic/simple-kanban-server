-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(120),
    "color" VARCHAR(20) NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "boards_userId_idx" ON "boards"("userId");

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
