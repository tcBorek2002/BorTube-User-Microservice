-- CreateEnum
CREATE TYPE "VideoState" AS ENUM ('UPLOADING', 'HIDDEN', 'VISIBLE');

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "videoState" "VideoState" NOT NULL,
    "videoFileId" INTEGER,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoFile" (
    "id" SERIAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "videoUrl" TEXT NOT NULL,

    CONSTRAINT "VideoFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_videoFileId_key" ON "Video"("videoFileId");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "VideoFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
