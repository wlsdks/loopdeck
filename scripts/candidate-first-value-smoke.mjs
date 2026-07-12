#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { readTarballName } from "./npm-pack-output.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const checkpointSummary =
  "Continue independent first-value validation and verify the local brief.";

export function assessFirstValue({ checkpoint, brief, protectedPaths }) {
  const serialized = JSON.stringify({ checkpoint, brief });
  const rawPathHits = new Set(
    protectedPaths.filter((protectedPath) =>
      serialized.includes(protectedPath),
    ),
  ).size;
  const prompt = brief?.prompt;
  const snapshot = checkpoint?.snapshot;
  const privacy = checkpoint?.privacy;
  const firstValueSuccess =
    rawPathHits === 0 &&
    snapshot?.outcome?.status === "in_progress" &&
    snapshot?.outcome?.summary === checkpointSummary &&
    privacy?.stores_prompt_bodies === false &&
    privacy?.stores_raw_paths === false &&
    typeof prompt === "string" &&
    prompt.length > 0 &&
    prompt.includes(checkpointSummary);

  return {
    first_value_success: firstValueSuccess,
    raw_path_hits: rawPathHits,
  };
}

function sanitizedNpmEnv(env) {
  const next = { ...env };
  for (const key of [
    "npm_config_verify_deps_before_run",
    "npm_config__jsr_registry",
    "npm_config_patched_dependencies",
    "pnpm_config_verify_deps_before_run",
    "pnpm_config__jsr_registry",
    "pnpm_config_patched_dependencies",
  ]) {
    delete next[key];
  }
  return next;
}

function run(action, command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: options.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.error || result.status !== 0) {
    throw new Error(`candidate first-value smoke ${action} failed`);
  }

  return result.stdout ?? "";
}

function printResult(result) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

function main() {
  const tempHome = mkdtempSync(join(tmpdir(), "looprelay-candidate-home-"));
  const tempPrefix = mkdtempSync(join(tmpdir(), "looprelay-candidate-prefix-"));
  const tempData = mkdtempSync(join(tmpdir(), "looprelay-candidate-data-"));
  const tempRepo = mkdtempSync(join(tmpdir(), "looprelay-candidate-repo-"));
  const protectedPaths = [tempHome, tempPrefix, tempData, tempRepo];
  const npmEnv = sanitizedNpmEnv(process.env);
  let tarballPath;
  let installElapsedMs = 0;
  let installed = false;
  let firstValueStartedAt;

  try {
    run("build", "corepack", ["pnpm", "build"], { env: process.env });
    const packOutput = run(
      "pack",
      "npm",
      ["pack", "--json", "--ignore-scripts"],
      {
        env: npmEnv,
      },
    );
    tarballPath = join(repoRoot, readTarballName(packOutput));

    firstValueStartedAt = Date.now();
    run(
      "install",
      "npm",
      ["install", "-g", "--prefix", tempPrefix, tarballPath],
      {
        env: { ...npmEnv, HOME: tempHome },
      },
    );
    run("version", join(tempPrefix, "bin", "looprelay"), ["--version"], {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
    });
    installElapsedMs = Date.now() - firstValueStartedAt;
    installed = true;

    run("git init", "git", ["init", "-q"], {
      cwd: tempRepo,
      env: { ...process.env, HOME: tempHome },
    });
    run("loop help", join(tempPrefix, "bin", "looprelay"), ["loop", "--help"], {
      cwd: tempRepo,
      env: { ...process.env, HOME: tempHome },
    });
    const checkpoint = JSON.parse(
      run(
        "checkpoint",
        join(tempPrefix, "bin", "looprelay"),
        [
          "loop",
          "checkpoint",
          "--summary",
          checkpointSummary,
          "--status",
          "in_progress",
          "--evidence-ref",
          "participant:first-value",
          "--data-dir",
          tempData,
          "--json",
        ],
        {
          cwd: tempRepo,
          env: { ...process.env, HOME: tempHome },
        },
      ),
    );
    const brief = JSON.parse(
      run(
        "brief",
        join(tempPrefix, "bin", "looprelay"),
        ["loop", "brief", "--data-dir", tempData, "--json"],
        {
          cwd: tempRepo,
          env: { ...process.env, HOME: tempHome },
        },
      ),
    );
    const assessment = assessFirstValue({ checkpoint, brief, protectedPaths });
    const timeToFirstValueMs = Date.now() - firstValueStartedAt;
    printResult({
      check: "candidate_first_value_smoke",
      status: assessment.first_value_success ? "pass" : "fail",
      tarball: basename(tarballPath),
      install_elapsed_ms: installElapsedMs,
      time_to_first_value_ms: timeToFirstValueMs,
      recovery_count: 0,
      friction_count: 0,
      raw_path_hits: assessment.raw_path_hits,
      privacy_blocker: assessment.raw_path_hits > 0,
      data_loss_blocker: false,
      install_blocker: false,
      first_value_success: assessment.first_value_success,
    });
    process.exitCode = assessment.first_value_success ? 0 : 1;
  } catch {
    printResult({
      check: "candidate_first_value_smoke",
      status: "fail",
      install_elapsed_ms: installElapsedMs,
      time_to_first_value_ms: firstValueStartedAt
        ? Date.now() - firstValueStartedAt
        : 0,
      recovery_count: 0,
      friction_count: 1,
      raw_path_hits: 0,
      privacy_blocker: false,
      data_loss_blocker: false,
      install_blocker: !installed,
      first_value_success: false,
    });
    process.exitCode = 1;
  } finally {
    if (tarballPath) {
      rmSync(tarballPath, { force: true });
    }
    for (const path of [tempHome, tempPrefix, tempData, tempRepo]) {
      rmSync(path, { recursive: true, force: true });
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
