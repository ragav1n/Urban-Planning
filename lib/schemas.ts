import * as z from "zod"

export const formSchema = z.object({
  // Project Information
  projectName: z.string().min(1, "Project name is required").max(100, "Project name is too long"),

  // Basic Information
  zoneType: z.string().min(1, "Zone type is required"),
  proposedUse: z.string().min(1, "Proposed use is required"),
  numFloors: z.string().min(1, "Number of floors is required"),

  // Plot Details
  plotLength: z
    .number({ required_error: "Plot length is required" })
    .min(1, "Plot length must be greater than 0")
    .max(1000, "Plot length seems too large"),
  plotBreadth: z
    .number({ required_error: "Plot breadth is required" })
    .min(1, "Plot breadth must be greater than 0")
    .max(1000, "Plot breadth seems too large"),
  roadWidth: z
    .number({ required_error: "Road width is required" })
    .min(1, "Road width must be greater than 0")
    .max(200, "Road width seems too large"),

  // Building Details
  buildingHeight: z
    .number({ required_error: "Building height is required" })
    .min(1, "Building height must be greater than 0")
    .max(100, "Building height exceeds maximum limit"),
  builtUpArea: z
    .number({ required_error: "Built-up area is required" })
    .min(1, "Built-up area must be greater than 0")
    .max(10000, "Built-up area seems too large"),

  // Setbacks
  setbackFront: z
    .number({ required_error: "Front setback is required" })
    .min(0, "Front setback cannot be negative")
    .max(50, "Front setback seems too large"),
  setbackRear: z
    .number({ required_error: "Rear setback is required" })
    .min(0, "Rear setback cannot be negative")
    .max(50, "Rear setback seems too large"),
  setbackSide1: z
    .number({ required_error: "Side 1 setback is required" })
    .min(0, "Side 1 setback cannot be negative")
    .max(50, "Side 1 setback seems too large"),
  setbackSide2: z
    .number({ required_error: "Side 2 setback is required" })
    .min(0, "Side 2 setback cannot be negative")
    .max(50, "Side 2 setback seems too large"),

  // Building Features
  basementProvided: z.boolean().default(false),
  basementUsage: z.string().optional(),
  liftProvided: z.boolean().default(false),
  carParkingSpaces: z
    .number()
    .min(0, "Car parking spaces cannot be negative")
    .max(100, "Car parking spaces seems too many")
    .default(0),
  twowheelerParkingSpaces: z
    .number()
    .min(0, "Two-wheeler parking spaces cannot be negative")
    .max(200, "Two-wheeler parking spaces seems too many")
    .default(0),

  // Environmental Features
  rainwaterHarvesting: z.boolean().default(false),
  solarPanels: z.boolean().default(false),
  stpInstalled: z.boolean().default(false),
})

export type FormValues = z.infer<typeof formSchema>

// Validation helper functions
export const validatePlotArea = (length: number, breadth: number): boolean => {
  const areaInSqFt = length * breadth
  const areaInSqM = areaInSqFt * 0.092903 // Convert sq ft to sq m
  return areaInSqM >= 50 && areaInSqM <= 10000 // Reasonable plot size range
}

export const validateBuildingHeight = (height: number, floors: string): boolean => {
  const floorCount = floors.includes("+") ? Number.parseInt(floors.split("+")[1]) + 1 : 1
  const expectedHeight = floorCount * 3.5 // Assuming 3.5m per floor
  return Math.abs(height - expectedHeight) <= 2 // Allow 2m variance
}
