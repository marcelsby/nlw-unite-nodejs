-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attendee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_id" TEXT NOT NULL,
    CONSTRAINT "attendee_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_attendee" ("created_at", "email", "event_id", "id", "name") SELECT "created_at", "email", "event_id", "id", "name" FROM "attendee";
DROP TABLE "attendee";
ALTER TABLE "new_attendee" RENAME TO "attendee";
CREATE UNIQUE INDEX "attendee_event_id_email_key" ON "attendee"("event_id", "email");
CREATE TABLE "new_check_ins" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendeeId" INTEGER NOT NULL,
    CONSTRAINT "check_ins_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "attendee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_check_ins" ("attendeeId", "created_at", "id") SELECT "attendeeId", "created_at", "id" FROM "check_ins";
DROP TABLE "check_ins";
ALTER TABLE "new_check_ins" RENAME TO "check_ins";
CREATE UNIQUE INDEX "check_ins_attendeeId_key" ON "check_ins"("attendeeId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
