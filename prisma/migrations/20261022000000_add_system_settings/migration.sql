-- System Admin tag on users.
ALTER TABLE "User" ADD COLUMN "isSystemAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Platform-wide switches (maintenance mode, sign-ups, public forms). One row.
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "publicMaintenance" BOOLEAN NOT NULL DEFAULT false,
    "publicMessage" TEXT,
    "portalMaintenance" BOOLEAN NOT NULL DEFAULT false,
    "portalMessage" TEXT,
    "maintenanceFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featureMessage" TEXT,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "inquiriesOpen" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
