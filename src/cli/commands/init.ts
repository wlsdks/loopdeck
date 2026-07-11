import type { Command } from "commander";

import { initializeLoopRelay } from "../../config/config.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Initialize looprelay config and local data directories.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .action((options: { dataDir?: string }) => {
      const result = initializeLoopRelay({ dataDir: options.dataDir });

      console.log(`Initialized looprelay at ${result.config.data_dir}`);
    });
}
