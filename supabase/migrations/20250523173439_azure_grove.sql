/*
  # Create compliance reports tables

  1. New Tables
    - `compliance_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `zone_type` (text)
      - `plot_length` (numeric)
      - `plot_breadth` (numeric)
      - `plot_area` (numeric)
      - `road_width` (numeric)
      - `num_floors` (text)
      - `building_height` (numeric)
      - `proposed_use` (text)
      - `built_up_area` (numeric)
      - `setback_front` (numeric)
      - `setback_rear` (numeric)
      - `setback_side1` (numeric)
      - `setback_side2` (numeric)
      - `basement_provided` (boolean)
      - `basement_usage` (text)
      - `lift_provided` (boolean)
      - `car_parking_spaces` (integer)
      - `twowheeler_parking_spaces` (integer)
      - `rainwater_harvesting` (boolean)
      - `solar_panels` (boolean)
      - `stp_installed` (boolean)
      - `status` (text)
      - `violations` (jsonb)
      - `recommendations` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `compliance_reports` table
    - Add policies for authenticated users to:
      - Create their own reports
      - Read their own reports
*/

CREATE TABLE IF NOT EXISTS compliance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  zone_type text NOT NULL,
  plot_length numeric NOT NULL,
  plot_breadth numeric NOT NULL,
  plot_area numeric NOT NULL,
  road_width numeric NOT NULL,
  num_floors text NOT NULL,
  building_height numeric NOT NULL,
  proposed_use text NOT NULL,
  built_up_area numeric NOT NULL,
  setback_front numeric NOT NULL,
  setback_rear numeric NOT NULL,
  setback_side1 numeric NOT NULL,
  setback_side2 numeric NOT NULL,
  basement_provided boolean NOT NULL,
  basement_usage text,
  lift_provided boolean NOT NULL,
  car_parking_spaces integer NOT NULL,
  twowheeler_parking_spaces integer NOT NULL,
  rainwater_harvesting boolean NOT NULL,
  solar_panels boolean NOT NULL,
  stp_installed boolean NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  violations jsonb DEFAULT '[]',
  recommendations jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own reports"
  ON compliance_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own reports"
  ON compliance_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
