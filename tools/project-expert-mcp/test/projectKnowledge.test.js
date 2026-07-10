import assert from "node:assert/strict";
import test from "node:test";

import {
  answerProjectQuestion,
  getCodingPatterns,
  hasRipgrep,
  listFunctionalAreas,
  locateFunctionalArea,
  readProjectDoc,
  searchProject,
} from "../src/projectKnowledge.js";

test("maps a project file to its functional area", () => {
  const result = locateFunctionalArea({ path: "src/ui/src/services/gameStorage.js" });

  assert.match(result, /Game Persistence/);
  assert.match(result, /createGameStorage/);
});

test("filters functional areas by topic", () => {
  const result = listFunctionalAreas({ query: "terraform deployment" });

  assert.match(result, /API, Deployment, and Infrastructure/);
  assert.match(result, /scripts\/deploy\.sh/);
});

test("returns curated coding patterns by topic", () => {
  const result = getCodingPatterns({ topic: "simulation" });

  assert.match(result, /Simulation roadmap/);
  assert.match(result, /PlayerState/);
});

test("reads canonical project docs", async () => {
  const result = await readProjectDoc({ docId: "architecture", maxChars: 4000 });

  assert.match(result, /# Architecture/);
  assert.match(result, /static React UI/);
});

test("searches project source with ripgrep", { skip: !hasRipgrep() }, async () => {
  const result = await searchProject({
    query: "createGameStorage",
    globs: ["src/ui/src/services/**"],
    contextLines: 0,
    maxResults: 5,
  });

  assert.match(result, /createGameStorage/);
  assert.match(result, /Command: rg/);
});

test("gathers source-grounded context for a question", { skip: !hasRipgrep() }, async () => {
  const result = await answerProjectQuestion({
    question: "Where does storage live and what pattern should I follow?",
    maxResults: 10,
  });

  assert.match(result, /Game Persistence/);
  assert.match(result, /storage/i);
  assert.match(result, /Source Evidence/);
});
