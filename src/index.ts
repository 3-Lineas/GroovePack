import { runCli } from "./cli/run-cli.js";

// Top-level crash guard
process.on("unhandledRejection", (reason) => {
  console.error("\n[groovepack] Advertencia de excepción no capturada:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("\n[groovepack] Error crítico capturado para evitar cierre abrupto:", error.message);
});

runCli().catch((err) => {
  console.error("\n[groovepack] Error durante la ejecución del CLI:", err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
