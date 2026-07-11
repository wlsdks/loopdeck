export function readTarballName(stdout) {
  for (let index = stdout.lastIndexOf("["); index >= 0; ) {
    try {
      const parsed = JSON.parse(stdout.slice(index));
      const filename = parsed?.[0]?.filename;
      if (typeof filename === "string" && filename.endsWith(".tgz")) {
        return filename;
      }
    } catch {
      // Keep searching for the start of the final npm JSON payload.
    }
    index = stdout.lastIndexOf("[", index - 1);
  }

  throw new Error("npm pack did not return a tarball filename");
}
