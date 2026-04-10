-- CreateTable
CREATE TABLE "lists" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lists_boardId_idx" ON "lists"("boardId");

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
