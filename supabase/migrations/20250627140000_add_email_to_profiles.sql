-- Add email column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for better performance when querying by email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add a unique constraint to ensure no duplicate emails (optional)
-- Uncomment the line below if you want to enforce unique emails
-- ALTER TABLE profiles ADD CONSTRAINT unique_profiles_email UNIQUE (email);

-- Update any existing profiles that don't have emails
-- This will get the email from the auth.users table for existing users
UPDATE profiles 
SET email = auth_users.email,
    updated_at = now()
FROM auth.users AS auth_users
WHERE profiles.id = auth_users.id 
AND profiles.email IS NULL;
