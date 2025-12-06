-- Add currency column to venue_details table
ALTER TABLE "venue_details" 
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'ILS';

-- Update existing records to have ILS as default
UPDATE "venue_details" 
SET "currency" = 'ILS' 
WHERE "currency" IS NULL;

