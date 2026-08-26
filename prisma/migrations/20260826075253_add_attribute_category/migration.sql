-- CreateEnum
CREATE TYPE "AttributeCategory" AS ENUM ('mobile', 'computer', 'display', 'audio', 'gaming', 'accessories', 'other');

-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "category" "AttributeCategory" NOT NULL DEFAULT 'other';
