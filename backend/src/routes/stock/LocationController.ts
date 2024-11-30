import { Request, Response } from "express";
import { db } from "../../db/index";
import { eq } from "drizzle-orm";
import { locationTable } from "../../db/schemas/locationsSchema";

export const addLocation = async (req: Request, res: Response) => {
  try {
    const { locationName } = req.cleanBody;

    if (!locationName) {
      return res.status(400).send("Location name is required");
    }

    const [newLocation] = await db
      .insert(locationTable)
      .values({ locationName })
      .returning();

    res
      .status(201)
      .json({ message: "Location added successfully", location: newLocation });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add location");
  }
};

export const showLocation = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    const [location] = await db
      .select()
      .from(locationTable)
      .where(eq(locationTable.locationId, Number(locationId)))
      .limit(1);

    if (!location) {
      return res.status(404).send("Location not found");
    }

    res.status(200).json({ location });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve location");
  }
};

export const showLocations = async (_req: Request, res: Response) => {
  try {
    const locations = await db.select().from(locationTable);

    res.status(200).json({ locations });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve locations");
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const { locationName } = req.cleanBody;

    const [updatedLocation] = await db
      .update(locationTable)
      .set({ locationName })
      .where(eq(locationTable.locationId, Number(locationId)))
      .returning();

    if (!updatedLocation) {
      return res.status(404).send("Location not found");
    }

    res
      .status(200)
      .json({
        message: "Location updated successfully",
        location: updatedLocation,
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update location");
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    const deletedLocation = await db
      .delete(locationTable)
      .where(eq(locationTable.locationId, Number(locationId)))
      .returning();

    if (!deletedLocation) {
      return res.status(404).send("Location not found");
    }

    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete location");
  }
};
