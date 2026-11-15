export type SettingGroup = 'store_profile' | 'invoice' | 'seo_defaults' | 'contact';

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
}

export interface StoreProfileSettings {
  storeName: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  phone: string;
  email: string;
  address: string;
  socialLinks?: SocialLinks;
  businessRegistration?: string;
  bin?: string;
  vat?: string;
}

export interface InvoiceSettings {
  prefix: string;
  footerNote?: string;
  termsNote?: string;
  showLogo: boolean;
  signatureText?: string;
}

export interface SeoDefaultsSettings {
  titleTemplate: string;
  description: string;
  ogImage?: string;
}

export interface ContactSettings {
  supportPhone: string;
  supportEmail: string;
  address: string;
  supportHours: string;
}

export interface LogoUploadResponse {
  logoUrl: string;
}

export interface FaviconUploadResponse {
  faviconUrl: string;
}
