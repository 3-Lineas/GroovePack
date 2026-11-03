import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { installLibrary } from "../src/installer/install-library.js";
import { REGISTRY_ITEMS } from "../src/registry/registry-catalog.js";

async function runTests() {
  console.log("==> Iniciando tests de Groovepack (Simplificado)...");

  const tempBase = await fs.mkdtemp(path.join(os.tmpdir(), "groovepack-test-"));
  const registryDir = path.resolve(process.cwd(), "registry");

  try {
    // Test 1: Verificar que todas las librerías del registro se puedan instalar limpiamente
    for (const item of REGISTRY_ITEMS) {
      console.log(`1. Instalando librería "${item.id}" (${item.category})...`);
      const targetDir = path.join(tempBase, "project", item.defaultTarget);
      const res = await installLibrary({
        item,
        targetDir,
        baseRegistryDir: registryDir,
      });

      assert.equal(res.status, "installed", `La librería ${item.id} debe instalarse con éxito`);
      assert(res.filesWritten.length > 0, `Debe haber escrito archivos para ${item.id}`);

      const mainFile = path.join(targetDir, "index.ts");
      const stat = await fs.stat(mainFile);
      assert(stat.isFile(), `El archivo principal de ${item.id} debe existir`);
      console.log(`✔ Librería "${item.id}" instalada correctamente.`);
    }

    // Test 2: Simulación de fallo y rollback automático sin crash
    console.log("2. Probando rollback automático ante template inexistente...");
    const corruptItem = {
      id: "fake-lib",
      name: "Fake",
      description: "Fake",
      category: "common" as const,
      templateRelativeDir: "non/existent/path",
      defaultTarget: "src/lib/fake",
      files: [{ sourcePath: "index.ts", targetRelPath: "index.ts" }],
    };
    const failTarget = path.join(tempBase, "fail-test", "should-be-cleaned");

    const resRollback = await installLibrary({
      item: corruptItem,
      targetDir: failTarget,
      baseRegistryDir: registryDir,
    });

    assert.equal(resRollback.status, "rolled_back", "El estado debe ser rolled_back");
    assert(resRollback.errorMessage, "Debe reportar mensaje de error sin arrojar excepción fatal");

    let dirExists = true;
    try {
      await fs.stat(failTarget);
    } catch {
      dirExists = false;
    }
    assert.equal(dirExists, false, "El directorio temporal debió ser eliminado por el rollback");
    console.log("✔ Rollback transaccional verificado.");

    console.log("\n Todos los tests pasaron exitosamente.");
  } finally {
    await fs.rm(tempBase, { recursive: true, force: true });
  }
}

runTests().catch((err) => {
  console.error("Test fallido:", err);
  process.exit(1);
});
