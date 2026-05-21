/*
  Warnings:

  - You are about to drop the column `freeShipment` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `opinions` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `qtySold` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "freeShipment",
DROP COLUMN "opinions",
DROP COLUMN "qtySold",
DROP COLUMN "rating";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "freeShipment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "opinions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "qtySold" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating" DECIMAL(2,1) NOT NULL DEFAULT 0;
