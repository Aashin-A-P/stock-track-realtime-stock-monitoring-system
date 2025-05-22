import { Request, Response } from "express";
import { db } from "../../db/index";
import { eq } from "drizzle-orm";
import { locationTable } from "../../db/schemas/locationsSchema";

export const addLocation = async (req: Request, res: Response) => {
  try {
    const { locationName, staffIncharge } = req.cleanBody;

    if (!locationName) {
      req.logMessages = ["[ADD_LOCATION_WARNING] Location name is missing"];
      return res.status(400).send("Location name is required");
    }

    const [newLocation] = await db
      .insert(locationTable)
      .values({ locationName, staffIncharge })
      .returning();

    req.logMessages = [
      `[ADD_LOCATION_SUCCESS] Location '${locationName}' added`,
    ];

    res.status(201).json({
      message: "Location added successfully",
      location: newLocation,
    });
  } catch (error) {
    req.logMessages = ["[ADD_LOCATION_ERROR] Failed to add location"];
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
    res.status(500).send("Failed to retrieve location");
  }
};

export const showLocations = async (_req: Request, res: Response) => {
  try {
    const locations = await db.select().from(locationTable);
    res.status(200).json({ locations });
  } catch (error) {
    res.status(500).send("Failed to retrieve locations");
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const { locationName, staffIncharge } = req.cleanBody;

    const [updatedLocation] = await db
      .update(locationTable)
      .set({ locationName, staffIncharge })
      .where(eq(locationTable.locationId, Number(locationId)))
      .returning();

    if (!updatedLocation) {
      req.logMessages = ["[UPDATE_LOCATION_WARNING] Location not found"];
      return res.status(404).send("Location not found");
    }

    req.logMessages = [
      `[UPDATE_LOCATION_SUCCESS] Location '${locationId}' updated`,
    ];

    res.status(200).json({
      message: "Location updated successfully",
      location: updatedLocation,
    });
  } catch (error) {
    req.logMessages = ["[UPDATE_LOCATION_ERROR] Failed to update location"];
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

    if (deletedLocation.length === 0) {
      req.logMessages = ["[DELETE_LOCATION_WARNING] Location not found"];
      return res.status(404).send("Location not found");
    }

    req.logMessages = [
      `[DELETE_LOCATION_SUCCESS] Location '${locationId}' deleted`,
    ];

    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    req.logMessages = ["[DELETE_LOCATION_ERROR] Failed to delete location"];
    res.status(500).send("Failed to delete location");
  }
};

export const searchLocation = async (req: Request, res: Response) => {
  try {
    const locationName = req.query.query as string;

    const [location] = await db
      .select()
      .from(locationTable)
      .where(eq(locationTable.locationName, locationName))
      .limit(1);

    res.status(200).json(location);
  } catch (error) {
    res.status(500).send("Failed to search location");
  }
};
