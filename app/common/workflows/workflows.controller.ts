import { api, APIError } from "encore.dev/api";

/**
 * Counts and returns the number of existing users
 */
export const test = api(
  { expose: true, method: "GET", path: "/workflow" },
  async (): Promise<{ message: string }> => {
    return { message: "Hi I MY ME MIND" };
  }
);
