// Adds name, company and email from the Apify lookup when it ran. Matches by LinkedIn slug.
const leads = $('Live LinkedIn Lead?').all().map(i => i.json);
const profiles = $('Enrich Hot Leads').isExecuted ? $('Enrich Hot Leads').all().map(i => i.json).filter(p => p && (p.linkedinUrl || p.publicIdentifier)) : [];
const slug = u => { const m = String(u || '').match(/linkedin\.com\/in\/([^\/?#]+)/i); return m ? decodeURIComponent(m[1]).toLowerCase() : ''; };
const findEmail = (o, d = 0) => {
  if (d > 6 || o === null || o === undefined) return '';
  if (typeof o === 'string') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o) ? o : '';
  if (typeof o === 'object') { for (const k in o) { const r = findEmail(o[k], d + 1); if (r) return r; } }
  return '';
};
const company = p => (p.currentPosition && p.currentPosition[0] && p.currentPosition[0].companyName) || (p.experience && p.experience[0] && p.experience[0].companyName) || '';
return leads.map(lead => {
  const s = slug(lead.person_url);
  const p = profiles.find(x => slug(x.linkedinUrl) === s || String(x.publicIdentifier || '').toLowerCase() === s) || {};
  const name = String(lead.person_name || '').split(' ');
  return { json: { ...lead,
    profile_url: p.linkedinUrl || lead.person_url,
    first_name: p.firstName || name[0] || '',
    last_name: p.lastName || name.slice(1).join(' '),
    company: company(p),
    email: findEmail(p.emails || p.email || '')
  } };
});
