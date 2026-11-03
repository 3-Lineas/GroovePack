import fs from "node:fs/promises";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { CATEGORIES } from "../constants/categories.constants.js";
import {
  REGISTRY_ITEMS,
  getLibrariesByCategory,
} from "../registry/registry-catalog.js";
import { installLibrary } from "../installer/install-library.js";
import type {
  LibraryCategory,
  RegistryItem,
  InstallOperationResult,
} from "../types/registry.types.js";

/**
 * Checks if target directory already has files that would conflict.
 */
async function hasExistingFiles(dirPath: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(dirPath);
    return entries.length > 0;
  } catch {
    return false;
  }
}

export async function runCli(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(" @3lineas/groovepack ")));

  // Step 1: Category selection loop
  let selectedCategory: LibraryCategory | "all" | null = null;
  let itemsToPresent: RegistryItem[] = [];

  while (true) {
    const categoryChoice = await p.select<string>({
      message: "Selecciona una categoría de librerías:",
      options: [
        ...CATEGORIES.map((c) => ({
          value: c.id,
          label: c.label,
          hint: c.hint,
        })),
        {
          value: "all",
          label: "Ver todas agrupadas",
          hint: "Muestra todo el catálogo disponible en Groovepack",
        },
      ],
    });

    if (p.isCancel(categoryChoice)) {
      p.cancel("Operación cancelada por el usuario.");
      process.exit(0);
    }

    selectedCategory = categoryChoice as LibraryCategory | "all";

    if (selectedCategory === "all") {
      itemsToPresent = [...REGISTRY_ITEMS];
      break;
    }

    const filtered = getLibrariesByCategory(selectedCategory);
    if (filtered.length === 0) {
      p.log.warn(
        `Aún no hay librerías disponibles en la categoría "${selectedCategory}". Selecciona otra categoría.`,
      );
      continue;
    }

    itemsToPresent = filtered;
    break;
  }

  // Step 2: Multi-select libraries
  const libraryChoices = await p.multiselect<string>({
    message: "Selecciona las librerías a incorporar:",
    options: itemsToPresent.map((item) => ({
      value: item.id,
      label: item.name,
      hint: `${pc.cyan(`[${item.category}]`)} ${item.description}`,
    })),
    required: true,
  });

  if (p.isCancel(libraryChoices)) {
    p.cancel("Operación cancelada.");
    process.exit(0);
  }

  const selectedItems = itemsToPresent.filter((item) =>
    libraryChoices.includes(item.id),
  );

  // Step 3: Configure destination per library
  const configuredTargets: Array<{
    item: RegistryItem;
    targetDir: string;
  }> = [];

  for (const item of selectedItems) {
    p.log.info(pc.bold(`Configurando: ${item.name}`));

    const targetInput = await p.text({
      message: `Ruta de destino para "${item.name}":`,
      initialValue: item.defaultTarget,
      validate(val) {
        if (!val || val.trim().length === 0) {
          return "La ruta no puede estar vacía.";
        }
        return undefined;
      },
    });

    if (p.isCancel(targetInput)) {
      p.cancel("Operación cancelada.");
      process.exit(0);
    }

    const resolvedTarget = path.resolve(process.cwd(), targetInput.trim());

    // Check if files exist and ask confirmation
    const exists = await hasExistingFiles(resolvedTarget);
    if (exists) {
      const confirmOverwrite = await p.confirm({
        message: `El directorio de destino ya contiene archivos. ¿Sobrescribir si hay coincidencias?`,
        initialValue: true,
      });

      if (p.isCancel(confirmOverwrite)) {
        p.cancel("Operación cancelada.");
        process.exit(0);
      }

      if (!confirmOverwrite) {
        p.log.warn(`Se omitirá la instalación de "${item.name}".`);
        continue;
      }
    }

    configuredTargets.push({
      item,
      targetDir: resolvedTarget,
    });
  }

  if (configuredTargets.length === 0) {
    p.outro(pc.yellow("No se seleccionó ninguna librería para instalar."));
    return;
  }

  // Step 4: Installation loop with spinner and isolated rollback (zero crash)
  const results: InstallOperationResult[] = [];
  const s = p.spinner();

  for (const config of configuredTargets) {
    s.start(`Instalando ${config.item.name}...`);

    try {
      const result = await installLibrary({
        item: config.item,
        targetDir: config.targetDir,
      });

      results.push(result);

      if (result.status === "installed") {
        s.stop(pc.green(`✔ ${config.item.name} instalada exitosamente.`));
      } else {
        s.stop(
          pc.red(
            `✖ Error al instalar ${config.item.name}. Rollback automático completado.`,
          ),
        );
        p.log.error(
          `Causa: ${result.errorMessage || "Error desconocido"}\nRollback status: ${result.rollbackSucceeded ? "Completado limpiamente" : "Con advertencias"}`,
        );
      }
    } catch (unhandledError) {
      // Defensive fallback to prevent any unhandled crash
      s.stop(pc.red(`✖ Fallo crítico aislado en ${config.item.name}.`));
      p.log.error(String(unhandledError));
      results.push({
        libraryId: config.item.id,
        libraryName: config.item.name,
        category: config.item.category,
        status: "failed",
        targetPath: config.targetDir,
        filesWritten: [],
        errorMessage: String(unhandledError),
      });
    }
  }

  // Step 5: Summary Note
  const summaryLines = results.map((r) => {
    const relTarget = path.relative(process.cwd(), r.targetPath);
    if (r.status === "installed") {
      return `${pc.green("✔")} ${pc.bold(r.libraryName)} -> ${pc.cyan(relTarget)} (${r.filesWritten.length} archivos)`;
    }
    return `${pc.red("✖")} ${pc.bold(r.libraryName)} -> ${pc.red(`Falló (${r.errorMessage || "Rollback"})`)}`;
  });

  p.note(summaryLines.join("\n"), "Resumen de Instalación");

  const successCount = results.filter((r) => r.status === "installed").length;
  if (successCount === results.length) {
    p.outro(pc.green("¡Todas las librerías se incorporaron con éxito!"));
  } else {
    p.outro(
      pc.yellow(
        `Finalizado: ${successCount} instaladas correctamente, ${results.length - successCount} con fallos o revertidas.`,
      ),
    );
  }
}
