// DEMO DATA. Three made-up signals so you can watch scoring work before connecting Apify.
// Needs only the TypeSafe credential. Nothing here is pushed to HeyReach or HubSpot.
const run = 'demo-run-' + $execution.id;
const demo = [
  { person_url: 'https://www.linkedin.com/in/demo-jane-example', person_name: 'Jane Example (demo)', headline: 'VP Sales at Northwind Solar, 40-person sales team', platform: 'linkedin', signal_type: 'post_comment', weight: 3, source_label: 'Demo: competitor post', context_text: 'Their comment: honestly my reps spend two hours a day logging calls in the CRM. Nobody wants to admit it.', context_url: run + '/1' },
  { person_url: 'https://www.linkedin.com/in/demo-mark-agency', person_name: 'Mark Agency (demo)', headline: 'Founder @ PipelineCraft | I help B2B teams fix their CRM | HubSpot Partner', platform: 'linkedin', signal_type: 'keyword_post', weight: 4, source_label: 'Demo: keyword', context_text: 'Their post: 5 reasons your reps hate your CRM (and how my agency fixes it in 30 days). DM me.', context_url: run + '/2' },
  { person_url: 'https://www.linkedin.com/in/demo-tom-legal', person_name: 'Tom Harbor (demo)', headline: 'CEO at Harbor Legal Group, 12 partners', platform: 'linkedin', signal_type: 'keyword_post', weight: 4, source_label: 'Demo: keyword', context_text: 'Their post: we get plenty of inbound consults but half of them never hear back from us within a day. How are other firms handling intake follow-up?', context_url: run + '/3' }
];
return demo.map(d => ({ json: d }));
