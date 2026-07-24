import {
  Users,
  Activity,
  MousePointerClick,
  Layers,
  Timer,
  UserCheck,
  ShieldCheck,
  Clock,
  UserPlus,
  Map,
  ArrowRightLeft,
  Share2,
  Megaphone,
  FileText,
  Download,
} from 'lucide-react';
import type { AnalyticsMetric } from '../types';

/**
 * The 8 Overview KPI cards (id + label + icon + hint). Values are `null`
 * ("—") by default; the Analytics Data Source fills them with real data,
 * WITHOUT changing these definitions. A metric that can't be computed stays "—".
 */
export const OVERVIEW_METRICS: AnalyticsMetric[] = [
  { id: 'total-visitors', label: 'Total Visitors', value: null, icon: Users, hint: 'Unique visitors' },
  { id: 'total-sessions', label: 'Total Sessions', value: null, icon: Activity, hint: 'All sessions' },
  { id: 'total-events', label: 'Tracked Events', value: null, icon: MousePointerClick, hint: 'All interactions' },
  { id: 'returning-visitors', label: 'Returning Visitors', value: null, icon: UserCheck, hint: 'Came back' },
  { id: 'avg-session', label: 'Avg. Session Duration', value: null, icon: Timer, hint: 'Per session' },
  { id: 'pages-tracked', label: 'Pages Tracked', value: null, icon: Layers, hint: 'Distinct pages' },
  { id: 'consent-accepted', label: 'Consent Accepted', value: null, icon: ShieldCheck, hint: 'Analytics allowed' },
  { id: 'last-activity', label: 'Last Activity', value: null, icon: Clock, hint: 'Most recent' },
];

/** Generic summary cards reused by every module/page analytics page. */
export const MODULE_SUMMARY_METRICS: AnalyticsMetric[] = [
  { id: 'views', label: 'Page Views', value: null, icon: Activity, hint: 'This period' },
  { id: 'visitors', label: 'Unique Visitors', value: null, icon: Users, hint: 'This period' },
  { id: 'avg-time', label: 'Avg. Time on Page', value: null, icon: Timer, hint: 'Engagement' },
  { id: 'interactions', label: 'Interactions', value: null, icon: MousePointerClick, hint: 'Clicks & more' },
];

/** KPI cards for the Visitors (audience) page. */
export const VISITOR_METRICS: AnalyticsMetric[] = [
  { id: 'total-visitors', label: 'Total Visitors', value: null, icon: Users, hint: 'All time' },
  { id: 'new-visitors', label: 'New Visitors', value: null, icon: UserPlus, hint: 'First visit' },
  { id: 'returning-visitors', label: 'Returning Visitors', value: null, icon: UserCheck, hint: 'Came back' },
  { id: 'countries', label: 'Countries', value: null, icon: Map, hint: 'Distinct' },
];

/** KPI cards for the Traffic (acquisition) page. */
export const TRAFFIC_METRICS: AnalyticsMetric[] = [
  { id: 'total-sessions', label: 'Total Sessions', value: null, icon: Activity, hint: 'All sessions' },
  { id: 'direct', label: 'Direct', value: null, icon: ArrowRightLeft, hint: 'No referrer' },
  { id: 'referral', label: 'Referral', value: null, icon: Share2, hint: 'From other sites' },
  { id: 'campaigns', label: 'Campaigns', value: null, icon: Megaphone, hint: 'UTM tagged' },
];

/** KPI cards for the Reports page (no report subsystem yet → zeros). */
export const REPORTS_METRICS: AnalyticsMetric[] = [
  { id: 'total-reports', label: 'Total Reports', value: null, icon: FileText, hint: 'Saved' },
  { id: 'scheduled-reports', label: 'Scheduled Reports', value: null, icon: Clock, hint: 'Automated' },
  { id: 'recent-exports', label: 'Recent Exports', value: null, icon: Download, hint: 'Last 30 days' },
  { id: 'last-export', label: 'Last Export', value: null, icon: Clock, hint: 'Most recent' },
];
