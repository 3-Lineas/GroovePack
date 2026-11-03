import fs from "node:fs/promises";
import path from "node:path";

interface OriginalFileBackup {
  path: string;
  existedBefore: boolean;
  content?: Buffer;
}

/**
 * Manages atomic filesystem operations and guarantees rollback on failures.
 * Records directories created and file snapshots before writing.
 */
export class RollbackManager {
  private createdDirs: string[] = [];
  private fileBackups: Map<string, OriginalFileBackup> = new Map();

  /**
   * Records a directory that was created during this transaction.
   * Stored in creation order.
   */
  recordCreatedDirectory(dirPath: string): void {
    const normalized = path.resolve(dirPath);
    if (!this.createdDirs.includes(normalized)) {
      this.createdDirs.push(normalized);
    }
  }

  /**
   * Snapshots the current state of a target file before overwriting/creating.
   */
  async backupTargetFile(filePath: string): Promise<void> {
    const normalized = path.resolve(filePath);
    if (this.fileBackups.has(normalized)) {
      return;
    }

    try {
      const stats = await fs.stat(normalized);
      if (stats.isFile()) {
        const content = await fs.readFile(normalized);
        this.fileBackups.set(normalized, {
          path: normalized,
          existedBefore: true,
          content,
        });
        return;
      }
    } catch {
      // File does not exist prior to this transaction
      this.fileBackups.set(normalized, {
        path: normalized,
        existedBefore: false,
      });
    }
  }

  /**
   * Executes rollback:
   * 1. Restores files that existed before with their original content.
   * 2. Deletes newly created files.
   * 3. Deletes newly created directories in reverse order if they are empty.
   */
  async rollback(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    // 1 & 2. Revert files
    for (const [filePath, backup] of this.fileBackups.entries()) {
      try {
        if (backup.existedBefore && backup.content !== undefined) {
          await fs.writeFile(filePath, backup.content);
        } else {
          await fs.rm(filePath, { force: true });
        }
      } catch (err) {
        errors.push(`Failed to revert file ${filePath}: ${String(err)}`);
      }
    }

    // 3. Revert created directories in reverse order (deepest first)
    const reversedDirs = [...this.createdDirs].reverse();
    for (const dirPath of reversedDirs) {
      try {
        const entries = await fs.readdir(dirPath);
        if (entries.length === 0) {
          await fs.rmdir(dirPath);
        }
      } catch (err) {
        errors.push(`Failed to clean empty dir ${dirPath}: ${String(err)}`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }
}
