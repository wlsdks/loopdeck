#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const summary =
  "Continue independent agent first-value validation and verify the local brief.";

export function assessAgentOperatorRun({
  status,
  brief,
  agentResult,
  protectedPaths,
}) {
  const rawPathHits = new Set(
    protectedPaths.filter((path) =>
      JSON.stringify({ status, brief, agentResult }).includes(path),
    ),
  ).size;
  const recoveryCount = nonNegativeInteger(agentResult?.recovery_count) ?? 0;
  const frictionCount = nonNegativeInteger(agentResult?.friction_count) ?? 0;
  const firstValueSuccess =
    rawPathHits === 0 &&
    agentResult?.completed === true &&
    status?.status === "ready" &&
    status?.latest_snapshot?.outcome_status === "in_progress" &&
    status?.privacy?.returns_prompt_bodies === false &&
    status?.privacy?.returns_raw_paths === false &&
    typeof brief?.prompt === "string" &&
    brief.prompt.includes(summary);

  return {
    first_value_success: firstValueSuccess,
    raw_path_hits: rawPathHits,
    recovery_count: recoveryCount,
    friction_count: frictionCount,
  };
}

function main() {
  const options = parseOptions(process.argv.slice(2));
  const root = mkdtempSync(
    join(tmpdir(), `looprelay-${options.client}-operator-`),
  );
  const repo = join(root, "repo");
  const prefix = join(root, "prefix");
  const dataDir = join(root, "data");
  const home = join(root, "home");
  const tarball = join(root, basename(options.tarball));
  const agentOutput = join(root, "agent-result.json");
  const protectedPaths = [root, repo, prefix, dataDir, home, tarball];
  let startedAt = 0;
  let installElapsedMs = 0;
  let agentExitedSuccessfully = false;
  let agentExecutionReason = "not_started";
  let installed = false;
  let assessment = {
    first_value_success: false,
    raw_path_hits: 0,
    recovery_count: 0,
    friction_count: 1,
  };

  try {
    run("git", ["init", "-q", repo]);
    copyFileSync(options.tarball, tarball);
    startedAt = Date.now();
    const installStartedAt = Date.now();
    const provision = run(
      "npm",
      ["install", "-g", "--prefix", prefix, tarball],
      repo,
      { ...process.env, HOME: home },
    );
    installElapsedMs = Date.now() - installStartedAt;
    const bin = join(prefix, "bin", "looprelay");
    installed = provision.status === 0 && run(bin, ["--version"]).status === 0;
    if (!installed) throw new Error("candidate installation failed");
    const agent = runAgent({
      client: options.client,
      sandbox: options.sandbox,
      repo,
      root,
      home,
      prefix,
      dataDir,
      tarball,
      agentOutput,
    });
    agentExitedSuccessfully = agent.status === 0;
    agentExecutionReason = agentExitedSuccessfully
      ? "completed"
      : classifyAgentFailure(agent);
    const brief = readJsonCommand(
      bin,
      ["loop", "brief", "--data-dir", dataDir, "--json"],
      repo,
      { ...process.env, HOME: home },
    );
    const status = readJsonCommand(
      bin,
      ["loop", "status", "--data-dir", dataDir, "--json"],
      repo,
      { ...process.env, HOME: home },
    );
    const agentResult = readAgentResult(
      options.client,
      agentOutput,
      agent.stdout,
    );
    assessment = assessAgentOperatorRun({
      status,
      brief,
      agentResult,
      protectedPaths,
    });
  } catch {
    // Failure is reported only as raw-free metadata below.
  } finally {
    const elapsed = startedAt === 0 ? 0 : Date.now() - startedAt;
    print({
      id: options.id,
      client: options.client,
      client_version: clientVersion(options.client),
      fresh_session: true,
      isolated_product_home: true,
      isolated_npm_prefix: true,
      fresh_git_repository: true,
      candidate_commit: options.candidateCommit,
      candidate_sha256: options.candidateSha256,
      agent_execution_completed: agentExitedSuccessfully,
      agent_execution_blocker: !agentExitedSuccessfully,
      agent_execution_reason: agentExecutionReason,
      install_success: installed,
      first_value_success:
        agentExitedSuccessfully && assessment.first_value_success,
      install_elapsed_ms: installElapsedMs,
      time_to_first_value_ms: elapsed,
      command_count: 0,
      input_tokens: 0,
      recovery_count: assessment.recovery_count,
      friction_count:
        assessment.friction_count +
        Number(!agentExitedSuccessfully || !assessment.first_value_success),
      privacy_blocker: assessment.raw_path_hits > 0,
      data_loss_blocker: false,
      install_blocker: !installed,
    });
    rmSync(root, { recursive: true, force: true });
  }
}

function runAgent({
  client,
  sandbox,
  repo,
  root,
  home,
  prefix,
  dataDir,
  tarball,
  agentOutput,
}) {
  const env = {
    ...process.env,
    LOOPRELAY_TARBALL: tarball,
    LOOPRELAY_PREFIX: prefix,
    LOOPRELAY_DATA_DIR: dataDir,
    PATH: `${join(prefix, "bin")}:${process.env.PATH ?? ""}`,
  };
  const prompt = `You are a fresh independent ${client} coding-agent operator. Do not inspect source repositories, existing LoopRelay configuration, or prior sessions. An isolated harness has already installed the candidate CLI into LOOPRELAY_PREFIX; use only that CLI and LOOPRELAY_DATA_DIR. Every LoopRelay command must explicitly pass --data-dir "$LOOPRELAY_DATA_DIR". In the empty git repository: (1) discover the loop command; (2) create a privacy-safe in-progress checkpoint with summary exactly "${summary}" and evidence ref agent:first-value; (3) obtain the continuation brief. Do not change product source or reinstall packages. Your final response must be exactly JSON: {"completed":boolean,"recovery_count":nonnegative integer,"friction_count":nonnegative integer}. Do not include paths, command output, summaries, or explanation.`;
  const args =
    client === "codex"
      ? [
          "exec",
          "--ephemeral",
          "--ignore-user-config",
          "--sandbox",
          sandbox,
          "-C",
          repo,
          "--add-dir",
          root,
          "--output-last-message",
          agentOutput,
          prompt,
        ]
      : [
          "--print",
          "--safe-mode",
          "--no-session-persistence",
          "--permission-mode",
          "bypassPermissions",
          "--output-format",
          "json",
          "--json-schema",
          '{"type":"object","properties":{"completed":{"type":"boolean"},"recovery_count":{"type":"integer","minimum":0},"friction_count":{"type":"integer","minimum":0}},"required":["completed","recovery_count","friction_count"],"additionalProperties":false}',
          prompt,
          "--add-dir",
          root,
        ];
  return run(client === "codex" ? "codex" : "claude", args, repo, env, {
    detached: client === "codex",
  });
}

function readAgentResult(client, agentOutput, stdout) {
  if (client === "codex" && existsSync(agentOutput)) {
    return JSON.parse(readFileSync(agentOutput, "utf8"));
  }
  const response = JSON.parse(stdout);
  return response.structured_output ?? response.result;
}

function readJsonCommand(command, args, cwd, env) {
  const result = run(command, args, cwd, env);
  if (result.status !== 0) throw new Error("product command failed");
  return JSON.parse(result.stdout);
}

function run(command, args, cwd, env, options = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    detached: options.detached === true,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function classifyAgentFailure(result) {
  const text = `${result.stdout}\n${result.stderr}`.toLowerCase();
  if (/permission denied|sandbox|not allowed/.test(text)) return "sandbox";
  if (
    /authentication|unauthorized|login|sign in|api key|credential|token/.test(
      text,
    )
  ) {
    return "authentication";
  }
  if (/rate limit|quota|overloaded|model.+unavailable/.test(text)) {
    return "capacity";
  }
  if (/json schema|structured output|invalid json/.test(text)) {
    return "response_format";
  }
  if (/npm|install|node-gyp|build/.test(text)) return "installation";
  if (/timeout|timed out/.test(text)) return "timeout";
  return "unknown";
}

function clientVersion(client) {
  const result = run(client === "codex" ? "codex" : "claude", ["--version"]);
  return result.stdout.match(/\d+(?:\.\d+){1,3}/)?.[0] ?? "unknown";
}

function parseOptions(args) {
  const values = Object.fromEntries(
    [
      "client",
      "tarball",
      "id",
      "candidate-commit",
      "candidate-sha256",
      "sandbox",
    ].map((key) => {
      const index = args.indexOf(`--${key}`);
      return [key, index === -1 ? undefined : args.at(index + 1)];
    }),
  );
  if (!new Set(["codex", "claude-code"]).has(values.client)) {
    throw new Error("agent client must be codex or claude-code");
  }
  if (!/^[a-z0-9-]+$/.test(values.id ?? "")) {
    throw new Error("agent operator id must be raw-free");
  }
  if (!/^[a-f0-9]{40}$/i.test(values["candidate-commit"] ?? "")) {
    throw new Error("candidate commit must be a full hash");
  }
  if (!/^[a-f0-9]{64}$/i.test(values["candidate-sha256"] ?? "")) {
    throw new Error("candidate checksum must be SHA-256");
  }
  if (!values.tarball) throw new Error("candidate tarball is required");
  const sandbox = values.sandbox ?? "workspace-write";
  if (!new Set(["workspace-write", "danger-full-access"]).has(sandbox)) {
    throw new Error("sandbox must be workspace-write or danger-full-access");
  }
  return {
    client: values.client,
    tarball: values.tarball,
    id: values.id,
    candidateCommit: values["candidate-commit"],
    candidateSha256: values["candidate-sha256"],
    sandbox,
  };
}

function nonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function print(result) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
