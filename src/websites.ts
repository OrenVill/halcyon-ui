export type { WebsiteBrandProps, WebsiteRoute } from './websites/types'

export { CommerceWebsite, commerceWebsitePaths, commerceWebsiteRoutes } from './websites/commerce'
export type {
  CommerceWebsiteCheckoutProps,
  CommerceWebsiteComponent,
  CommerceWebsiteLoginProps,
  CommerceWebsiteNotFoundProps,
  CommerceWebsitePageId,
  CommerceWebsiteStoreProps,
} from './websites/commerce'

export { DocsWebsite, docsWebsitePaths, docsWebsiteRoutes } from './websites/docs'
export type {
  DocsWebsiteBlogPostProps,
  DocsWebsiteBlogProps,
  DocsWebsiteComponent,
  DocsWebsiteDocsProps,
  DocsWebsiteNotFoundProps,
  DocsWebsitePageId,
} from './websites/docs'

export { MarketingWebsite, marketingWebsitePaths, marketingWebsiteRoutes } from './websites/marketing'
export type {
  MarketingWebsiteComponent,
  MarketingWebsiteForgotPasswordProps,
  MarketingWebsiteHomeProps,
  MarketingWebsiteLoginProps,
  MarketingWebsiteNotFoundProps,
  MarketingWebsitePageId,
  MarketingWebsiteSignupProps,
} from './websites/marketing'

export { SaasWebsite, saasWebsitePaths, saasWebsiteRoutes } from './websites/saas'
export type {
  SaasWebsiteComponent,
  SaasWebsiteDashboardProps,
  SaasWebsiteLoginProps,
  SaasWebsiteNotFoundProps,
  SaasWebsiteOnboardingProps,
  SaasWebsitePageId,
  SaasWebsiteSettingsProps,
  SaasWebsiteSignupProps,
} from './websites/saas'
