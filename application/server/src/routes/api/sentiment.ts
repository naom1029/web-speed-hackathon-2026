import { createRequire } from "node:module";
import path from "node:path";

import { Router } from "express";

export const sentimentRouter = Router();

const require = createRequire(import.meta.url);
const dicPath = path.join(path.dirname(require.resolve("kuromoji/package.json")), "dict");

let tokenizerPromise: Promise<any> | null = null;

async function getTokenizer(): Promise<any> {
  if (!tokenizerPromise) {
    tokenizerPromise = (async () => {
      const kuromoji = await import("kuromoji");
      return new Promise((resolve, reject) => {
        kuromoji.default.builder({ dicPath }).build((err: any, tokenizer: any) => {
          if (err) {
            tokenizerPromise = null;
            reject(err);
          } else {
            resolve(tokenizer);
          }
        });
      });
    })();
  }
  return tokenizerPromise;
}

sentimentRouter.post("/sentiment", async (req, res) => {
  const { text } = req.body as { text?: string };
  if (!text) {
    res.json({ score: 0, label: "neutral" });
    return;
  }

  try {
    const { default: analyze } = await import("negaposi-analyzer-ja");
    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text);
    const score = analyze(tokens);

    let label: string;
    if (score > 0.1) {
      label = "positive";
    } else if (score < -0.1) {
      label = "negative";
    } else {
      label = "neutral";
    }

    res.json({ score, label });
  } catch {
    res.json({ score: 0, label: "neutral" });
  }
});
