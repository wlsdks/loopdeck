import { afterEach, describe, expect, it, vi } from "vitest";

import { copyTextToClipboard } from "./clipboard.js";

describe("copyTextToClipboard", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, "document");
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "navigator");
  });

  it("waits for slower browser clipboard bridges after selection copy fails", async () => {
    vi.useFakeTimers();
    installDocument({ execCommandResult: false });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { setTimeout },
    });
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        clipboard: {
          writeText: vi.fn(
            () =>
              new Promise<void>((resolve) => {
                setTimeout(resolve, 500);
              }),
          ),
        },
      },
    });

    const copied = copyTextToClipboard("approval-ready draft");
    await vi.advanceTimersByTimeAsync(500);

    await expect(copied).resolves.toBe(true);
  });
});

function installDocument(input: { execCommandResult: boolean }): void {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
      createElement: vi.fn(() => ({
        focus: vi.fn(),
        select: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
        value: "",
      })),
      execCommand: vi.fn(() => input.execCommandResult),
    },
  });
}
