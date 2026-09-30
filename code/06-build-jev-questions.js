// Four independent judgments per signal, asked in one Jev call.
// Jev returns probabilities, not prose. The next node turns them into a 0-100 score.
const cfg = $('SETUP').first().json;
const angles = {};
for (const [k, v] of Object.entries(cfg.angles)) angles[k] = v.means;
angles.none = 'None of these, or not enough context to tell';
const questions = {
  buyer_fit: { type: 'score',
    instructions: { question: 'How well does this `person` match the ideal buyer in `icp`? Judge the role and the kind of company their headline suggests. If `person` is a company rather than an individual, judge whether the company fits.', icp: cfg.icp },
    criteria: ['Clearly not a fit: matches something in icp.not_a_fit, or has no buying role', 'Unclear: not enough information about role or company', 'Partial fit: right kind of company but not a decision maker, or decision maker at a doubtful company', 'Strong fit: decision maker at a company that plausibly sells high-ticket through a sales team'] },
  pain_intent: { type: 'score',
    instructions: 'How strongly does `signal.text` show that this person (or company) is experiencing a sales-process problem right now? Reacting to someone else\'s post counts less than describing their own situation. Actively hiring sales roles counts as a moderate signal.',
    criteria: ['No evidence: a like or generic reaction, or text about something unrelated', 'Weak: agrees with or comments on the topic without describing their own situation', 'Moderate: describes the problem as relevant to their own team, or is hiring for it', 'Strong: describes their own current problem in concrete terms, or asks for help solving it'] },
  is_seller: { type: 'noul',
    instructions: { question: 'Is this person selling something related to `icp.what_we_sell` rather than buying it, for example a consultant, agency, coach, or software vendor promoting their own offer?', icp: cfg.icp } },
  angle: { type: 'choice', instructions: 'Which problem is closest to what `signal.text` is about?', criteria: angles }
};
return $input.all().map(it => ({ json: { ...it.json, jev_body: {
  model: 'jev-latest',
  state: {
    person: { name: it.json.person_name, headline: it.json.headline },
    signal: { type: it.json.signal_type, source: it.json.source_label, text: it.json.context_text },
    other_signals_last_30_days: it.json.stack_types
  },
  questions
} } }));
