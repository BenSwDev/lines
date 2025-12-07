-- Add new fields to roles table for management role support
ALTER TABLE "roles" ADD COLUMN "requiresManagement" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "roles" ADD COLUMN "isManagementRole" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "roles" ADD COLUMN "managedRoleId" TEXT;

-- CreateUniqueConstraint (one-to-one relationship)
CREATE UNIQUE INDEX "roles_managedRoleId_key" ON "roles"("managedRoleId") WHERE "managedRoleId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "roles_managedRoleId_idx" ON "roles"("managedRoleId");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_managedRoleId_fkey" FOREIGN KEY ("managedRoleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

