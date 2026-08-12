-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING_CHECKIN', 'CHECKED_IN', 'PENDING_CHECKOUT', 'CHECKED_OUT');

-- DropIndex
DROP INDEX "Attendance_childId_checkInTime_idx";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "checkInRequestedAt" TIMESTAMP(3),
ADD COLUMN     "checkInRequestedBy" TEXT,
ADD COLUMN     "checkOutReason" TEXT,
ADD COLUMN     "checkOutRequestedAt" TIMESTAMP(3),
ADD COLUMN     "checkOutRequestedBy" TEXT,
ADD COLUMN     "pickedUpByGuardianId" TEXT,
ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING_CHECKIN',
ALTER COLUMN "checkInTime" DROP NOT NULL,
ALTER COLUMN "checkedInBy" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Attendance_childId_status_idx" ON "Attendance"("childId", "status");
