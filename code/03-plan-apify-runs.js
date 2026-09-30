// Turns the active rows of the Sources table into Apify runs for the engine that fired.
// Returns nothing when there is nothing to track, so an empty engine costs nothing.
const cfg = $('SETUP').first().json;
const rows = $input.all().map(i => i.json).filter(r => r.active && r.target);
const of = kind => rows.filter(r => r.kind === kind).map(r => r.target);
const runs = [];

if (cfg.engine === 'engagement' && of('engagement_profile').length) {
  // Posts from tracked profiles or company pages, plus who reacted and commented.
  // 'short' profile mode is free and returns normal /in/ profile URLs, so the same
  // person matches across engines and in HeyReach. Max 10 authors per run.
  runs.push({ actor: 'harvestapi~linkedin-post-search', input: {
    authorUrls: of('engagement_profile').slice(0, 10), postedLimit: 'week', sortBy: 'date', maxPosts: 30,
    scrapeReactions: true, maxReactions: 200, reactionsProfileScraperMode: 'short', postNestedReactions: false,
    scrapeComments: true, maxComments: 100, commentsProfileScraperMode: 'short', postNestedComments: false
  } });
}

if (cfg.engine === 'keywords') {
  if (of('keyword').length) runs.push({ actor: 'harvestapi~linkedin-post-search', input: {
    searchQueries: of('keyword'), postedLimit: '24h', sortBy: 'date', maxPosts: 50,
    scrapeComments: true, maxComments: 30, profileScraperMode: 'short', commentsProfileScraperMode: 'short'
  } });
  if (of('x_keyword').length) runs.push({ actor: 'apidojo~tweet-scraper', input: {
    searchTerms: of('x_keyword'), sort: 'Latest', maxItems: 100, tweetLanguage: 'en',
    start: $now.minus({ days: 1 }).toFormat('yyyy-MM-dd')
  } });
  if (of('reddit_keyword').length) runs.push({ actor: 'trudax~reddit-scraper-lite', input: {
    searches: of('reddit_keyword'), sort: 'new', time: 'day', maxItems: 50, maxPostCount: 50,
    searchPosts: true, skipComments: true, skipUserPosts: true, skipCommunity: true,
    includeNSFW: false, proxy: { useApifyProxy: true }
  } });
}

if (cfg.engine === 'people') {
  if (of('champion').length) runs.push({ actor: 'harvestapi~linkedin-profile-scraper', input: {
    profileScraperMode: 'Profile details no email ($4 per 1k)', queries: of('champion')
  } });
  const accounts = rows.filter(r => r.kind === 'hiring_account');
  if (accounts.length) runs.push({ actor: 'harvestapi~linkedin-job-search', input: {
    company: accounts.map(a => a.target),
    jobTitles: [...new Set(accounts.flatMap(a => String(a.notes || 'sales development representative').split(',').map(t => t.trim()).filter(Boolean)))],
    postedLimit: 'week', sortBy: 'date', maxItems: 100
  } });
}

return runs.map(r => ({ json: r }));
