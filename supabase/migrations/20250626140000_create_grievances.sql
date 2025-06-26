-- Create grievances table
CREATE TABLE IF NOT EXISTS grievances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  pin_code TEXT NOT NULL,
  date_observed DATE NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grievances_user_id ON grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_created_at ON grievances(created_at);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_category ON grievances(category);

-- Enable Row Level Security
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own grievances" ON grievances;
DROP POLICY IF EXISTS "Users can insert their own grievances" ON grievances;
DROP POLICY IF EXISTS "Users can update their own grievances" ON grievances;
DROP POLICY IF EXISTS "Users can delete their own grievances" ON grievances;

-- Create RLS policies
CREATE POLICY "Users can view their own grievances" ON grievances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grievances" ON grievances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grievances" ON grievances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grievances" ON grievances
  FOR DELETE USING (auth.uid() = user_id);
