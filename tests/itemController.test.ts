import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app";
import prisma from "../src/config/db";

// Test item data
const testItem = { name: "Test Item" };
const updatedItem = { name: "Updated Test Item" };

// Additional test items
const testItems = [{ name: "Item 1" }, { name: "Item 2" }, { name: "Item 3" }];
const itemWithLongName = {
  name: "This is an extremely long item name that might cause issues if there are validation constraints on the length of the name field",
};
const itemWithSpecialChars = { name: "Special*&^%$#@!Characters" };

// Store created item IDs for later tests
let createdItemId: number;
let createdItemIds: number[] = [];

// Clean up database before and after tests
beforeAll(async () => {
  // Clear all items from the test database
  await prisma.item.deleteMany({});
});

afterAll(async () => {
  // Clean up after tests
  await prisma.item.deleteMany({});
  await prisma.$disconnect();
});

describe("Item API Routes", () => {
  describe("POST /api/items", () => {
    it("should create a new item", async () => {
      const response = await request(app)
        .post("/api/items")
        .send(testItem)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(testItem.name);

      // Store ID for later use
      createdItemId = response.body.id;
    });

    it("should fail with 400 if name is not provided", async () => {
      const response = await request(app)
        .post("/api/items")
        .send({})
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it("should handle item with special characters", async () => {
      const response = await request(app)
        .post("/api/items")
        .send(itemWithSpecialChars)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(itemWithSpecialChars.name);

      // Save for cleanup
      createdItemIds.push(response.body.id);
    });

    it("should handle item with long name", async () => {
      const response = await request(app)
        .post("/api/items")
        .send(itemWithLongName)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(itemWithLongName.name);

      // Save for cleanup
      createdItemIds.push(response.body.id);
    });

    it("should create multiple items in sequence", async () => {
      for (const item of testItems) {
        const response = await request(app)
          .post("/api/items")
          .send(item)
          .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe(item.name);

        createdItemIds.push(response.body.id);
      }
    });

    it("should reject empty string for name", async () => {
      const response = await request(app)
        .post("/api/items")
        .send({ name: "" })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it("should reject null for name", async () => {
      const response = await request(app)
        .post("/api/items")
        .send({ name: null })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe("GET /api/items", () => {
    it("should return all items", async () => {
      const response = await request(app)
        .get("/api/items")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      // Check if the created item is in the response
      const foundItem = response.body.find(
        (item: any) => item.id === createdItemId
      );
      expect(foundItem).toBeDefined();
      expect(foundItem.name).toBe(testItem.name);
    });

    it("should return the correct number of items", async () => {
      const response = await request(app).get("/api/items").expect(200);

      // Total items should be 1 (original test item) + 2 (special/long name items) + 3 (test items array) = 6
      expect(response.body.length).toBe(6);
    });
  });

  describe("GET /api/items/:id", () => {
    it("should return a single item by ID", async () => {
      const response = await request(app)
        .get(`/api/items/${createdItemId}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("id", createdItemId);
      expect(response.body.name).toBe(testItem.name);
    });

    it("should return 404 if item does not exist", async () => {
      const nonExistentId = 999999;
      const response = await request(app)
        .get(`/api/items/${nonExistentId}`)
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body.message).toBe("Item not found");
    });

    it("should handle invalid ID format", async () => {
      const response = await request(app)
        .get("/api/items/invalid-id")
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it("should reject negative IDs", async () => {
      const response = await request(app).get("/api/items/-1").expect(404);

      expect(response.body.message).toBeDefined();
    });

    it("should reject zero as ID", async () => {
      const response = await request(app).get("/api/items/0").expect(404);

      expect(response.body.message).toBeDefined();
    });
  });

  describe("PUT /api/items/:id", () => {
    it("should update an existing item", async () => {
      const response = await request(app)
        .put(`/api/items/${createdItemId}`)
        .send(updatedItem)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("id", createdItemId);
      expect(response.body.name).toBe(updatedItem.name);
    });

    it("should return 404 if item to update does not exist", async () => {
      const nonExistentId = 999999;
      const response = await request(app)
        .put(`/api/items/${nonExistentId}`)
        .send(updatedItem)
        .expect(404);

      expect(response.body.message).toBe("Item not found");
    });

    it("should handle invalid ID format", async () => {
      const response = await request(app)
        .put("/api/items/invalid-id")
        .send(updatedItem)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it("should fail with 400 if name is not provided", async () => {
      const response = await request(app)
        .put(`/api/items/${createdItemId}`)
        .send({})
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it("should update item to have special characters", async () => {
      // Use the first item from our created items array
      const itemId = createdItemIds[0];
      const response = await request(app)
        .put(`/api/items/${itemId}`)
        .send(itemWithSpecialChars)
        .expect(200);

      expect(response.body).toHaveProperty("id", itemId);
      expect(response.body.name).toBe(itemWithSpecialChars.name);
    });

    it("should reject empty string for name in update", async () => {
      const response = await request(app)
        .put(`/api/items/${createdItemId}`)
        .send({ name: "" })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe("DELETE /api/items/:id", () => {
    it("should delete an existing item", async () => {
      const response = await request(app)
        .delete(`/api/items/${createdItemId}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("id", createdItemId);
      expect(response.body.name).toBe(updatedItem.name);

      // Verify item is actually deleted
      const verifyResponse = await request(app)
        .get(`/api/items/${createdItemId}`)
        .expect(404);
    });

    it("should return 404 if item to delete does not exist", async () => {
      const nonExistentId = 999999;
      const response = await request(app)
        .delete(`/api/items/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe("Item not found");
    });

    it("should handle invalid ID format", async () => {
      const response = await request(app)
        .delete("/api/items/invalid-id")
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it("should delete multiple items in sequence", async () => {
      // Delete all items created in the multiple items test
      for (const id of createdItemIds) {
        const response = await request(app)
          .delete(`/api/items/${id}`)
          .expect(200);

        expect(response.body).toHaveProperty("id", id);

        // Verify deletion
        await request(app).get(`/api/items/${id}`).expect(404);
      }

      // Verify all items were deleted
      const finalResponse = await request(app).get("/api/items").expect(200);

      expect(finalResponse.body.length).toBe(0);
    });
  });

  describe("Additional API tests", () => {
    it("should handle empty database correctly", async () => {
      // Ensure database is empty
      await prisma.item.deleteMany({});

      const response = await request(app).get("/api/items").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it("should handle concurrent item creation", async () => {
      // Create multiple items concurrently
      const promises = testItems.map((item) =>
        request(app).post("/api/items").send(item)
      );

      const responses = await Promise.all(promises);

      // Check all responses
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe(testItems[index].name);

        // Store created IDs for cleanup
        createdItemIds.push(response.body.id);
      });
    });

    it("should handle request with extra fields gracefully", async () => {
      const itemWithExtraFields = {
        name: "Extra Fields Item",
        extraField1: "value1",
        extraField2: 123,
      };

      const response = await request(app)
        .post("/api/items")
        .send(itemWithExtraFields)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(itemWithExtraFields.name);
      // Extra fields should be ignored
      expect(response.body).not.toHaveProperty("extraField1");
      expect(response.body).not.toHaveProperty("extraField2");

      // Cleanup
      createdItemIds.push(response.body.id);
    });

    it("should follow idempotency principles for GET requests", async () => {
      // Create an item first
      const createResponse = await request(app)
        .post("/api/items")
        .send({ name: "Idempotent Test Item" })
        .expect(201);

      const itemId = createResponse.body.id;
      createdItemIds.push(itemId);

      // Make multiple identical GET requests
      const firstResponse = await request(app)
        .get(`/api/items/${itemId}`)
        .expect(200);

      const secondResponse = await request(app)
        .get(`/api/items/${itemId}`)
        .expect(200);

      // Responses should be identical
      expect(firstResponse.body).toEqual(secondResponse.body);
    });

    it("should reject malformed JSON in request body", async () => {
      await request(app)
        .post("/api/items")
        .set("Content-Type", "application/json")
        .send('{name:"Malformed JSON"') // Missing closing bracket
        .expect(400);
    });
  });
});
