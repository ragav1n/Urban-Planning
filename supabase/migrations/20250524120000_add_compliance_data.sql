-- Add columns to store the complete compliance report data
ALTER TABLE compliance_reports 
ADD COLUMN IF NOT EXISTS report_id TEXT,
ADD COLUMN IF NOT EXISTS compliance_data JSONB,
ADD COLUMN IF NOT EXISTS form_data JSONB;

-- Update existing records to have a report_id if they don't have one
UPDATE compliance_reports 
SET report_id = 'RPT-' || extract(epoch from created_at)::text 
WHERE report_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_compliance_reports_report_id ON compliance_reports(report_id);
