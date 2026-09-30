// =====================================================================
//  SETUP: the only node you edit.
//  Every block marked EXAMPLE is working demo content. Replace it with
//  your own before you switch the schedules on.
// =====================================================================

const engine =
  $('Daily 07:00: Post Engagement').isExecuted ? 'engagement' :
  $('Daily 06:00: Keyword Listening').isExecuted ? 'keywords' :
  $('Monday 08:00: Job Changes and Hiring').isExecuted ? 'people' :
  'demo';

return [{ json: {
  engine,

  // 1. WHO YOU SELL TO. EXAMPLE: rewrite in plain words for your business.
  //    Jev reads this to judge buyer fit, and to spot sellers pitching the same thing.
  icp: {
    what_we_sell: 'We build and run the sales system (CRM, pipeline, follow-up, reporting, outbound) for companies with a sales team',
    ideal_buyer: 'Founder, CEO, COO, VP or Head of Sales, Head of RevOps at a company that sells a high-ticket product or service through human salespeople',
    not_a_fit: 'Low-ticket or self-serve products, solo operators with no sales team, agencies or consultants selling sales or CRM services, software vendors, recruiters, job seekers, students'
  },

  // 2. PAIN ANGLES AND OPENERS. EXAMPLE: keep the structure, rewrite the words.
  //    Jev picks the angle closest to what the person wrote or engaged with.
  //    `opener` is sent to HeyReach as the custom variable {signal_opener}.
  //    Write it the way you would type it. No pitch in the first line.
  angles: {
    crm_admin: {
      means: 'Reps lose time to CRM data entry, logging, or manual admin instead of selling',
      opener: 'Saw your note on reps losing time to CRM admin. Is it the logging itself, or chasing stage updates after calls?'
    },
    follow_up: {
      means: 'Leads or deals slip because follow-up is slow, missed, or inconsistent',
      opener: 'Saw your point on leads going cold before anyone follows up. Is that a speed problem or a who-owns-it problem on your side?'
    },
    pipeline_visibility: {
      means: 'Leadership cannot trust the pipeline, forecast, or reporting',
      opener: 'Saw your post on not trusting the pipeline numbers. Is it the data going in, or how the stages are defined?'
    },
    outbound_broken: {
      means: 'Outbound or cold outreach has stopped producing meetings',
      opener: 'Saw your take on outbound drying up. Did it fade gradually, or drop after one specific change?'
    },
    scaling_team: {
      means: 'Hiring or onboarding reps, or deciding whether to add sales headcount',
      opener: 'Saw you are thinking about adding reps. Have you mapped how much of the current team\'s week goes to non-selling work?'
    }
  },

  // 3. SCORING. Weights add up to 1. A lead at or above hot_score gets routed.
  weights: { buyer_fit: 0.55, pain: 0.35, stacking: 0.10 },
  hot_score: 70,

  // 4. WHERE HOT LEADS GO. Anything left empty ('' or 0 or false) is skipped,
  //    so the workflow runs end to end before you connect every tool.
  heyreach_campaign_id: 0,        // PASTE: HeyReach campaign ID. The campaign must be running.
  heyreach_sender_account_id: 0,  // PASTE: the LinkedIn sender account ID inside HeyReach
  hubspot_enabled: false,         // true once the HubSpot credential is connected
  enrich_emails: false,           // true = Apify email lookup on hot LinkedIn leads only (~$10 per 1k)
  telegram_chat_id: ''            // PASTE: your Telegram chat ID for hot-lead alerts
} }];
