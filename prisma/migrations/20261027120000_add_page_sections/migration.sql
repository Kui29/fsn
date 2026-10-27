-- CreateTable
CREATE TABLE "PageSection" (
    "uid" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "details" TEXT,
    "media_url" TEXT,
    "position" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE INDEX "PageSection_page_position_idx" ON "PageSection"("page", "position");
