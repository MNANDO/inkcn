import { readFileSync, copyFileSync, existsSync } from "fs";
import { createInterface } from "readline";
import { execSync } from "child_process";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");

const registry = JSON.parse(
  readFileSync(resolve(ROOT, "registry.json"), "utf-8")
);

const changedFiles = [];

for (const item of registry.items) {
  for (const file of item.files) {
    const sourcePath = resolve(ROOT, file.path);
    const targetPath = resolve(ROOT, file.target);

    if (!existsSync(targetPath)) {
      console.log(`  ⚠  Target missing: ${file.target}`);
      continue;
    }

    if (!existsSync(sourcePath)) {
      changedFiles.push({ source: file.path, target: file.target, status: "A" });
      continue;
    }

    const sourceContent = readFileSync(sourcePath, "utf-8");
    const targetContent = readFileSync(targetPath, "utf-8");

    if (sourceContent !== targetContent) {
      changedFiles.push({ source: file.path, target: file.target, status: "M" });
    }
  }
}

if (changedFiles.length === 0) {
  console.log("Registry is up to date. No changes detected.");
  process.exit(0);
}

console.log(`\nFiles changed (${changedFiles.length}):\n`);

for (const file of changedFiles) {
  const label = file.status === "A" ? "A (new)" : "M";
  console.log(`  ${label}  ${file.target} → ${file.source}`);
}

// Show diffs for modified files
const modifiedFiles = changedFiles.filter((f) => f.status === "M");
if (modifiedFiles.length > 0) {
  console.log("\n--- Diffs ---\n");
  for (const file of modifiedFiles) {
    try {
      const diff = execSync(
        `diff -u "${resolve(ROOT, file.source)}" "${resolve(ROOT, file.target)}" || true`,
        { encoding: "utf-8" }
      );
      if (diff.trim()) {
        console.log(`${file.target}:`);
        console.log(diff);
      }
    } catch {
      // diff returns exit code 1 when files differ
    }
  }
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question(
  `\nOverwrite ${changedFiles.length} file(s) in registry? (y/n) `,
  (answer) => {
    if (answer.toLowerCase() === "y") {
      for (const file of changedFiles) {
        copyFileSync(
          resolve(ROOT, file.target),
          resolve(ROOT, file.source)
        );
        console.log(`  ✓ ${file.source}`);
      }
      console.log("\nRegistry synced.");
    } else {
      console.log("Aborted.");
    }
    rl.close();
  }
);
