import {
  fetchAllRestaurantRatings,
  fetchRestaurantRating,
  fetchUserRestaurantReviews,
  getSavedUserRestaurantRating,
  saveUserRestaurantReview,
} from "../../src/lib/ratings";

// mock the rpc and from functions
const mockRpc = jest.fn();
const mockFrom = jest.fn();

// mock the supabase functions
jest.mock("../../src/lib/supabase", () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));


describe("ratings lib helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAllRestaurantRatings maps values and returns a map of restaurant ids to rating summaries", async () => {
    mockRpc.mockResolvedValue({
      data: [
        { restaurant_id: "r1", average_rating: 4.4, rating_count: 12 },
        { restaurant_id: "r2", average_rating: Number.NaN, rating_count: "bad" },
      ],
      error: null,
    });

    const result = await fetchAllRestaurantRatings();

    expect(mockRpc).toHaveBeenCalledWith("get_restaurant_ratings");
    expect(result.get("r1")).toEqual({
      restaurant_id: "r1",
      average_rating: 4.4,
      rating_count: 12,
    });
    expect(result.get("r2")).toEqual({
      restaurant_id: "r2",
      average_rating: null,
      rating_count: 0,
    });
  });

  it("fetchAllRestaurantRatings throws when rpc returns error", async () => {
    const rpcError = new Error("rpc failed");
    mockRpc.mockResolvedValue({ data: null, error: rpcError });
    await expect(fetchAllRestaurantRatings()).rejects.toThrow("rpc failed");
  });

  it("fetchRestaurantRating returns single entry by id", async () => {
    mockRpc.mockResolvedValue({
      data: [{ restaurant_id: "r1", average_rating: 3.5, rating_count: 2 }],
      error: null,
    });

    await expect(fetchRestaurantRating("r1")).resolves.toEqual({
      restaurant_id: "r1",
      average_rating: 3.5,
      rating_count: 2,
    });
    await expect(fetchRestaurantRating("missing")).resolves.toBeNull();
  });

  it("getSavedUserRestaurantRating returns null for missing or invalid row", async () => {
    const limit = jest.fn().mockResolvedValue({ data: [{ rating: "bad" }], error: null });
    const eq2 = jest.fn().mockReturnValue({ limit });
    const eq1 = jest.fn().mockReturnValue({ eq: eq2 });
    const select = jest.fn().mockReturnValue({ eq: eq1 });
    mockFrom.mockReturnValue({ select });

    const result = await getSavedUserRestaurantRating("u1", "r1");

    expect(result).toBeNull();
  });

  it("saveUserRestaurantReview updates when an existing row is found", async () => {
    const updateEq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq: updateEq });

    const selectLimit = jest.fn().mockResolvedValue({ data: [{ id: "existing-id" }], error: null });
    const selectEq2 = jest.fn().mockReturnValue({ limit: selectLimit });
    const selectEq1 = jest.fn().mockReturnValue({ eq: selectEq2 });
    const select = jest.fn().mockReturnValue({ eq: selectEq1 });

    mockFrom.mockReturnValue({
      select,
      update,
      insert: jest.fn(),
    });

    await saveUserRestaurantReview("user-1", "rest-1", 8, "  Nice food  ");

    expect(update).toHaveBeenCalledWith({
      user_id: "user-1",
      restaurant_id: "rest-1",
      rating: 5,
      review_description: "Nice food",
    });
    expect(updateEq).toHaveBeenCalledWith("id", "existing-id");
  });

  it("saveUserRestaurantReview inserts when no existing row is found", async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });

    const selectLimit = jest.fn().mockResolvedValue({ data: [], error: null });
    const selectEq2 = jest.fn().mockReturnValue({ limit: selectLimit });
    const selectEq1 = jest.fn().mockReturnValue({ eq: selectEq2 });
    const select = jest.fn().mockReturnValue({ eq: selectEq1 });

    mockFrom.mockReturnValue({
      select,
      update: jest.fn(),
      insert,
    });

    await saveUserRestaurantReview("user-2", "rest-2", -2, "  ");

    expect(insert).toHaveBeenCalledWith({
      user_id: "user-2",
      restaurant_id: "rest-2",
      rating: 0,
      review_description: "",
    });
  });

  it("fetchUserRestaurantReviews returns review map with normalized ratings", async () => {
    const inFn = jest.fn().mockResolvedValue({
      data: [
        { restaurant_id: "r1", rating: 3.8, review_description: "Good" },
        { restaurant_id: "r2", rating: -1, review_description: null },
        { restaurant_id: "r3", rating: "bad", review_description: "skip" },
      ],
      error: null,
    });
    const eq = jest.fn().mockReturnValue({ in: inFn });
    const select = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const map = await fetchUserRestaurantReviews("u1", ["r1", "r2", "r2"]);

    expect(map.get("r1")).toEqual({
      id: undefined,
      restaurantId: "r1",
      rating: 3.8,
      reviewDescription: "Good",
    });
    expect(map.get("r2")).toEqual({
      id: undefined,
      restaurantId: "r2",
      rating: 0,
      reviewDescription: "",
    });
    expect(map.has("r3")).toBe(false);
  });
});
