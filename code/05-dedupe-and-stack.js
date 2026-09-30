// Drops anything already seen in the last 30 days, then counts every distinct signal
// each person produced across all engines (signal stacking).
const EXCLUDE = ['student', 'intern', 'recruiter', 'talent acquisition', 'open to work', 'seeking new', 'job seeker'];
const incoming = $('Collect Signals').all().map(i => i.json);
const history = $('Load Last 30 Days').all().map(i => i.json).filter(r => r.dedup_key);
const clean = u => String(u || '').split('?')[0].replace(/\/$/, '');
const seen = new Set(history.map(r => r.dedup_key));
const fresh = [];
for (const s of incoming) {
  const url = clean(s.person_url);
  if (!url || !s.signal_type) continue;
  const key = [s.platform || 'linkedin', s.signal_type, url, s.context_url || s.source_label || ''].join('|').toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  fresh.push({ ...s, person_url: url, dedup_key: key });
}
const stacks = {};
for (const r of history.concat(fresh)) {
  const url = clean(r.person_url);
  if (url) (stacks[url] = stacks[url] || new Set()).add(r.signal_type + ' / ' + (r.source_label || 'n/a'));
}
return fresh.map(s => {
  const headline = String(s.headline || '').slice(0, 300);
  const stack = [...(stacks[s.person_url] || [])];
  return { json: {
    dedup_key: s.dedup_key, person_url: s.person_url, person_name: s.person_name || '', headline,
    platform: s.platform || 'linkedin', signal_type: s.signal_type, source_label: s.source_label || '',
    context_text: String(s.context_text || '').slice(0, 1500), context_url: s.context_url || '',
    weight: Number(s.weight) || 1, stack_count: stack.length, stack_types: stack.join('; ').slice(0, 500),
    prefilter: !EXCLUDE.some(w => headline.toLowerCase().includes(w)) && !!s.person_name,
    score: 0, tier: 'unscored', opener: '', angle: '', why: '', routed: false,
    detected_at: new Date().toISOString()
  } };
});
