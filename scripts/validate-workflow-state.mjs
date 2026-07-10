import process from "node:process";
import { validateWorkflowState } from "./workflow-state-validation-core.mjs";

const result = await validateWorkflowState({
  root: process.cwd(),
  includeChangedFiles: true,
});

if (!result.ok) {
  console.error(result.errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Workflow state is valid.");
