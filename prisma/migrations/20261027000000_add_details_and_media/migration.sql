-- AlterTable
ALTER TABLE "BuddyGroup" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "details" TEXT,
ADD COLUMN     "media_url" TEXT;

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "details" TEXT,
ADD COLUMN     "media_url" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "details" TEXT,
ADD COLUMN     "media_url" TEXT;

-- AlterTable
ALTER TABLE "CampaignPhoto" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "details" TEXT;

-- AlterTable
ALTER TABLE "Point" ADD COLUMN     "media_url" TEXT,
ADD COLUMN     "name" TEXT;

