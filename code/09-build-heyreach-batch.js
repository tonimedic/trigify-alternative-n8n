// Up to 100 leads per HeyReach call. The opener rides along as the custom variable {signal_opener}.
const cfg = $('SETUP').first().json;
const field = (name, value) => ({ name, value: String(value || '').slice(0, 500) });
const pairs = $input.all().map(i => i.json).map(l => ({
  linkedInAccountId: Number(cfg.heyreach_sender_account_id),
  lead: {
    firstName: l.first_name, lastName: l.last_name, profileUrl: l.profile_url, emailAddress: l.email || null,
    companyName: l.company, position: l.headline,
    customUserFields: [field('signal_opener', l.opener), field('signal_type', l.signal_type), field('signal_source', l.source_label), field('signal_score', l.score)]
  }
}));
const out = [];
for (let i = 0; i < pairs.length; i += 100) out.push({ json: { payload: { campaignId: Number(cfg.heyreach_campaign_id), accountLeadPairs: pairs.slice(i, i + 100) } } });
return out;
