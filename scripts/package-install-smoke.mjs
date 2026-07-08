#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const tempHome = mkdtempSync(join(tmpdir(), "promptlane-smoke-home-"));
const tempPrefix = mkdtempSync(join(tmpdir(), "promptlane-smoke-prefix-"));
let tarballPath;

try {
  const npmEnv = sanitizedNpmEnv(process.env);
  run("corepack", ["pnpm", "build"], { env: process.env });

  const pack = run("npm", ["pack", "--json", "--ignore-scripts"], {
    env: npmEnv,
    encoding: "utf8",
  });
  tarballPath = join(repoRoot, readTarballName(pack.stdout));

  run("npm", ["install", "-g", "--prefix", tempPrefix, tarballPath], {
    env: { ...npmEnv, HOME: tempHome },
  });

  for (const [binName, args] of [
    ["promptlane", ["--help"]],
    ["pl-claude", ["--pc-help"]],
    ["pl-codex", ["--pc-help"]],
  ]) {
    run(join(tempPrefix, "bin", binName), args, {
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    });
  }

  console.log(
    JSON.stringify(
      {
        check: "package_install_smoke",
        status: "pass",
        tarball: basename(tarballPath),
        bins: ["promptlane", "pl-claude", "pl-codex"],
      },
      null,
      2,
    ),
  );
} finally {
  if (tarballPath) {
    rmSync(tarballPath, { force: true });
  }
  rmSync(tempHome, { recursive: true, force: true });
  rmSync(tempPrefix, { recursive: true, force: true });
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

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: options.env,
    encoding: options.encoding,
    stdio: options.encoding ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    if (options.encoding) {
      process.stderr.write(result.stdout ?? "");
      process.stderr.write(result.stderr ?? "");
    }
    process.exit(result.status ?? 1);
  }

  return {
    stdout: result.stdout ?? "",
  };
}

function readTarballName(stdout) {
  const parsed = JSON.parse(stdout);
  const filename = parsed?.[0]?.filename;
  if (typeof filename !== "string" || !filename.endsWith(".tgz")) {
    throw new Error("npm pack did not return a tarball filename");
  }
  return filename;
}
