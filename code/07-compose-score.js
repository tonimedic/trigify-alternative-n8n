// Policy lives here, in code, so you can retune weights without re-asking Jev.
const cfg = $('SETUP').first().json;
const w = cfg.weights;
return $input.all().map((it, i) => {
  const base = $('Build Jev Questions').itemMatching(i).json;
  const a = it.json.answers;
  if (!a) return { json: { ...base, signal_row_id: base.id, score: 0, tier: 'error', opener: '', angle: '', why: 'Jev call failed: ' + JSON.stringify(it.json.error || it.json).slice(0, 200), is_hot: false } };
  const fit = (a.buyer_fit.score || 0) / 3;
  const pain = (a.pain_intent.score || 0) / 3;
  const seller = a.is_seller.noul || 0;
  const stacking = Math.min(Math.max((base.stack_count || 1) - 1, 0), 2) / 2;
  let raw = w.buyer_fit * fit + w.pain * pain + w.stacking * stacking;
  if (fit < 0.5) raw = Math.min(raw, 0.4);   // a non-buyer never goes hot, however loud the signal
  if (seller > 0.5) raw = raw * 0.2;          // sellers pitching the same thing are not leads
  const score = Math.round(raw * 100);
  const angle = a.angle.choice || 'none';
  const opener = cfg.angles[angle] ? cfg.angles[angle].opener : '';
  return { json: {
    ...base, signal_row_id: base.id, score, angle, opener,
    tier: score >= cfg.hot_score ? 'hot' : score >= 40 ? 'warm' : 'cold',
    why: 'fit ' + fit.toFixed(2) + ' | pain ' + pain.toFixed(2) + ' | seller ' + seller.toFixed(2) + ' | stack ' + base.stack_count + ' | angle ' + angle + ' (' + (a.angle.confidence || 0).toFixed(2) + ')',
    is_hot: score >= cfg.hot_score
  } };
});
