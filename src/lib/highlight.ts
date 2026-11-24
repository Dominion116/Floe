export type Lang = "ts" | "move" | "bash" | "json" | "text";

export interface CodeToken {
  text: string;
  kind: "plain" | "comment" | "string" | "keyword";
}

// Groups, in order: comment, string, keyword.
const RULES: Record<Exclude<Lang, "text">, RegExp> = {
  ts: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(import|from|export|const|let|function|return|async|await|type|interface|if|else|new|throw|true|false|null)\b/g,
  move: /(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*")|\b(module|use|public|struct|has|key|store|copy|drop|fun|const|let|mut|phantom|true|false)\b/g,
  bash: /((?<=^|\s)#[^\n]*)|("(?:\\.|[^"\\\n])*")|\b(cd|git|npm|npx|cp|sui|curl)\b(?=\s)/g,
  json: /(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*")|\b(true|false|null)\b/g,
};

/** A small tokenizer for short, trusted snippets. Runs on the server only. */
export function tokenize(code: string, lang: Lang): CodeToken[] {
  if (lang === "text") return [{ text: code, kind: "plain" }];
  const tokens: CodeToken[] = [];
  let last = 0;
  for (const match of code.matchAll(RULES[lang])) {
    if (match.index > last) tokens.push({ text: code.slice(last, match.index), kind: "plain" });
    const kind =
      match[1] !== undefined ? "comment" : match[2] !== undefined ? "string" : "keyword";
    tokens.push({ text: match[0], kind });
    last = match.index + match[0].length;
  }
  if (last < code.length) tokens.push({ text: code.slice(last), kind: "plain" });
  return tokens;
}
