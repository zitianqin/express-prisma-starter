import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../config/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createErrorResponse } from "../middlewares/errorHandler";

// Create an item
export const createItem: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    // Validate required field
    if (!name) {
      res.status(400).json(createErrorResponse("Item name is required", 400));
      return;
    }

    const newItem = await prisma.item.create({
      data: { name },
    });
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

// Read all items
export const getItems: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const items = await prisma.item.findMany();
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// Read single item
export const getItemById: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate ID is a number
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json(createErrorResponse("Invalid item ID format", 400));
      return;
    }

    const item = await prisma.item.findUnique({
      where: { id },
    });
    if (!item) {
      res.status(404).json(createErrorResponse("Item not found", 404));
      return;
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// Update an item
export const updateItem: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate ID is a number
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json(createErrorResponse("Invalid item ID format", 400));
      return;
    }

    const { name } = req.body;

    // Validate required field
    if (!name) {
      res.status(400).json(createErrorResponse("Item name is required", 400));
      return;
    }

    // Check if the item exists first before trying to update
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      res.status(404).json(createErrorResponse("Item not found", 404));
      return;
    }

    const item = await prisma.item.update({
      where: { id },
      data: { name },
    });
    res.json(item);
  } catch (error) {
    // Handle any other errors
    next(error);
  }
};

// Delete an item
export const deleteItem: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate ID is a number
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json(createErrorResponse("Invalid item ID format", 400));
      return;
    }

    // Check if the item exists first before trying to delete
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      res.status(404).json(createErrorResponse("Item not found", 404));
      return;
    }

    const item = await prisma.item.delete({
      where: { id },
    });
    res.json(item);
  } catch (error) {
    // Handle any other errors
    next(error);
  }
};
