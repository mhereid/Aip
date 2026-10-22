// Verifies aib/questions.js. Run: node aib/tools/check.js [/path/to/aws-ai-business-strategist]
// With a source path it also checks every field against the original bank.
const vm = require('vm'), fs = require('fs'), path = require('path');
const load = (files, key) => { const ctx = { window: {} }; vm.createContext(ctx); files.forEach(f => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx)); return ctx.window[key]; };
const Q = load([path.join(__dirname, '..', 'questions.js')], 'AIB_QUESTIONS'), errs = [];
const ids = new Set(), texts = new Set();
Q.forEach((q, i) => {
  const e = m => errs.push(`${q.id}: ${m}`);
  if (ids.has(q.id)) e('duplicate id'); ids.add(q.id);
  if (texts.has(q.question)) e('duplicate question text'); texts.add(q.question);
  if (q.n !== i + 1) e('n out of sequence');
  if (![1, 2, 3, 4].includes(q.domain) || !q.id.startsWith('d' + q.domain + '-')) e('bad domain');
  if (!q.question.trim() || q.options.length < 4) e('missing question or options');
  const oids = q.options.map(o => o.id);
  if (new Set(oids).size !== oids.length) e('duplicate option id');
  if (q.options.some(o => !o.text.trim() || !o.why.trim())) e('empty option text or explanation');
  if (!q.answer.length || new Set(q.answer).size !== q.answer.length || q.answer.some(a => !oids.includes(a))) e('invalid answer id');
  const m = q.question.match(/\(Select (\w+)\.\)/), want = { 2: 'TWO', 3: 'THREE' }[q.answer.length];
  if (q.answer.length > 1 ? m?.[1] !== want : m) e('Select-N tag does not match answer count');
});
const by = [1, 2, 3, 4].map(d => Q.filter(q => q.domain === d).length);
if (Q.length !== 340 || ids.size !== 340) errs.push(`expected 340 unique questions, got ${Q.length} (${ids.size} unique)`);
if (by.some(n => n !== 85)) errs.push(`expected 85 per domain, got ${by.join('/')}`);
const src = process.argv[2];
if (src) {
  const S = load(['d1', 'd2', 'd3', 'd4'].map(f => path.join(src, 'data', f + '.js')), 'QUESTIONS');
  if (S.length !== Q.length) errs.push('count differs from source');
  S.forEach((s, i) => {
    const q = Q[i], e = m => errs.push(`${s.id}: ${m} differs from source`);
    if (!q || q.id !== s.id || q.domain !== s.d) return e('id/domain');
    if (q.question !== s.q) e('question');
    if (q.options.length !== s.o.length || s.o.some((t, j) => q.options[j].text !== t || q.options[j].why !== s.r[j])) e('options/explanations');
    if (JSON.stringify(q.answer.map(a => a.charCodeAt(0) - 65)) !== JSON.stringify(s.a)) e('answer');
  });
}
console.log(`${Q.length} questions · ${ids.size} unique · by domain ${by.join('/')} · multi-answer ${Q.filter(q => q.answer.length > 1).length}${src ? ' · matches source' : ''}`);
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
console.log('OK');
