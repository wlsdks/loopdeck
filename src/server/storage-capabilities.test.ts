import { describe, expect, it } from "vitest";

import { HttpProblem } from "./errors.js";
import { requireStorageCapabilities } from "./storage-capabilities.js";

describe("requireStorageCapabilities", () => {
  it("returns the storage object when all required methods are present", () => {
    const storage = {
      listProjects: () => [],
      updateProjectPolicy: () => undefined,
      getProjectPolicyForEvent: () => undefined,
    };

    const narrowed = requireStorageCapabilities(
      storage,
      ["listProjects", "updateProjectPolicy", "getProjectPolicyForEvent"],
      {
        label: "Project policy storage",
        instance: "/api/v1/projects",
      },
    );

    expect(narrowed.listProjects()).toEqual([]);
  });

  it("throws one raw-free configuration problem when a required method is missing", () => {
    const storage = {
      listProjects: () => [],
      updateProjectPolicy: () => undefined,
    };

    expect(() =>
      requireStorageCapabilities(
        storage,
        ["listProjects", "updateProjectPolicy", "getProjectPolicyForEvent"],
        {
          label: "Project policy storage",
          instance: "/api/v1/projects",
        },
      ),
    ).toThrow(HttpProblem);

    try {
      requireStorageCapabilities(
        storage,
        ["listProjects", "updateProjectPolicy", "getProjectPolicyForEvent"],
        {
          label: "Project policy storage",
          instance: "/api/v1/projects",
        },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(HttpProblem);
      const httpProblem = error as HttpProblem;
      expect(httpProblem.problem).toMatchObject({
        status: 500,
        title: "Internal Server Error",
        detail: "Project policy storage is not configured.",
        instance: "/api/v1/projects",
      });
      expect(JSON.stringify(httpProblem.problem)).not.toContain(
        "getProjectPolicyForEvent",
      );
      expect(JSON.stringify(httpProblem.problem)).not.toContain("/Users/");
    }
  });
});
