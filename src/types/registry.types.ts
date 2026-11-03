export type LibraryCategory = "common" | "server" | "react";

export interface RegistryFileDescriptor {
  /** Relative path within the library template folder (e.g. "files/index.ts") */
  sourcePath: string;
  /** Relative target filename when copied (e.g. "index.ts") */
  targetRelPath: string;
}

export interface RegistryItem {
  id: string;
  name: string;
  description: string;
  category: LibraryCategory;
  /** Subdirectory inside registry/ where templates reside */
  templateRelativeDir: string;
  /** Suggested default target path when copied (e.g. "src/lib/logger") */
  defaultTarget: string;
  /** Core source files to copy */
  files: RegistryFileDescriptor[];
}

export type InstallStatus = "installed" | "rolled_back" | "skipped" | "failed";

export interface InstallOperationResult {
  libraryId: string;
  libraryName: string;
  category: LibraryCategory;
  status: InstallStatus;
  targetPath: string;
  filesWritten: string[];
  errorMessage?: string;
  rollbackSucceeded?: boolean;
}
