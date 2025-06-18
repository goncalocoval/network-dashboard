/*
  Warnings:

  - You are about to drop the `AllowedDevice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AllowedDevice";

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allowed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);
