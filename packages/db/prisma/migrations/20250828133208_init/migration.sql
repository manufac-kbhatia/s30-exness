-- CreateTable
CREATE TABLE "public"."Ticks" (
    "price" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "stream" TEXT NOT NULL,
    "tradeTime" BIGINT NOT NULL,
    "tradeId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticks_tradeId_key" ON "public"."Ticks"("tradeId");
