// EXAMPLE SOURCES. They work as-is so the first run returns real data.
// Replace each target with your own competitors, keywords, champions and accounts.
// kind: engagement_profile | keyword | x_keyword | reddit_keyword | champion | hiring_account
return [
  { kind: 'engagement_profile', target: 'https://www.linkedin.com/company/heyreach/', label: 'EXAMPLE: HeyReach page (swap for a competitor)', active: true, last_value: '', notes: 'Profile or company page. People who react or comment on its posts become signals.' },
  { kind: 'keyword', target: 'reps updating the CRM', label: 'EXAMPLE: pain, CRM admin', active: true, last_value: '', notes: 'LinkedIn post search. Write the pain the way a buyer says it, not a category word.' },
  { kind: 'x_keyword', target: 'our CRM reps', label: 'EXAMPLE: X, CRM pain', active: true, last_value: '', notes: 'X search syntax works here.' },
  { kind: 'reddit_keyword', target: 'reps won\'t update CRM', label: 'EXAMPLE: Reddit, CRM pain', active: true, last_value: '', notes: 'Reddit search.' },
  { kind: 'hiring_account', target: 'https://www.linkedin.com/company/hubspot/', label: 'EXAMPLE: HubSpot (swap for a target account)', active: true, last_value: '', notes: 'sales development representative, revops' },
  { kind: 'champion', target: 'https://www.linkedin.com/in/PASTE-A-PAST-CHAMPION/', label: 'EXAMPLE: past buyer, replace then set active', active: false, last_value: '', notes: 'First run stores their employer. A later change fires a job_change signal.' }
].map(r => ({ json: r }));
