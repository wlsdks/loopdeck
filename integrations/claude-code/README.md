# Claude Code Integration

Claude Code currently exposes prompt capture through hooks configured in
settings files. The recommended install path is:

```sh
looprelay setup
```

If `looprelay` is not available yet because the npm package has not been
published, use a local checkout first:

```sh
git clone https://github.com/wlsdks/looprelay.git
cd looprelay
pnpm install
pnpm setup
```

or, for only Claude Code:

```sh
looprelay install-hook claude-code
```

The installer writes an absolute command into `~/.claude/settings.json`, creates
a backup before changing an existing file, and keeps the hook fail-open.

`settings.example.json` is a portable example for users who prefer manual
configuration. It expects `looprelay` to be available on `PATH`; the
installer is more reliable because it records the exact Node and CLI path.
