/*
  Warnings:

  - A unique constraint covering the columns `[event_id,email]` on the table `attendee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attendee_event_id_email_key" ON "attendee"("event_id", "email");
