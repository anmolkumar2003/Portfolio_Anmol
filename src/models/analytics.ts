export const analyticsEvents = {
  projectInteraction: 'project_interaction',
  appStoreClick: 'app_store_click',
  resumeDownloadClick: 'resume_download_click',
  contactClick: 'contact_click',
} as const;

export type AnalyticsEventName =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];

export type AnalyticsProps = Record<string, string>;
