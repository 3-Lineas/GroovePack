import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RollbackManager } from "./rollback-manager.js";
import type {
  RegistryItem,
  InstallOperationResult,
} from "../types/registry.types.js";

export interface InstallOptions {
  item: RegistryItem;
  targetDir: string;
  baseRegistryDir?: string;
}

/**
 * Finds the base registry directory either in development or compiled mode.
 */
export function resolveRegistryBaseDir(explicitBase?: string): string {
  if (explicitBase) {
    return explicitBase;
  }
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);

  const candidates = [
    path.resolve(currentDir, "../registry"),
    path.resolve(currentDir, "../../registry"),
    path.resolve(process.cwd(), "registry"),
  ];

  for (const candidate of candidates) {
    try {
      const stats = fs.stat(candidate);
      return candidate;
    } catch {
      // Continue searching
    }
  }

  return candidates[0] ?? path.resolve(process.cwd(), "registry");
}

/**
 * Ensures a directory and all parent segments exist while tracking newly created segments in RollbackManager.
 */
async function ensureDirWithRollback(
  dirPath: string,
  rollbackManager: RollbackManager,
): Promise<void> {
  const normalized = path.resolve(dirPath);
  const segmentsToCreate: string[] = [];

  let current = normalized;
  while (current !== path.dirname(current)) {
    try {
      await fs.stat(current);
      break;
    } catch {
      segmentsToCreate.push(current);
      current = path.dirname(current);
    }
  }

  for (const seg of segmentsToCreate.reverse()) {
    await fs.mkdir(seg);
    rollbackManager.recordCreatedDirectory(seg);
  }
}

/**
 * Installs a library into the target directory with transactional rollback support.
 */
export async function installLibrary(
  options: InstallOptions,
): Promise<InstallOperationResult> {
  const { item, targetDir, baseRegistryDir } = options;
  const rollbackManager = new RollbackManager();
  const filesWritten: string[] = [];

  const registryRoot = resolveRegistryBaseDir(baseRegistryDir);
  const templateDir = path.resolve(registryRoot, item.templateRelativeDir);

  try {
    // 1. Validate template directory exists
    try {
      await fs.stat(templateDir);
    } catch {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    // 2. Ensure base target directory exists
    await ensureDirWithRollback(targetDir, rollbackManager);

    // 3. Process each file
    for (const fileDesc of item.files) {
      const sourceFile = path.resolve(templateDir, fileDesc.sourcePath);
      const destinationFile = path.resolve(targetDir, fileDesc.targetRelPath);
      const destDir = path.dirname(destinationFile);

      // Ensure subdirectory exists if nested
      await ensureDirWithRollback(destDir, rollbackManager);

      // Snapshot target file for rollback
      await rollbackManager.backupTargetFile(destinationFile);

      // Read source file content
      const content = await fs.readFile(sourceFile);

      // Write destination file
      await fs.writeFile(destinationFile, content);
      filesWritten.push(destinationFile);
    }

    return {
      libraryId: item.id,
      libraryName: item.name,
      category: item.category,
      status: "installed",
      targetPath: targetDir,
      filesWritten,
    };
  } catch (error) {
    const rollbackResult = await rollbackManager.rollback();
    return {
      libraryId: item.id,
      libraryName: item.name,
      category: item.category,
      status: "rolled_back",
      targetPath: targetDir,
      filesWritten: [],
      errorMessage: error instanceof Error ? error.message : String(error),
      rollbackSucceeded: rollbackResult.success,
    };
  }
}
