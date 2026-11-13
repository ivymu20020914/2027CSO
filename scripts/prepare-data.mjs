import { mkdir, writeFile } from 'node:fs/promises';
import { TASKS } from '../client/src/data/tasks.ts';
import { NOTICES } from '../client/src/data/notices.ts';
import { DECISIONS } from '../client/src/data/decisions.ts';

const quote = value => "'" + value.replaceAll("'", "''") + "'";
const statements = [];
for (const [table, key, records] of [
  ['forum_task', 'taskId', TASKS],
  ['forum_notice', 'noticeId', NOTICES],
  ['forum_decision', 'decisionId', DECISIONS],
]) {
  for (const record of records) statements.push(`INSERT OR IGNORE INTO ${table} (id, data) VALUES (${quote(record[key])}, ${quote(JSON.stringify(record))});`);
}
await mkdir('.deploy', { recursive: true });
await writeFile('.deploy/seed.sql', statements.join('\n'));
console.log(`Prepared ${TASKS.length} tasks, ${NOTICES.length} notices and ${DECISIONS.length} decisions.`);
