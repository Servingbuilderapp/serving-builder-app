const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const servingBuilderSlugs = [
  // Batch 1
  'lean-canvas-gen', 'buyer-persona-builder', 'value-prop-analyzer', 'tam-sam-som-calc', 'competitor-matrix', 'pre-mortem-sim', 'hypothesis-validator', 'rice-prioritizer', 'elevator-pitch-script', 'empathy-map', 'trend-analyzer', 'naming-gen', 'domain-checker', 'customer-journey-designer', 'virality-calc', 'break-even-calc', 'burn-rate-tracker', 'cac-calc', 'ltv-calc', 'what-if-sim', 'invoice-gen', 'runway-calc', 'tax-estimator', 'currency-converter', 'opex-manager', 'gross-margin-calc', 'unit-economics-analyzer', 'roi-calculator', 'cashflow-planner', 'discount-calc',
  // Batch 2
  'meta-tags-gen', 'keyword-extractor', 'ctr-title-analyzer', 'utm-builder', 'url-shortener', 'robots-txt-gen', 'xml-sitemap-creator', 'keyword-density-analyzer', 'alt-text-gen', 'keyword-difficulty-calc', 'broken-link-checker', 'faq-schema-gen', 'backlink-analyzer', 'speed-optimizer', 'blog-structure-gen', 'hashtag-generator', 'whatsapp-link-creator', 'posting-calendar', 'reels-script-gen', 'ig-bio-analyzer', 'bio-links-builder', 'engagement-rate-calc', 'image-prompt-gen', 'twitter-thread-creator', 'stories-planner', 'comment-picker', 'caption-copy-gen', 'feed-simulator', 'best-time-analyzer', 'video-to-gif',
  // Batch 3
  'ad-copy-generator', 'roas-calculator', 'ads-budget-estimator', 'ab-test-calculator', 'lookalike-audience-gen', 'cpc-cpm-calculator', 'landing-page-analyzer', 'video-ad-script-gen', 'pixel-tracker', 'ctr-estimator', 'mini-crm-leads', 'sales-script-generator', 'quote-tracker', 'commission-calculator', 'dynamic-qr-generator', 'visual-pipeline', 'followup-scheduler', 'churn-analyzer', 'coupon-generator', 'conversion-rate-calc', 'simple-kanban-board', 'time-tracker', 'inventory-manager', 'minutes-organizer', 'shipping-cost-calc', 'sku-generator', 'shipment-tracker', 'supplier-manager', 'route-optimizer', 'quality-checklist',
  // Batch 4
  'terms-conditions-gen', 'privacy-policy-gen', 'nda-generator', 'service-contract-gen', 'partners-agreement', 'legal-notice-gen', 'ip-manager', 'severance-calculator', 'incorporation-checklist', 'trademark-checker', 'job-profile-gen', 'candidate-filter', 'net-salary-calc', 'onboarding-planner', 'performance-evaluator', 'shift-organizer', 'vacation-manager', 'labor-cost-calc', 'work-climate-survey', 'anonymous-suggestion-box', 'email-subject-gen', 'welcome-sequence-designer', 'open-rate-calc', 'spam-checker', 'unsubscribe-link-gen', 'list-cleaner', 'signup-form-creator', 'email-ctr-analyzer', 'pre-header-gen', 'webinar-planner', 'nps-calc', 'public-feedback-box', 'testimonial-generator', 'csat-calculator', 'manual-heatmap', 'support-ticket-analyzer', 'refund-manager', 'exit-survey', 'user-guide-gen', 'response-time-calc',
  // Batch 5
  'podcast-script-generator', 'youtube-title-optimizer', 'influencer-value-calc', 'tts-script-converter', 'brand-palette-analyzer', 'placeholder-generator', 'qr-reader', 'favicon-generator', 'bg-remover', 'mockup-generator', 'webhook-tester', 'json-generator', 'csv-json-converter', 'uptime-monitor', 'web-speed-analyzer', 'secure-password-gen', 'dns-propagation-checker', 'htaccess-generator', 'ssl-cert-reader', 'readme-md-generator',
  // Batch 6
  'product-margin-calc', 'product-description-gen', 'checkout-optimizer', 'volume-discount-calc', 'competitor-price-tracker', 'shipping-label-gen', 'packaging-cost-calc', 'upsell-simulator', 'product-review-manager', 'reorder-point-calc', 'eisenhower-matrix', 'achievement-journal', 'pomodoro-timer', 'hourly-value-calc', 'habit-tracker', 'affirmation-generator', 'reading-organizer', 'financial-freedom-calc', 'express-meditation', 'distraction-blocker', 'blog-topic-gen', 'readability-calc', 'visual-quote-gen', 'bounce-rate-analyzer', 'question-finder', 'success-story-gen', 'whitepaper-planner', 'infographic-struct-gen', 'content-roi-calc', 'brand-asset-manager', 'press-release-gen', 'niche-journalist-finder', 'cold-email-structure', 'sponsorship-value-calc', 'event-webinar-manager', 'digital-card-gen', 'brand-mention-tracker', 'pitch-video-script', 'networking-planner', 'letter-of-intent-gen', 'vulnerability-scanner', 'auto-backup-gen', 'user-permission-manager', 'api-consumption-calc', 'db-cleaner', 'ip-reputation-checker', 'error-log-analyzer', 'maintenance-page-gen', 'latency-calc', 'vision-board-mapper'
];

// Add the old 100 apps to ServingBuilderApp too because they belong there
const oldServingBuilderApps = [
  'ig-captions', 'reels-scripts', 'viral-ideas', 'ig-bio', 'tweet-gen', 'linkedin-strat', 'comment-reply', 'content-calendar', 'tiktok-scripts', 'yt-titles', 'yt-desc', 'hashtag-gen', 'podcast-script', 'fb-ads', 'google-ads', 'email-marketing', 'twitter-threads', 'pinterest-gen', 'google-reviews', 'storytelling', 'yt-shorts', 'linkedin-profile', 'meme-text', 'influencer-collab', 'landing-copy', 'text-summarizer', 'style-corrector', 'pro-translator', 'meeting-minutes', 'daily-tasks', 'formal-emails', 'concept-simplifier', 'interview-questions', 'short-stories', 'sentiment-analysis', 'okr-gen', 'study-planner', 'code-tutor', 'code-explainer', 'doc-gen', 'essay-writer', 'gift-ideas', 'travel-planner', 'recipe-gen', 'brand-name', 'slogan-gen', 'love-letters', 'event-speech', 'smart-goals', 'note-organizer', 'business-plan', 'competitor-analysis', 'investor-proposal', 'idea-validator', 'monetization-strat', 'canvas-builder', 'roadmap-gen', 'pitch-deck-helper', 'user-persona', 'swot-analysis', 'gtm-strategy', 'cost-analysis', 'contingency-plan', 'sales-script', 'retention-strat', 'referral-plan', 'brand-audit', 'pricing-strat', 'expansion-plan', 'stakeholder-mgmt', 'risk-analysis', 'marketing-plan', 'partners-strat', 'ops-manual', 'vision-mission', 'roi-calc', 'unit-converter', 'sql-gen', 'regex-gen', 'data-cleaner', 'json-gen', 'email-validator', 'password-gen', 'readability-ana', 'keyword-ext', 'metatags-seo', 'header-ana', 'sitemap-gen', 'robots-txt', 'schema-gen', 'speed-tips', 'utm-gen', 'perf-ana', 'midjourney-prompt', 'dalle-prompt', 'code-formatter', 'readme-gen', 'markdown-html', 'license-gen', 'a11y-validator'
];

const allServingBuilderSlugs = [...servingBuilderSlugs, ...oldServingBuilderApps];

async function run() {
  console.log("Creando columna portal (si no existe)...");
  
  // No hay un ALTER TABLE fácil desde el cliente REST, usaremos RPC si existe o lo simularemos agregando una metadata.
  // Wait! We can just add the column using SQL if the user has a way to run SQL, or we can use the supabase MCP `execute_sql`.
  
  console.log("Please run execute_sql via MCP tools for the ALTER TABLE.");
}

run();
