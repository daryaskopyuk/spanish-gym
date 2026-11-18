// PostToolUse hook: format the file Claude just edited with the project's Prettier.
// Silently does nothing if Prettier isn't installed yet or the file type isn't supported.
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

try {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  const file = input?.tool_input?.file_path;
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const prettier = path.join(root, 'node_modules', '.bin', 'prettier');
  const supported = /\.(ts|tsx|js|jsx|mjs|cjs|json|md|yml|yaml)$/;
  const generated = /src[\\/]data[\\/]verbs\.json$/;

  if (
    file &&
    supported.test(file) &&
    !generated.test(file) &&
    existsSync(file) &&
    existsSync(prettier)
  ) {
    spawnSync(prettier, ['--write', '--log-level', 'warn', file], { cwd: root, stdio: 'ignore' });
  }
} catch {
  // Never block the agent because of formatting.
}
process.exit(0);
