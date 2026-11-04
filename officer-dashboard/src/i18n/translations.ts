export type Language = 'en' | 'ta';

export interface TranslationDict {
  portalTitle: string;
  portalSubtitle: string;
  officerPortalBadge: string;
  languageName: string;
  selectLanguage: string;
  english: string;
  tamil: string;
  switchLanguage: string;
  backendConnected: string;
  roleOfficer: string;
  logout: string;
  needHelp: string;
  needHelpDesc: string;
  verifyingSessionTitle: string;
  verifyingSessionDesc: string;
  attentionNeeded: string;
  attentionCenterTitle: string;
  attentionCenterSubtitle: string;
  categoryAll: string;
  categoryCritical: string;
  categoryHigh: string;
  categoryFollowUp: string;
  categoryInsight: string;
  immediateAttentionNeeded: string;
  highPriorityActionRecommended: string;
  followUpRecommended: string;
  smartInsightBadge: string;
  reviewGrievance: string;
  reviewPendingCases: string;
  viewRelatedComplaints: string;
  dismiss: string;
  recommendedActionLabelShort: string;
  newImportantProblem: string;
  attentionRecommended: string;
  reviewNow: string;
  allCaughtUp: string;
  allCaughtUpDesc: string;
  possiblePatternDetected: string;
  patternSubtitle: string;
  inProgressCasesTitle: string;
  inProgressCasesDesc: string;
  submittedCasesTitle: string;
  submittedCasesDesc: string;
  loginTitle: string;
  loginSubtitle: string;
  officialEmailLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  signInBtn: string;
  authenticating: string;
  gatewayBadge: string;
  welcomeHeadline: string;
  welcomeSubheadline: string;
  welcomeTagline: string;
  welcomeDesc: string;
  benefit1Title: string;
  benefit1Desc: string;
  benefit2Title: string;
  benefit2Desc: string;
  benefit3Title: string;
  benefit3Desc: string;
  benefit4Title: string;
  benefit4Desc: string;
  motivationQuote: string;
  demoPersonasTitle: string;
  demoRajeshTitle: string;
  demoRajeshSubtitle: string;
  demoAnitaTitle: string;
  demoAnitaSubtitle: string;
  demoPriyaTitle: string;
  demoPriyaBadge: string;
  newOfficerSupportNotice: string;
  footerCopyright: string;
  supportHelpdesk: string;
  privacyPolicy: string;
  termsOfService: string;
  helpModalTitle: string;
  helpModalSubtitle: string;
  helpSection1Title: string;
  helpSection1Desc: string;
  helpSection2Title: string;
  helpSection2Desc: string;
  helpHelplineText: string;
  closeBtn: string;
  loginFailedError: string;
  slaAtRiskTitle: string;
  slaAtRiskSubtext: string;
  needsAttentionTitle: string;
  needsAttentionSubtext: string;
  communityImpactStatTitle: string;
  communityImpactStatSubtext: string;
  colLocation: string;
  colSLA: string;
  colUpdated: string;
  aiAssistedAssessment: string;
  aiAssistedDisclaimer: string;
  citizenTrackingNotice: string;
  recentActivityTitle: string;
  filterStandard: string;
  filterNew: string;
  slaHoursRemaining: string;
  slaDueIn: string;
  slaOverdue: string;
  slaUnavailable: string;
  whatHappenedQuestion: string;
  whereHappenedQuestion: string;
  citizenDetailsTitle: string;
  deptJurisdictionPrefix: string;
  dashboardQueueTitle: string;
  loggedInAsPrefix: string;
  dashboardSubtitle: string;
  errorLoadingGrievances: string;
  retryBtn: string;
  totalInQueue: string;
  totalInQueueSubtext: string;
  highAndCriticalPriority: string;
  highAndCriticalSubtext: string;
  inProgressTickets: string;
  inProgressSubtext: string;
  resolvedTickets: string;
  resolvedSubtext: string;
  filterArrow: string;
  searchPlaceholder: string;
  allJurisdictions: string;
  deptWater: string;
  deptRoads: string;
  deptElectricity: string;
  deptHealth: string;
  deptWaste: string;
  deptMunicipal: string;
  allPriorities: string;
  prioCritical: string;
  prioHigh: string;
  prioMedium: string;
  prioLow: string;
  statusAll: string;
  statusTriaged: string;
  statusInProgress: string;
  statusResolved: string;
  statusSubmitted: string;
  statusRejected: string;
  refreshBtn: string;
  refreshing: string;
  showingTicketsCount: string;
  colTrackingIdDate: string;
  colIssue: string;
  colDeptCategory: string;
  colPriorityUrgency: string;
  colStatus: string;
  colAction: string;
  reviewBtn: string;
  viewBtn: string;
  aiUrgencyLabel: string;
  noGrievancesTitle: string;
  noGrievancesDesc: string;
  fetchingGrievances: string;
  reloadTooltip: string;
  closeTooltip: string;
  fetchingDetailTitle: string;
  fetchingDetailSubtitle: string;
  failedDetailTitle: string;
  citizenComplainant: string;
  emailLabel: string;
  jurisdictionLabel: string;
  locationAndTimestamp: string;
  landmarkPrefix: string;
  lodgedPrefix: string;
  citizenGrievanceDescription: string;
  aiAnalysisTitle: string;
  aiUrgencyScore: string;
  assignedCategoryLabel: string;
  targetDepartmentLabel: string;
  priorityLevelLabel: string;
  executiveSummaryLabel: string;
  recommendedActionLabel: string;
  extractedEntitiesLabel: string;
  aiSourceFallback: string;
  aiSourceGemini: string;
  aiAnalysisSubtitle: string;
  officerActionTitle: string;
  currentStatusLabel: string;
  selectNextActionLabel: string;
  markInProgress: string;
  markResolved: string;
  markRejected: string;
  markTriaged: string;
  officerRemarksLabel: string;
  officerRemarksPlaceholder: string;
  quickInsertRemarksLabel: string;
  quickRemark1: string;
  quickRemark2: string;
  quickRemark3: string;
  quickRemark4: string;
  quickRemark5: string;
  quickRemark6: string;
  submitStatusBtn: string;
  recordingAction: string;
  statusUpdateSuccess: string;
  auditTrailTitle: string;
  recordsLogged: string;
  recordLogged: string;
  actionTakenBy: string;
  defaultEmptyRemarks: string;
  navQueue: string;
  navCivicImpact: string;
  impactDashboardTitle: string;
  impactDashboardSubtitle: string;
  totalActiveIssuesMetric: string;
  totalActiveIssuesDesc: string;
  highCommunityImpactMetric: string;
  highCommunityImpactDesc: string;
  criticalAttentionMetric: string;
  criticalAttentionDesc: string;
  recentlyResolvedMetric: string;
  recentlyResolvedDesc: string;
  attentionNeededHeader: string;
  attentionNeededSubheader: string;
  viewIssueBtn: string;
  reportedAgoPrefix: string;
  criticalUrgencyTag: string;
  highImpactTag: string;
  unresolvedDurationTag: string;
  officerAttentionRequired: string;
  allCommunityIssues: string;
  communityCountLabel: string;
  singleCitizenAffected: string;
  noCommunityConfirmations: string;
  citizensAffectedCount: string;
  citizenAffectedCount: string;
  civicResident: string;
  civicOSVerified: string;
  viewAndActionBtn: string;
  sortOfficerLabel: string;
  sortMostUrgent: string;
  sortHighImpact: string;
  sortNewest: string;
  sortOldestUnresolved: string;
  filterAllImpact: string;
  filterCriticalImpact: string;
  filterHighImpact: string;
  filterInProgressImpact: string;
  filterResolvedImpact: string;
  searchImpactPlaceholder: string;
  livingTimeline: string;
  stageCitizenReport: string;
  stageAITriage: string;
  stageOfficialUpdate: string;
  stagePublicResolution: string;
  resolutionStoryBanner: string;
  noImpactIssuesFound: string;
  noImpactIssuesFoundDesc: string;
  loadingImpactFeed: string;
  navOperations: string;
  navIntelligence: string;
  intelHeaderTitle: string;
  intelHeaderSubtitle: string;
  intelTotalActive: string;
  intelCriticalHigh: string;
  intelCommunityConfirmations: string;
  intelTopCategory: string;
  problemHotspotsTitle: string;
  problemHotspotsSubtitle: string;
  notEnoughLocationData: string;
  repeatedProblemsTitle: string;
  repeatedProblemsSubtitle: string;
  possibleRecurringIssue: string;
  reviewIssuesBtn: string;
  communityImpactSectionTitle: string;
  communityImpactSectionSubtitle: string;
  widespreadImpact: string;
  highImpact: string;
  moderateImpact: string;
  trendAnalysisTitle: string;
  notEnoughTrendData: string;
  categoryDistTitle: string;
  priorityDistTitle: string;
  departmentLoadTitle: string;
  predictiveSignalsTitle: string;
  predictiveSignalsSubtitle: string;
  whyThisMattersLabel: string;
  signalRecurringTitle: string;
  signalCommunityTitle: string;
  signalVolumeTitle: string;
  signalHotspotTitle: string;
  dateFilter24h: string;
  dateFilter7d: string;
  dateFilter30d: string;
  dateFilterAll: string;
  showingAvailableRecords: string;
  emptyIntelligenceTitle: string;
  emptyIntelligenceDesc: string;
  beforeAfterTitle: string;
  beforeAfterSubtitle: string;
  beforeLabel: string;
  afterLabel: string;
  beforeStep1: string;
  beforeStep2: string;
  beforeStep3: string;
  beforeStep4: string;
  afterStep1: string;
  afterStep2: string;
  afterStep3: string;
  afterStep4: string;
  outcomeMetricsTitle: string;
  resolvedComplaintsCount: string;
  resolutionRateLabel: string;
  highPriorityResolvedLabel: string;
  communityResolvedLabel: string;
  reopenedFollowupsLabel: string;
  meaningfulNoteRequired: string;
}

export const en: TranslationDict = {
  portalTitle: 'CivicOS',
  portalSubtitle: 'Unified Grievance & Operations Hub',
  officerPortalBadge: 'Officer Portal',
  languageName: 'ENGLISH',
  selectLanguage: 'SELECT LANGUAGE',
  english: 'ENGLISH',
  tamil: 'தமிழ்',
  switchLanguage: 'Switch Language',
  backendConnected: 'Backend Connected',
  roleOfficer: 'Officer',
  logout: 'Sign Out',
  needHelp: 'Need Help?',
  needHelpDesc: 'Get assistance with officer operations',
  verifyingSessionTitle: 'Verifying Officer Session',
  verifyingSessionDesc: 'Please wait while we connect to CivicOS Operations Hub...',
  attentionNeeded: 'Needs Attention',
  attentionCenterTitle: 'Attention Center',
  attentionCenterSubtitle: 'High-priority complaints and SLA alerts requiring operational action',
  categoryAll: 'All Issues',
  categoryCritical: 'Critical Urgency',
  categoryHigh: 'High Priority',
  categoryFollowUp: 'Needs Follow-up',
  categoryInsight: 'System Insights',
  immediateAttentionNeeded: 'Immediate Attention Needed',
  highPriorityActionRecommended: 'High-Priority Field Action Recommended',
  followUpRecommended: 'Follow-Up Recommended',
  smartInsightBadge: 'AI Signal',
  reviewGrievance: 'Review Grievance',
  reviewPendingCases: 'Review Pending Cases',
  viewRelatedComplaints: 'View Related Complaints',
  dismiss: 'Dismiss',
  recommendedActionLabelShort: 'Recommended Action',
  newImportantProblem: 'New Important Problem',
  attentionRecommended: 'Attention Recommended',
  reviewNow: 'Review Now',
  allCaughtUp: 'All Caught Up',
  allCaughtUpDesc: 'No high-priority alerts or SLA breaches currently pending for your department.',
  possiblePatternDetected: 'Possible Pattern Detected',
  patternSubtitle: 'Multiple similar issues reported in this vicinity.',
  inProgressCasesTitle: 'In Progress Complaints',
  inProgressCasesDesc: 'Complaints currently being handled by field teams.',
  submittedCasesTitle: 'New Complaints',
  submittedCasesDesc: 'Complaints awaiting triage and field dispatch.',
  loginTitle: 'Officer Portal Login',
  loginSubtitle: 'CivicOS Municipal & Department Operations Hub',
  officialEmailLabel: 'Official Email',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  signInBtn: 'Sign In to Operations',
  authenticating: 'Verifying Credentials...',
  gatewayBadge: 'Prototype Operations Gateway',
  welcomeHeadline: 'Empowering Public Servants with',
  welcomeSubheadline: 'Intelligent Municipal Operations',
  welcomeTagline: 'Resolve citizen issues faster with AI-assisted triage and automated workflow orchestration.',
  welcomeDesc: 'CivicOS centralizes citizen grievances across municipal departments, automates SLA tracking, and delivers predictive civic intelligence to frontline teams.',
  benefit1Title: 'Intelligent Triage',
  benefit1Desc: 'Automated categorization and department routing powered by AI.',
  benefit2Title: 'SLA Engine',
  benefit2Desc: 'Real-time countdowns ensure zero neglected citizen complaints.',
  benefit3Title: 'Predictive Signals',
  benefit3Desc: 'Detect problem hotspots and recurring patterns early.',
  benefit4Title: 'Closed Civic Loop',
  benefit4Desc: 'Keep citizens updated and verify on-ground resolution outcomes.',
  motivationQuote: 'CivicOS empowers field officers to turn citizen reports into swift, accountable government action.',
  demoPersonasTitle: 'Quick Fill Demo Credentials',
  demoRajeshTitle: 'Officer Rajesh Kumar',
  demoRajeshSubtitle: 'Water Supply & Sanitation',
  demoAnitaTitle: 'Officer Anita Sharma',
  demoAnitaSubtitle: 'Public Works (Roads & Infrastructure)',
  demoPriyaTitle: 'Priya Sharma (Citizen Account - Should Fail)',
  demoPriyaBadge: 'Citizen - No Access',
  newOfficerSupportNotice: 'Need access or account reset? Contact your Municipal Admin.',
  footerCopyright: 'Government of India • Digital Public Infrastructure',
  supportHelpdesk: 'Operations Helpdesk',
  privacyPolicy: 'Privacy Policy',
  termsOfService: 'Terms of Service',
  helpModalTitle: 'Officer Support & Guidelines',
  helpModalSubtitle: 'CivicOS Department Operations Assistance',
  helpSection1Title: 'Handling Grievances & SLAs',
  helpSection1Desc: 'Ensure complaints nearing SLA breach are investigated and dispatched promptly. Meaningful field action notes are required for status updates.',
  helpSection2Title: 'Closing the Feedback Loop',
  helpSection2Desc: 'When resolving a ticket, provide detailed resolution notes. Citizens receive an instant notification to verify the resolution.',
  helpHelplineText: 'Technical Support Helpline: 1800-CIVICOS (24x7 Operations Room)',
  closeBtn: 'Close',
  loginFailedError: 'Invalid email or password. Please check your credentials.',
  slaAtRiskTitle: 'SLA At Risk',
  slaAtRiskSubtext: 'Complaints nearing response deadline',
  needsAttentionTitle: 'Needs Attention',
  needsAttentionSubtext: 'High-priority unhandled complaints',
  communityImpactStatTitle: 'Community Impact',
  communityImpactStatSubtext: 'Confirmed by multiple citizens',
  colLocation: 'Location',
  colSLA: 'SLA / Timeline',
  colUpdated: 'Updated',
  aiAssistedAssessment: 'AI-Assisted Assessment',
  aiAssistedDisclaimer: 'AI assists with categorization and priority assessment. Final operational decisions remain with the officer.',
  citizenTrackingNotice: 'Updating the status will allow the citizen to track progress in real-time.',
  recentActivityTitle: 'Recent Operational Activity',
  filterStandard: 'Standard',
  filterNew: 'New',
  slaHoursRemaining: 'remaining',
  slaDueIn: 'Due in',
  slaOverdue: 'Overdue by',
  slaUnavailable: 'SLA unavailable',
  whatHappenedQuestion: 'What happened?',
  whereHappenedQuestion: 'Where did it happen?',
  citizenDetailsTitle: 'Citizen Information',
  deptJurisdictionPrefix: 'Jurisdiction:',
  dashboardQueueTitle: 'Operational Grievances Queue',
  loggedInAsPrefix: 'Logged in as',
  dashboardSubtitle: 'Track, investigate, and resolve citizen grievances with SLA compliance.',
  errorLoadingGrievances: 'Unable to load grievance queue',
  retryBtn: 'Retry',
  totalInQueue: 'Total in Queue',
  totalInQueueSubtext: 'All active complaints',
  highAndCriticalPriority: 'High & Critical',
  highAndCriticalSubtext: 'Immediate priority',
  inProgressTickets: 'In Progress',
  inProgressSubtext: 'Field teams active',
  resolvedTickets: 'Resolved Tickets',
  resolvedSubtext: 'Successfully closed',
  filterArrow: 'Filter',
  searchPlaceholder: 'Search by issue, reference number, or location...',
  allJurisdictions: 'All Departments',
  deptWater: 'Water & Sanitation',
  deptRoads: 'Public Works (Roads)',
  deptElectricity: 'Electricity Board',
  deptHealth: 'Public Health',
  deptWaste: 'Waste Management',
  deptMunicipal: 'Municipal Administration',
  allPriorities: 'All Priorities',
  prioCritical: 'Critical',
  prioHigh: 'High',
  prioMedium: 'Medium',
  prioLow: 'Low',
  statusAll: 'All Statuses',
  statusTriaged: 'AI Triaged',
  statusInProgress: 'In Progress',
  statusResolved: 'Resolved',
  statusSubmitted: 'Submitted',
  statusRejected: 'Rejected',
  refreshBtn: 'Refresh',
  refreshing: 'Refreshing...',
  showingTicketsCount: 'Showing complaints',
  colTrackingIdDate: 'Reference & Date',
  colIssue: 'Issue & Description',
  colDeptCategory: 'Department & Category',
  colPriorityUrgency: 'Priority / Urgency',
  colStatus: 'Status',
  colAction: 'Action',
  reviewBtn: 'Review',
  viewBtn: 'View',
  aiUrgencyLabel: 'AI Urgency',
  noGrievancesTitle: 'No Complaints Found',
  noGrievancesDesc: 'No citizen complaints match the selected filter criteria.',
  fetchingGrievances: 'Loading Complaints...',
  reloadTooltip: 'Reload data',
  closeTooltip: 'Close',
  fetchingDetailTitle: 'Loading Grievance Details...',
  fetchingDetailSubtitle: 'Fetching real-time data from CivicOS API...',
  failedDetailTitle: 'Failed to load details',
  citizenComplainant: 'Complainant Citizen',
  emailLabel: 'Email',
  jurisdictionLabel: 'Department Jurisdiction',
  locationAndTimestamp: 'Location & Time',
  landmarkPrefix: 'Near',
  lodgedPrefix: 'Reported on',
  citizenGrievanceDescription: 'Citizen Grievance Description',
  aiAnalysisTitle: 'AI Assessment & Triage',
  aiUrgencyScore: 'AI Urgency Score',
  assignedCategoryLabel: 'Assigned Category',
  targetDepartmentLabel: 'Target Department',
  priorityLevelLabel: 'Priority Level',
  executiveSummaryLabel: 'Executive Summary',
  recommendedActionLabel: 'Recommended Operational Action',
  extractedEntitiesLabel: 'Extracted Problem Entities',
  aiSourceFallback: 'Deterministic Rule Engine',
  aiSourceGemini: 'Gemini 1.5 Flash Triage',
  aiAnalysisSubtitle: 'Automated severity analysis and department routing.',
  officerActionTitle: 'Officer Field Action & Status Update',
  currentStatusLabel: 'Current Status',
  selectNextActionLabel: 'Select Next Operational Action',
  markInProgress: 'Dispatch Team (In Progress)',
  markResolved: 'Mark as Resolved (Close Ticket)',
  markRejected: 'Reject Grievance (Out of Scope)',
  markTriaged: 'Re-Triage Grievance',
  officerRemarksLabel: 'Action / Resolution Remarks (Required)',
  officerRemarksPlaceholder: 'Enter detailed notes on field actions taken, dispatched crews, or resolution evidence...',
  quickInsertRemarksLabel: 'Quick Insert Operational Notes',
  quickRemark1: 'Field inspection team dispatched to site.',
  quickRemark2: 'Excavation and pipeline repair actively underway.',
  quickRemark3: 'Blockage cleared and normal operations restored.',
  quickRemark4: 'Road resurfacing and patch work completed.',
  quickRemark5: 'Transformer fuse replaced and power grid restored.',
  quickRemark6: 'Site re-inspected and verified as fully resolved.',
  submitStatusBtn: 'Update Grievance Status',
  recordingAction: 'Recording Action...',
  statusUpdateSuccess: 'Status updated successfully!',
  auditTrailTitle: 'Operational Audit Trail',
  recordsLogged: 'Action Records Logged',
  recordLogged: 'Action Record Logged',
  actionTakenBy: 'Action Taken By',
  defaultEmptyRemarks: 'Status update logged without additional remarks.',
  navQueue: 'Work Queue',
  navCivicImpact: 'Civic Impact',
  impactDashboardTitle: 'Civic Impact Operations Feed',
  impactDashboardSubtitle: 'Track community-verified civic complaints, multi-citizen confirmations, and public resolution updates in real time.',
  totalActiveIssuesMetric: 'Active Issues',
  totalActiveIssuesDesc: 'Unresolved complaints in queue',
  highCommunityImpactMetric: 'Community Impact',
  highCommunityImpactDesc: 'Confirmed by multiple citizens',
  criticalAttentionMetric: 'Critical Urgency',
  criticalAttentionDesc: 'Requires immediate dispatch',
  recentlyResolvedMetric: 'Resolved',
  recentlyResolvedDesc: 'Closed with verified solutions',
  attentionNeededHeader: 'Needs Your Attention',
  attentionNeededSubheader: 'Priority complaints approaching response deadlines or impacting large resident groups.',
  viewIssueBtn: 'View Details',
  reportedAgoPrefix: 'Reported',
  criticalUrgencyTag: 'Critical Urgency',
  highImpactTag: 'High Community Impact',
  unresolvedDurationTag: 'Active Unresolved',
  officerAttentionRequired: 'Officer Attention Required',
  allCommunityIssues: 'All Community Issues',
  communityCountLabel: 'Community Impact',
  singleCitizenAffected: 'Resident reported this problem',
  noCommunityConfirmations: 'No additional confirmations yet',
  citizensAffectedCount: 'residents confirmed this problem',
  citizenAffectedCount: 'resident confirmed this problem',
  civicResident: 'Resident',
  civicOSVerified: 'Demo record',
  viewAndActionBtn: 'View & Take Action',
  sortOfficerLabel: 'Sort by:',
  sortMostUrgent: 'Most Urgent',
  sortHighImpact: 'Highest Impact',
  sortNewest: 'Newest Reports',
  sortOldestUnresolved: 'Oldest Unresolved',
  filterAllImpact: 'All Issues',
  filterCriticalImpact: 'Critical Priority',
  filterHighImpact: 'High Community Impact',
  filterInProgressImpact: 'In Progress',
  filterResolvedImpact: 'Resolved',
  searchImpactPlaceholder: 'Search civic impact feed by keyword, ID, or location...',
  livingTimeline: 'Operational Living Timeline',
  stageCitizenReport: 'Citizen Report Lodged',
  stageAITriage: 'AI Triage & Department Routing',
  stageOfficialUpdate: 'Field Action Dispatched',
  stagePublicResolution: 'Verified Resolution',
  resolutionStoryBanner: 'RESOLUTION UPDATE',
  noImpactIssuesFound: 'No Issues Found',
  noImpactIssuesFoundDesc: 'No civic complaints match the current search or filter criteria.',
  loadingImpactFeed: 'Loading Civic Impact Feed...',
  navOperations: 'Operations',
  navIntelligence: 'Civic Intelligence',
  intelHeaderTitle: 'Civic Intelligence',
  intelHeaderSubtitle: 'Understand where citizen issues are increasing and where attention may be needed.',
  intelTotalActive: 'Total Active Issues',
  intelCriticalHigh: 'High / Critical Issues',
  intelCommunityConfirmations: 'Community Confirmations',
  intelTopCategory: 'Top Issue Category',
  problemHotspotsTitle: 'Problem Hotspots',
  problemHotspotsSubtitle: 'Geographical clusters with recurring complaints',
  notEnoughLocationData: 'Not enough location data to identify hotspots yet.',
  repeatedProblemsTitle: 'Repeated Problems',
  repeatedProblemsSubtitle: 'Detected clusters sharing similar categories and locations',
  possibleRecurringIssue: 'Possible recurring issue',
  reviewIssuesBtn: 'Review Issues',
  communityImpactSectionTitle: 'Community Impact Intelligence',
  communityImpactSectionSubtitle: 'Issues verified and reinforced by multiple citizens',
  widespreadImpact: 'Widespread community impact',
  highImpact: 'High community impact',
  moderateImpact: 'Confirmed by citizens',
  trendAnalysisTitle: 'Complaint Trend Signals',
  notEnoughTrendData: 'Not enough data for a reliable trend.',
  categoryDistTitle: 'Category Distribution',
  priorityDistTitle: 'Priority Distribution',
  departmentLoadTitle: 'Department Workload',
  predictiveSignalsTitle: 'Predictive Signals & Pattern Engine',
  predictiveSignalsSubtitle: 'Transparent deterministic signals flagging emerging civic patterns',
  whyThisMattersLabel: 'Why this matters',
  signalRecurringTitle: 'Recurring Issue Signal',
  signalCommunityTitle: 'Community Escalation Signal',
  signalVolumeTitle: 'Rising Complaint Volume Signal',
  signalHotspotTitle: 'Priority Hotspot Concentration',
  dateFilter24h: 'Last 24 hours',
  dateFilter7d: 'Last 7 days',
  dateFilter30d: 'Last 30 days',
  dateFilterAll: 'All available',
  showingAvailableRecords: 'Showing available records',
  emptyIntelligenceTitle: 'Not enough data yet',
  emptyIntelligenceDesc: 'More citizen reports will help CivicOS identify patterns and recurring hotspots.',
  beforeAfterTitle: 'Workflow Transformation: Traditional vs. CivicOS',
  beforeAfterSubtitle: 'How CivicOS eliminates operational silos and closes the civic action loop',
  beforeLabel: 'Traditional Process (Siloed)',
  afterLabel: 'With CivicOS (Intelligent Closed-Loop)',
  beforeStep1: 'Separate department portals & confusion',
  beforeStep2: 'Manual, slow routing between offices',
  beforeStep3: 'Black box for citizen with zero real-time visibility',
  beforeStep4: 'Disconnected resolution with no community verification',
  afterStep1: 'One Unified Service-First Portal for all needs',
  afterStep2: 'Instant AI-assisted triage & automated n8n routing',
  afterStep3: 'Actionable officer operations with SLA countdowns',
  afterStep4: 'Real-time citizen updates & verified community feedback',
  outcomeMetricsTitle: 'Civic Action & Resolution Outcomes',
  resolvedComplaintsCount: 'Total Resolved Issues',
  resolutionRateLabel: 'Resolution Rate',
  highPriorityResolvedLabel: 'High / Critical Resolved',
  communityResolvedLabel: 'Community-Confirmed Resolved',
  reopenedFollowupsLabel: 'Citizen Follow-ups / Re-opened',
  meaningfulNoteRequired: 'Please enter a descriptive resolution or action note (minimum 10 characters).',
};

export const ta: TranslationDict = {
  portalTitle: 'CivicOS',
  portalSubtitle: 'ஒருங்கிணைந்த குறைதீர்ப்பு & செயல்பாட்டு மையம்',
  officerPortalBadge: 'அதிகாரிகள் தளம்',
  languageName: 'தமிழ்',
  selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
  english: 'ENGLISH',
  tamil: 'தமிழ்',
  switchLanguage: 'மொழியை மாற்றவும்',
  backendConnected: 'பின்னணி சேவை இணைக்கப்பட்டுள்ளது',
  roleOfficer: 'அதிகாரி',
  logout: 'வெளியேறு',
  needHelp: 'உதவி தேவையா?',
  needHelpDesc: 'அலுவலர் செயல்பாடுகள் குறித்து உதவி பெறுக',
  verifyingSessionTitle: 'அலுவலர் அமர்வு சரிபார்க்கப்படுகிறது',
  verifyingSessionDesc: 'CivicOS கட்டுப்பாட்டு மையத்துடன் இணைக்கும் வரை காத்திருக்கவும்...',
  attentionNeeded: 'கவனம் தேவைப்படுபவை',
  attentionCenterTitle: 'கவன மையம்',
  attentionCenterSubtitle: 'உடனடி நடவடிக்கை தேவைப்படும் அவசர புகார்கள் மற்றும் காலக்கெடு எச்சரிக்கைகள்',
  categoryAll: 'அனைத்து புகார்கள்',
  categoryCritical: 'அவசர முன்னுரிமை',
  categoryHigh: 'அதிக முன்னுரிமை',
  categoryFollowUp: 'பின்தொடர்தல் தேவை',
  categoryInsight: 'கணினி நுண்ணறிவு',
  immediateAttentionNeeded: 'உடனடி கவனம் தேவை',
  highPriorityActionRecommended: 'உயர் முன்னுரிமை கள நடவடிக்கை பரிந்துரைக்கப்படுகிறது',
  followUpRecommended: 'பின்தொடர்தல் பரிந்துரைக்கப்படுகிறது',
  smartInsightBadge: 'AI சமிக்ஞை',
  reviewGrievance: 'புகாரை ஆய்வு செய்க',
  reviewPendingCases: 'நிலுவையில் உள்ள வழக்குகளை ஆய்வு செய்க',
  viewRelatedComplaints: 'தொடர்புடைய புகார்களைக் காண்க',
  dismiss: 'நீக்கு',
  recommendedActionLabelShort: 'பரிந்துரைக்கப்பட்ட நடவடிக்கை',
  newImportantProblem: 'புதிய முக்கியமான பிரச்சனை',
  attentionRecommended: 'கவனம் பரிந்துரைக்கப்படுகிறது',
  reviewNow: 'இப்போதே ஆய்வு செய்க',
  allCaughtUp: 'அனைத்தும் சீராக உள்ளது',
  allCaughtUpDesc: 'உங்கள் துறைக்கு தற்போது நிலுவையில் உள்ள அவசர எச்சரிக்கைகள் அல்லது காலக்கெடு மீறல்கள் எதுவும் இல்லை.',
  possiblePatternDetected: 'சாத்தியமான பொதுவான முறை கண்டறியப்பட்டது',
  patternSubtitle: 'இப்பகுதியில் பல ஒத்த புகார்கள் பதிவாகியுள்ளன.',
  inProgressCasesTitle: 'செயல்பாட்டில் உள்ள புகார்கள்',
  inProgressCasesDesc: 'களப்பணியாளர்களால் கையாளப்பட்டு வரும் புகார்கள்.',
  submittedCasesTitle: 'புதிய புகார்கள்',
  submittedCasesDesc: 'வகைப்பாடு மற்றும் கள ஒதுக்கீட்டிற்காக காத்திருக்கும் புகார்கள்.',
  loginTitle: 'அலுவலர் உள்நுழைவு',
  loginSubtitle: 'CivicOS நகராட்சி & துறைசார் கட்டுப்பாட்டு மையம்',
  officialEmailLabel: 'அலுவல் மின்னஞ்சல்',
  passwordLabel: 'கடவுச்சொல்',
  passwordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
  showPassword: 'கடவுச்சொல்லைக் காட்டு',
  hidePassword: 'கடவுச்சொல்லை மறை',
  signInBtn: 'உள்நுழைக',
  authenticating: 'சரிபார்க்கப்படுகிறது...',
  gatewayBadge: 'அதிகாரப்பூர்வ அரசு கட்டுப்பாட்டு தளம்',
  welcomeHeadline: 'அரசு அதிகாரிகளுக்கு ஆற்றல் அளிக்கும்',
  welcomeSubheadline: 'புத்திசாலி நகராட்சி செயல்பாடுகள்',
  welcomeTagline: 'AI வகைப்பாடு மற்றும் தானியங்கி பணிப்பாய்வு மூலம் குடிமக்கள் பிரச்சனைகளை விரைவாக தீர்க்கவும்.',
  welcomeDesc: 'CivicOS அனைத்து அரசுத் துறைகளின் குடிமக்கள் புகார்களை ஒருங்கிணைத்து, SLA காலக்கெடுவை கண்காணித்து, களப்பணியாளர்களுக்கு முன்கணிப்பு நுண்ணறிவை வழங்குகிறது.',
  benefit1Title: 'துல்லியமான வகைப்பாடு',
  benefit1Desc: 'AI மூலம் தானியங்கி வகைப்பாடு மற்றும் துறைசார் ஒதுக்கீடு.',
  benefit2Title: 'SLA காலக்கெடு கண்காணிப்பு',
  benefit2Desc: 'நேரலை காலக்கெடு மூலம் எந்தவொரு புகாரும் புறக்கணிக்கப்படாமல் தடுக்கப்படுகிறது.',
  benefit3Title: 'முன்கணிப்பு சமிக்ஞைகள்',
  benefit3Desc: 'பிரச்சினை அதிகம் உள்ள பகுதிகள் மற்றும் தொடர் மாதிரிகளை முன்கூட்டியே கண்டறியுங்கள்.',
  benefit4Title: 'முழுமையான தீர்வு வளையம்',
  benefit4Desc: 'குடிமக்களுக்கு நேரலை தகவல் அளித்து களத்தீர்வை உறுதிப்படுத்துங்கள்.',
  motivationQuote: 'குடிமக்கள் புகார்களை விரைவான, பொறுப்பான அரசு நடவடிக்கையாக மாற்ற CivicOS உதவுகிறது.',
  demoPersonasTitle: 'டெமோ நற்சான்றிதழ்கள்',
  demoRajeshTitle: 'அலுவலர் ராஜேஷ் குமார்',
  demoRajeshSubtitle: 'குடிநீர் வழங்கல் மற்றும் சுகாதாரம்',
  demoAnitaTitle: 'அலுவலர் அனிதா சர்மா',
  demoAnitaSubtitle: 'பொதுப்பணித்துறை (சாலைகள் & கட்டமைப்பு)',
  demoPriyaTitle: 'பிரியா சர்மா (குடிமக்கள் கணக்கு - அணுகல் மறுக்கப்பட வேண்டும்)',
  demoPriyaBadge: 'குடிமகன் - அணுகல் இல்லை',
  newOfficerSupportNotice: 'அணுகல் அல்லது கடவுச்சொல் மீட்டமைக்க உங்கள் நகராட்சி நிர்வாகியைத் தொடர்பு கொள்ளவும்.',
  footerCopyright: 'இந்திய அரசு • டிஜிட்டல் பொதுக் கட்டமைப்பு',
  supportHelpdesk: 'உதவி மையம்',
  privacyPolicy: 'தனியுரிமைக் கொள்கை',
  termsOfService: 'சேவை விதிமுறைகள்',
  helpModalTitle: 'அலுவலர் ஆதரவு & வழிகாட்டுதல்கள்',
  helpModalSubtitle: 'CivicOS துறைசார் செயல்பாட்டு உதவி',
  helpSection1Title: 'புகார்களைக் கையாளுதல் & SLA',
  helpSection1Desc: 'SLA காலக்கெடுவை நெருங்கும் புகார்களை உடனடியாக கள ஆய்வுக்கு அனுப்பவும். நிலை மாற்றத்திற்கு விளக்கமான களக் குறிப்பு கட்டாயமாகும்.',
  helpSection2Title: 'தீர்வு வளையத்தை நிறைவு செய்தல்',
  helpSection2Desc: 'புகாரை முடிக்கும் போது விரிவான தீர்வுக் குறிப்பை அளிக்கவும். தீர்வை உறுதிப்படுத்த குடிமகனுக்கு உடனடி அறிவிப்பு அனுப்பப்படும்.',
  helpHelplineText: 'தொழில்நுட்ப உதவி எண்: 1800-CIVICOS (24x7 கட்டுப்பாட்டு அறை)',
  closeBtn: 'மூடு',
  loginFailedError: 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். உங்கள் நற்சான்றிதழ்களைச் சரிபார்க்கவும்.',
  slaAtRiskTitle: 'SLA காலக்கெடு அபாயம்',
  slaAtRiskSubtext: 'காலக்கெடுவை நெருங்கும் புகார்கள்',
  needsAttentionTitle: 'கவனம் தேவைப்படுபவை',
  needsAttentionSubtext: 'உயர் முன்னுரிமை புதிய புகார்கள்',
  communityImpactStatTitle: 'சமூக தாக்கம்',
  communityImpactStatSubtext: 'பல குடிமக்களால் உறுதி செய்யப்பட்டது',
  colLocation: 'இடம்',
  colSLA: 'SLA / காலக்கெடு',
  colUpdated: 'புதுப்பிக்கப்பட்டது',
  aiAssistedAssessment: 'AI வழிகாட்டுதல் மதிப்பீடு',
  aiAssistedDisclaimer: 'AI வகைப்பாடு மற்றும் முன்னுரிமை மதிப்பீட்டிற்கு மட்டுமே உதவுகிறது. இறுதி கள நடவடிக்கை அதிகாரியின் பொறுப்பாகும்.',
  citizenTrackingNotice: 'நிலையை புதுப்பிப்பதன் மூலம் குடிமகன் தனது புகாரின் முன்னேற்றத்தை நேரடியாக கண்காணிக்க முடியும்.',
  recentActivityTitle: 'சமீபத்திய கள நடவடிக்கைகள்',
  filterStandard: 'வழக்கமானவை',
  filterNew: 'புதியவை',
  slaHoursRemaining: 'மீதமுள்ளது',
  slaDueIn: 'கால அவகாசம்',
  slaOverdue: 'காலதாமதம்',
  slaUnavailable: 'SLA தகவல் இல்லை',
  whatHappenedQuestion: 'என்ன நடந்தது?',
  whereHappenedQuestion: 'எங்கு நடந்தது?',
  citizenDetailsTitle: 'புகாரளித்த குடிமகன் விவரம்',
  deptJurisdictionPrefix: 'அதிகார வரம்பு:',
  dashboardQueueTitle: 'களப் புகார்கள் பணி வரிசை',
  loggedInAsPrefix: 'உள்நுழைந்துள்ள அலுவலர்:',
  dashboardSubtitle: 'குடிமக்கள் புகார்களைக் கண்காணித்து, காலக்கெடுவுக்குள் தீர்வு காணுங்கள்.',
  errorLoadingGrievances: 'புகார்கள் பட்டியலை ஏற்றுவதில் சிக்கல்',
  retryBtn: 'மீண்டும் முயற்சி செய்க',
  totalInQueue: 'மொத்த புகார்கள்',
  totalInQueueSubtext: 'அனைத்து தீவிர புகார்கள்',
  highAndCriticalPriority: 'உயர் & அவசர முன்னுரிமை',
  highAndCriticalSubtext: 'உடனடி முன்னுரிமை',
  inProgressTickets: 'செயல்பாட்டில் உள்ளவை',
  inProgressSubtext: 'களப்பணியாளர்கள் செயல்படுகின்றனர்',
  resolvedTickets: 'தீர்க்கப்பட்டவை',
  resolvedSubtext: 'வெற்றிகரமாக முடிக்கப்பட்டது',
  filterArrow: 'வடிகட்டு',
  searchPlaceholder: 'புகார் எண், பிரச்சனை அல்லது இருப்பிடம் மூலம் தேடுக...',
  allJurisdictions: 'அனைத்து துறைகளும்',
  deptWater: 'நீர் மற்றும் சுகாதாரம்',
  deptRoads: 'பொதுப்பணித்துறை (சாலைகள்)',
  deptElectricity: 'மின்சார வாரியம்',
  deptHealth: 'பொது சுகாதாரம்',
  deptWaste: 'கழிவு மேலாண்மை',
  deptMunicipal: 'நகராட்சி நிர்வாகம்',
  allPriorities: 'அனைத்து முன்னுரிமைகளும்',
  prioCritical: 'அவசர முன்னுரிமை',
  prioHigh: 'அதிக முன்னுரிமை',
  prioMedium: 'நடுத்தர முன்னுரிமை',
  prioLow: 'குறைந்த முன்னுரிமை',
  statusAll: 'அனைத்து நிலைகளும்',
  statusTriaged: 'AI வகைப்படுத்தப்பட்டது',
  statusInProgress: 'செயல்பாட்டில் உள்ளது',
  statusResolved: 'தீர்க்கப்பட்டது',
  statusSubmitted: 'சமர்ப்பிக்கப்பட்டது',
  statusRejected: 'நிராகரிக்கப்பட்டது',
  refreshBtn: 'புதுப்பி',
  refreshing: 'புதுப்பிக்கப்படுகிறது...',
  showingTicketsCount: 'புகார்கள் காட்டப்படுகின்றன',
  colTrackingIdDate: 'புகார் எண் & தேதி',
  colIssue: 'பிரச்சனை & விவரம்',
  colDeptCategory: 'துறை & பிரிவு',
  colPriorityUrgency: 'முன்னுரிமை / அவசரம்',
  colStatus: 'நிலை',
  colAction: 'நடவடிக்கை',
  reviewBtn: 'ஆய்வு செய்க',
  viewBtn: 'பார்வையிடு',
  aiUrgencyLabel: 'AI அவசர நிலை',
  noGrievancesTitle: 'புகார்கள் எதுவும் கிடைக்கவில்லை',
  noGrievancesDesc: 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிக்கு ஏற்ற புகார்கள் எதுவும் இல்லை.',
  fetchingGrievances: 'புகார்கள் ஏற்றப்படுகின்றன...',
  reloadTooltip: 'தரவை மீண்டும் ஏற்று',
  closeTooltip: 'மூடு',
  fetchingDetailTitle: 'புகார் விவரங்கள் ஏற்றப்படுகின்றன...',
  fetchingDetailSubtitle: 'CivicOS தளத்திலிருந்து நேரலைத் தரவு பெறப்படுகிறது...',
  failedDetailTitle: 'விவரங்களை ஏற்றுவதில் தோல்வி',
  citizenComplainant: 'புகாரளித்த குடிமகன்',
  emailLabel: 'மின்னஞ்சல்',
  jurisdictionLabel: 'துறை அதிகார வரம்பு',
  locationAndTimestamp: 'இடம் & நேரம்',
  landmarkPrefix: 'அருகில்',
  lodgedPrefix: 'பதிவு செய்யப்பட்ட தேதி',
  citizenGrievanceDescription: 'குடிமகன் அளித்த புகார் விவரம்',
  aiAnalysisTitle: 'AI மதிப்பீடு & வகைப்பாடு',
  aiUrgencyScore: 'AI அவசர மதிப்பீடு',
  assignedCategoryLabel: 'ஒதுக்கப்பட்ட பிரிவு',
  targetDepartmentLabel: 'ஒதுக்கப்பட்ட துறை',
  priorityLevelLabel: 'முன்னுரிமை நிலை',
  executiveSummaryLabel: 'சுருக்கம்',
  recommendedActionLabel: 'பரிந்துரைக்கப்பட்ட கள நடவடிக்கை',
  extractedEntitiesLabel: 'கண்டறியப்பட்ட முக்கிய கூறுகள்',
  aiSourceFallback: 'விதிமுறை அடிப்படையிலான மதிப்பீடு',
  aiSourceGemini: 'Gemini 1.5 Flash வகைப்பாடு',
  aiAnalysisSubtitle: 'தானியங்கி தீவிரத்தன்மை மதிப்பீடு மற்றும் துறைசார் ஒதுக்கீடு.',
  officerActionTitle: 'அலுவலர் கள நடவடிக்கை & நிலை மாற்றம்',
  currentStatusLabel: 'தற்போதைய நிலை',
  selectNextActionLabel: 'அடுத்த கள நடவடிக்கையைத் தேர்வு செய்க',
  markInProgress: 'களப்பணியாளர்களை அனுப்பு (செயல்பாட்டில்)',
  markResolved: 'தீர்க்கப்பட்டதாகப் பதிவு செய் (முடிக்கப்பட்டது)',
  markRejected: 'நிராகரி (அதிகார வரம்பிற்கு அப்பாற்பட்டது)',
  markTriaged: 'மீண்டும் வகைப்படுத்து',
  officerRemarksLabel: 'நடவடிக்கை / தீர்வுக் குறிப்பு (கட்டாயமானது)',
  officerRemarksPlaceholder: 'எடுக்கப்பட்ட கள நடவடிக்கைகள், அனுப்பப்பட்ட பணியாளர்கள் அல்லது தீர்வுக்கான ஆதாரங்களை உள்ளிடவும்...',
  quickInsertRemarksLabel: 'விரைவு குறிப்புகள்',
  quickRemark1: 'கள ஆய்வுக் குழு சம்பவ இடத்திற்கு அனுப்பப்பட்டுள்ளது.',
  quickRemark2: 'குழாய் பழுதுநீக்கும் பணிகள் தீவிரமாக நடைபெற்று வருகின்றன.',
  quickRemark3: 'அடைப்பு நீக்கப்பட்டு இயல்பு நிலை திரும்பியது.',
  quickRemark4: 'சாலை தார் போடும் பணி வெற்றிகரமாக முடிக்கப்பட்டது.',
  quickRemark5: 'மின்மாற்றி பியூஸ் மாற்றப்பட்டு மின் விநியோகம் சீரானது.',
  quickRemark6: 'களத்தில் மீண்டும் ஆய்வு செய்யப்பட்டு முழுமையாகத் தீர்க்கப்பட்டது.',
  submitStatusBtn: 'புகார் நிலையைப் புதுப்பி',
  recordingAction: 'பதிவு செய்யப்படுகிறது...',
  statusUpdateSuccess: 'நிலை வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது!',
  auditTrailTitle: 'நடவடிக்கை வரலாற்றுப் பதிவு',
  recordsLogged: 'பதிவுகள்',
  recordLogged: 'பதிவு',
  actionTakenBy: 'நடவடிக்கை எடுத்தவர்',
  defaultEmptyRemarks: 'கூடுதல் குறிப்புகள் இன்றி நிலை மாற்றம் பதிவு செய்யப்பட்டுள்ளது.',
  navQueue: 'பணி வரிசை',
  navCivicImpact: 'சமூக தாக்கம்',
  impactDashboardTitle: 'சமூக தாக்கக் கட்டுப்பாட்டு மையம்',
  impactDashboardSubtitle: 'குடிமக்களால் உறுதிப்படுத்தப்பட்ட பொதுப் பிரச்சனைகள் மற்றும் நேரலைத் தீர்வு விவரங்களைக் கண்காணிக்கவும்.',
  totalActiveIssuesMetric: 'தீவிர புகார்கள்',
  totalActiveIssuesDesc: 'நிலுவையில் உள்ள புகார்கள்',
  highCommunityImpactMetric: 'சமூக தாக்கம்',
  highCommunityImpactDesc: 'பல குடிமக்களால் உறுதி செய்யப்பட்டது',
  criticalAttentionMetric: 'அவசர முன்னுரிமை',
  criticalAttentionDesc: 'உடனடி கள நடவடிக்கை தேவை',
  recentlyResolvedMetric: 'தீர்க்கப்பட்டவை',
  recentlyResolvedDesc: 'வெற்றிகரமாக முடிக்கப்பட்டவை',
  attentionNeededHeader: 'கவனம் தேவைப்படுபவை',
  attentionNeededSubheader: 'காலக்கெடுவை நெருங்கும் அல்லது பெரிய குடியிருப்புப் பகுதிகளைப் பாதிக்கும் முதன்மைப் புகார்கள்.',
  viewIssueBtn: 'விவரங்களைக் காண்க',
  reportedAgoPrefix: 'பதிவு செய்யப்பட்டது',
  criticalUrgencyTag: 'அவசர முன்னுரிமை',
  highImpactTag: 'உயர் சமூக தாக்கம்',
  unresolvedDurationTag: 'நிலுவையில் உள்ளது',
  officerAttentionRequired: 'அலுவலர் கவனம் தேவை',
  allCommunityIssues: 'அனைத்து சமூகப் பிரச்சனைகளும்',
  communityCountLabel: 'சமூக தாக்கம்',
  singleCitizenAffected: 'குடியிருப்பாளர் இந்த சிக்கலைப் புகாரளித்தார்',
  noCommunityConfirmations: 'கூடுதல் உறுதிப்படுத்தல்கள் இன்னும் இல்லை',
  citizensAffectedCount: 'குடியிருப்பாளர்கள் இந்த சிக்கலை உறுதிப்படுத்தினர்',
  citizenAffectedCount: 'குடியிருப்பாளர் இந்த சிக்கலை உறுதிப்படுத்தினார்',
  civicResident: 'வசிப்பாளர்',
  civicOSVerified: 'CivicOS சரிபார்க்கப்பட்டது',
  viewAndActionBtn: 'பார்வையிட்டு நடவடிக்கை எடு',
  sortOfficerLabel: 'வரிசைப்படுத்து:',
  sortMostUrgent: 'மிகவும் அவசரமானவை',
  sortHighImpact: 'அதிக தாக்கம்',
  sortNewest: 'புதியவை',
  sortOldestUnresolved: 'பழைய நிலுவை புகார்கள்',
  filterAllImpact: 'அனைத்து பிரச்சனைகள்',
  filterCriticalImpact: 'அவசர முன்னுரிமை',
  filterHighImpact: 'அதிக சமூக தாக்கம்',
  filterInProgressImpact: 'செயல்பாட்டில் உள்ளவை',
  filterResolvedImpact: 'தீர்க்கப்பட்டவை',
  searchImpactPlaceholder: 'வார்த்தை, எண் அல்லது இருப்பிடம் மூலம் தேடுக...',
  livingTimeline: 'செயல்பாட்டு நேரலை வரலாறு',
  stageCitizenReport: 'குடிமகன் புகார் பதிவு செய்தார்',
  stageAITriage: 'AI வகைப்பாடு & துறை ஒதுக்கீடு',
  stageOfficialUpdate: 'கள நடவடிக்கை மேற்கொள்ளப்பட்டது',
  stagePublicResolution: 'சரிபார்க்கப்பட்ட தீர்வு',
  resolutionStoryBanner: 'தீர்வு பற்றிய விவரம்',
  noImpactIssuesFound: 'புகார்கள் எதுவும் கிடைக்கவில்லை',
  noImpactIssuesFoundDesc: 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிக்கு ஏற்ற புகார்கள் எதுவும் இல்லை.',
  loadingImpactFeed: 'தாக்கப் பட்டியல் ஏற்றப்படுகிறது...',
  navOperations: 'கள நடவடிக்கைகள்',
  navIntelligence: 'குடிமக்கள் நுண்ணறிவு',
  intelHeaderTitle: 'குடிமக்கள் நுண்ணறிவு',
  intelHeaderSubtitle: 'எங்கு புகார்கள் அதிகரிக்கின்றன, எங்கு உடனடி கவனம் தேவை என்பதை பகுப்பாய்வு செய்யுங்கள்.',
  intelTotalActive: 'மொத்த தீவிர புகார்கள்',
  intelCriticalHigh: 'அவசர & உயர் முன்னுரிமை',
  intelCommunityConfirmations: 'குடிமக்கள் உறுதிப்படுத்தல்கள்',
  intelTopCategory: 'முதன்மையான பிரச்சனை வகை',
  problemHotspotsTitle: 'பிரச்சினை அதிகம் உள்ள பகுதிகள்',
  problemHotspotsSubtitle: 'தொடர் புகார்கள் பதிவாகும் குறிப்பிட்ட பகுதிகள்',
  notEnoughLocationData: 'பகுதிகளை அடையாளம் காண போதுமான இருப்பிடத் தரவு இன்னும் கிடைக்கவில்லை.',
  repeatedProblemsTitle: 'மீண்டும் மீண்டும் ஏற்படும் பிரச்சினைகள்',
  repeatedProblemsSubtitle: 'ஒரே வகை மற்றும் இடத்தில் மீண்டும் மீண்டும் பதிவாகும் புகார்கள்',
  possibleRecurringIssue: 'மீண்டும் மீண்டும் எழும் பிரச்சனை',
  reviewIssuesBtn: 'புகார்களை ஆய்வு செய்க',
  communityImpactSectionTitle: 'சமூக தாக்க பகுப்பாய்வு',
  communityImpactSectionSubtitle: 'பல குடிமக்களால் உறுதிப்படுத்தப்பட்ட பொதுப் பிரச்சனைகள்',
  widespreadImpact: 'பரவலான சமூக தாக்கம்',
  highImpact: 'உயர் சமூக தாக்கம்',
  moderateImpact: 'குடிமக்களால் உறுதி செய்யப்பட்டது',
  trendAnalysisTitle: 'புகார் வளர்ச்சி போக்கு',
  notEnoughTrendData: 'துல்லியமான வளர்ச்சி போக்கை கணக்கிட போதுமான தரவு இல்லை.',
  categoryDistTitle: 'புகார் வகை விநியோகம்',
  priorityDistTitle: 'முன்னுரிமை விநியோகம்',
  departmentLoadTitle: 'துறை பணிச்சுமை',
  predictiveSignalsTitle: 'முன்கணிப்பு அறிகுறிகள் & மாதிரி பகுப்பாய்வு',
  predictiveSignalsSubtitle: 'வளர்ந்து வரும் சமூக பிரச்சனைகளை வெளிப்படுத்தும் வெளிப்படையான அறிகுறிகள்',
  whyThisMattersLabel: 'இது ஏன் முக்கியமானது',
  signalRecurringTitle: 'தொடர் பிரச்சனை அறிகுறி',
  signalCommunityTitle: 'சமூக உறுதிப்படுத்தல் அறிகுறி',
  signalVolumeTitle: 'அதிகரிக்கும் புகார் அறிகுறி',
  signalHotspotTitle: 'உயர் முன்னுரிமை பகுதி குவிப்பு',
  dateFilter24h: 'கடந்த 24 மணி நேரம்',
  dateFilter7d: 'கடந்த 7 நாட்கள்',
  dateFilter30d: 'கடந்த 30 நாட்கள்',
  dateFilterAll: 'அனைத்து தரவுகளும்',
  showingAvailableRecords: 'கிடைக்கப்பெற்ற பதிவுகள் காட்டப்படுகின்றன',
  emptyIntelligenceTitle: 'போதுமான தரவு இன்னும் இல்லை',
  emptyIntelligenceDesc: 'கூடுதல் குடிமக்கள் புகார்கள் பதிவாகும் போது துல்லியமான மாதிரிகள் மற்றும் பகுப்பாய்வுகள் வெளிப்படும்.',
  beforeAfterTitle: 'பணிமுறை மாற்றம்: பாரம்பரிய முறை vs. CivicOS',
  beforeAfterSubtitle: 'CivicOS எவ்வாறு நிர்வாக தாமதங்களை நீக்கி முழுமையான நடவடிக்கை வளையத்தை உருவாக்குகிறது',
  beforeLabel: 'பாரம்பரிய முறை (தனித்தனியானவை)',
  afterLabel: 'CivicOS உடன் (ஒருங்கிணைந்த தீர்வு)',
  beforeStep1: 'பல்வேறு துறை இணையதளங்கள் & குழப்பம்',
  beforeStep2: 'அலுவலகங்களிடையே கையேடு தாமதமான ஒதுக்கீடு',
  beforeStep3: 'குடிமக்களுக்கு எந்தவித நேரலை நிலையும் தெரிவதில்லை',
  beforeStep4: 'சமூக சரிபார்ப்பற்ற தனிமைப்படுத்தப்பட்ட தீர்வு',
  afterStep1: 'அனைத்து தேவைகளுக்கும் ஒரே சேவை தளம்',
  afterStep2: 'உடனடி AI வகைப்படுத்தல் & தானியங்கி ஒதுக்கீடு',
  afterStep3: 'SLA காலக்கெடுவுடன் கூடிய நேரடி கள நடவடிக்கை',
  afterStep4: 'நேரலை குடிமக்கள் அறிவிப்புகள் & சமூக உறுதிப்படுத்தல்',
  outcomeMetricsTitle: 'கள நடவடிக்கைகள் & தீர்வு முடிவுகள்',
  resolvedComplaintsCount: 'தீர்க்கப்பட்ட மொத்த புகார்கள்',
  resolutionRateLabel: 'தீர்வு விகிதம்',
  highPriorityResolvedLabel: 'தீர்க்கப்பட்ட அவசர புகார்கள்',
  communityResolvedLabel: 'தீர்க்கப்பட்ட சமூக புகார்கள்',
  reopenedFollowupsLabel: 'குடிமக்கள் பின்தொடர் குறிப்புகள்',
  meaningfulNoteRequired: 'தயவுசெய்து விரிவான நடவடிக்கை அல்லது தீர்வுக் குறிப்பை உள்ளிடவும் (குறைந்தது 10 எழுத்துக்கள்).',
};

export const translations: Record<Language, TranslationDict> = {
  en,
  ta,
};
