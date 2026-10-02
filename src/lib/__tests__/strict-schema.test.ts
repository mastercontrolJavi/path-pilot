/**
 * Offline guard for OpenAI strict structured outputs: the report schema, as the
 * AI SDK serialises it, must keep every property required, forbid extra
 * properties, and use only keywords strict mode supports. Breaking these rules
 * makes every analysis fail at request time.
 */
import { describe, it, expect } from "vitest";
import { asSchema } from "ai";
import { z } from "zod/v4";
import { analysisResultSchema } from "../schemas";

type Json = Record<string, unknown>;

const SUPPORTED = new Set([
  "type", "properties", "required", "additionalProperties", "items", "anyOf", "enum", "const",
  "description", "minItems", "maxItems", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum",
  "multipleOf", "pattern", "format", "$schema", "$ref", "$defs", "definitions", "default",
]);

function walk(node: unknown, path: string, problems: string[]) {
  if (!node || typeof node !== "object") return;
  const n = node as Json;
  for (const key of Object.keys(n)) {
    if (!SUPPORTED.has(key) && path !== "$.properties" && !path.endsWith(".properties")) {
      problems.push(`${path}: unsupported keyword "${key}"`);
    }
  }
  if (n.type === "object" || n.properties) {
    const props = Object.keys((n.properties as Json) ?? {});
    const required = new Set((n.required as string[]) ?? []);
    for (const p of props) if (!required.has(p)) problems.push(`${path}.${p}: not in required`);
    if (n.additionalProperties !== false) problems.push(`${path}: additionalProperties must be false`);
    for (const [k, v] of Object.entries((n.properties as Json) ?? {})) walk(v, `${path}.${k}`, problems);
  }
  if (n.items) walk(n.items, `${path}[]`, problems);
  if (Array.isArray(n.anyOf)) n.anyOf.forEach((v, i) => walk(v, `${path}|${i}`, problems));
}

describe("report schema is valid for OpenAI strict mode", () => {
  it("has no optional keys, extra properties or unsupported keywords", async () => {
    const json = (await asSchema(analysisResultSchema).jsonSchema) as Json;
    const problems: string[] = [];
    walk(json, "$", problems);
    expect(problems).toEqual([]);
  });

  it("catches an optional key (guard self-check)", async () => {
    const bad = z.object({ a: z.string(), b: z.string().optional() });
    const problems: string[] = [];
    walk(await asSchema(bad).jsonSchema, "$", problems);
    expect(problems).toContain("$.b: not in required");
  });

  it("represents a missing salary estimate as nullable, not optional", async () => {
    const json = (await asSchema(analysisResultSchema).jsonSchema) as Json;
    const path = ((json.properties as Json).career_paths as Json).items as Json;
    const salary = (path.properties as Json).salary_estimate as Json;
    const variants = (salary.anyOf as Json[] | undefined) ?? [];
    const allowsNull = variants.some((v) => v.type === "null") || (Array.isArray(salary.type) && salary.type.includes("null"));
    expect(allowsNull).toBe(true);
    expect((path.required as string[]).includes("salary_estimate")).toBe(true);
  });
});
