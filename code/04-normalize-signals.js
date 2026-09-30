// Every Apify result becomes one signal shape:
// person_url, person_name, headline, platform, signal_type, weight, source_label, context_text, context_url.
// Champion lookups also emit a bookkeeping row that stores the employer seen today.
const cfg = $('SETUP').first().json;
const sources = $('Load Active Sources').all().map(i => i.json).filter(r => r.kind);
const items = $input.all().map(i => i.json).filter(x => x && typeof x === 'object' && !x.error);
const s = v => String(v || '');
const norm = u => s(u).split('?')[0].replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '').toLowerCase();
const slug = u => { const m = s(u).match(/linkedin\.com\/in\/([^\/?#]+)/i); return m ? decodeURIComponent(m[1]).toLowerCase() : ''; };
const ofKind = k => sources.filter(r => r.kind === k);
const tracked = ofKind('engagement_profile').map(r => norm(r.target));
const out = [];
const add = o => { if (o.person_url && o.person_name) out.push({ json: o }); };

// Which tracked profile or keyword produced this signal
const labelForAuthor = url => {
  const a = norm(url);
  const r = ofKind('engagement_profile').find(x => a && norm(x.target) && a.startsWith(norm(x.target)));
  return r ? r.label : 'Tracked profile';
};
const labelForText = (text, kind, fallback) => {
  const t = s(text).toLowerCase();
  const r = ofKind(kind).find(k => s(k.target).toLowerCase().split(/\s+/).filter(w => w.length > 3).every(w => t.includes(w)));
  return r ? r.label : fallback;
};

// LinkedIn posts, reactions and comments
const posts = items.filter(it => it.author && it.content !== undefined);
const findPost = id => posts.find(p => s(p.id) === s(id) || s(p.linkedinUrl).includes(s(id || '#none#'))) || null;
const linkedinSignal = (who, type, weight, post, comment) => {
  if (!who || typeof who !== 'object') return;
  const url = who.linkedinUrl || who.profileUrl || who.url || '';
  if (!url || tracked.includes(norm(url))) return;
  const author = (post && post.author) || {};
  const kw = cfg.engine === 'keywords';
  add({
    person_url: url,
    person_name: who.name || [who.firstName, who.lastName].filter(Boolean).join(' '),
    headline: s(who.position || who.info || who.headline || who.occupation),
    platform: 'linkedin',
    signal_type: (kw ? 'keyword_' : 'post_') + type,
    weight,
    source_label: kw ? labelForText(post && post.content, 'keyword', 'LinkedIn keyword') : labelForAuthor(author.linkedinUrl),
    context_text: (comment ? 'Their comment: ' + s(comment).slice(0, 500) + '\n\n' : '') + 'Post by ' + (author.name || 'someone') + ': ' + s(post && post.content).slice(0, 900),
    context_url: (post && post.linkedinUrl) || ''
  });
};

const jobs = [];
const profiles = [];

for (const it of items) {
  // X / Twitter
  if (it.author && it.author.userName && (it.text || it.fullText)) {
    const text = it.fullText || it.text;
    add({ person_url: 'https://x.com/' + it.author.userName, person_name: it.author.name || it.author.userName, headline: s(it.author.description), platform: 'x', signal_type: 'x_keyword_post', weight: 3, source_label: labelForText(text, 'x_keyword', 'X keyword'), context_text: 'Their post: ' + s(text).slice(0, 900), context_url: it.url || it.twitterUrl || '' });
    continue;
  }
  // Reddit
  if (it.username && (it.title || it.body) && s(it.url).includes('reddit.com')) {
    const text = s(it.title) + '\n' + s(it.body);
    add({ person_url: 'https://www.reddit.com/user/' + it.username, person_name: it.username, headline: 'Posts in ' + s(it.communityName || it.parsedCommunityName), platform: 'reddit', signal_type: 'reddit_keyword_post', weight: 3, source_label: labelForText(text, 'reddit_keyword', 'Reddit keyword'), context_text: 'Their post: ' + text.slice(0, 900), context_url: it.url });
    continue;
  }
  if (cfg.engine === 'people') {
    if ((it.title || it.jobTitle) && !it.firstName) { jobs.push(it); continue; }
    if (it.firstName || it.publicIdentifier) { profiles.push(it); continue; }
  }
  // LinkedIn reaction or comment returned as its own item
  if (it.reactionType && it.actor) { linkedinSignal(it.actor, 'reaction', 1, findPost(it.postId), null); continue; }
  const commentText = it.commentary || it.text || it.comment;
  if (it.actor && commentText) { linkedinSignal(it.actor, 'comment', cfg.engine === 'keywords' ? 2 : 3, findPost(it.postId), commentText); continue; }
  // LinkedIn post (its author is the signal only in keyword search)
  if (it.author && it.content !== undefined) {
    if (cfg.engine === 'keywords') {
      const a = it.author;
      add({ person_url: a.linkedinUrl || '', person_name: a.name || '', headline: s(a.info || a.position || a.headline), platform: 'linkedin', signal_type: 'keyword_post', weight: 4, source_label: labelForText(it.content, 'keyword', 'LinkedIn keyword'), context_text: 'Their post: ' + s(it.content).slice(0, 900), context_url: it.linkedinUrl || '' });
    }
    for (const r of it.reactions || []) linkedinSignal(r.actor || r, 'reaction', 1, it, null);
    for (const c of it.comments || []) linkedinSignal(c.actor || c.author || c, 'comment', cfg.engine === 'keywords' ? 2 : 3, it, c.commentary || c.text);
  }
}

// Champions: compare today's employer with the one stored last run
const company = p => (p.currentPosition && p.currentPosition[0] && p.currentPosition[0].companyName) || (p.experience && p.experience[0] && p.experience[0].companyName) || p.companyName || '';
for (const c of ofKind('champion')) {
  const p = profiles.find(x => slug(x.linkedinUrl) === slug(c.target) || s(x.publicIdentifier).toLowerCase() === slug(c.target));
  if (!p) continue;
  const now = s(company(p)).trim();
  if (!now) continue;
  const before = s(c.last_value).trim();
  out.push({ json: { _bookkeeping: true, row_id: c.id, last_value: now } });
  if (before && before.toLowerCase() !== now.toLowerCase()) {
    add({ person_url: p.linkedinUrl || c.target, person_name: [p.firstName, p.lastName].filter(Boolean).join(' ') || c.label, headline: s(p.headline), platform: 'linkedin', signal_type: 'job_change', weight: 5, source_label: 'Champion: ' + (c.label || 'tracked'), context_text: 'Former champion moved from ' + before + ' to ' + now + '. New headline: ' + s(p.headline) + '. Notes: ' + s(c.notes), context_url: p.linkedinUrl || c.target });
  }
}

// Hiring: one account-level signal per company, open roles rolled up
const byAccount = {};
for (const j of jobs) {
  const cUrl = (j.company && (j.company.linkedinUrl || j.company.url)) || j.companyUrl || j.companyLinkedinUrl || '';
  const cName = (j.company && j.company.name) || j.companyName || '';
  const acct = ofKind('hiring_account').find(a => (cUrl && norm(cUrl).startsWith(norm(a.target))) || (cName && s(a.label).toLowerCase().includes(cName.toLowerCase())));
  if (!acct) continue;
  const g = byAccount[acct.target] = byAccount[acct.target] || { acct, name: cName, roles: [] };
  g.roles.push(s(j.title || j.jobTitle) + (j.location ? ' (' + s(j.location.linkedinText || j.location) + ')' : '') + ' ' + s(j.linkedinUrl || j.url));
}
for (const g of Object.values(byAccount)) {
  add({ person_url: g.acct.target, person_name: g.name || g.acct.label, headline: 'Company, not a person: ' + (g.name || g.acct.label) + ' is hiring ' + g.roles.length + ' matching role(s)', platform: 'linkedin_company', signal_type: 'hiring', weight: 3, source_label: g.acct.label || 'Hiring watch', context_text: 'Open roles posted this week:\n' + g.roles.slice(0, 8).join('\n'), context_url: g.acct.target.replace(/\/$/, '') + '/jobs/' });
}

return out;
