export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "ATTENDANT"
  | "TECHNICIAN"
  | "FINANCIAL"
  | "CUSTOMER";

export type Permission =
  | "CUSTOMER_READ"
  | "CUSTOMER_CREATE"
  | "CUSTOMER_UPDATE"
  | "CUSTOMER_DELETE"
  | "ASSET_READ"
  | "ASSET_CREATE"
  | "ASSET_UPDATE"
  | "ASSET_DELETE"
  | "SERVICE_READ"
  | "SERVICE_CREATE"
  | "SERVICE_UPDATE"
  | "SERVICE_DELETE"
  | "SERVICE_ORDER_READ"
  | "SERVICE_ORDER_CREATE"
  | "SERVICE_ORDER_UPDATE"
  | "SERVICE_ORDER_CANCEL"
  | "PAYMENT_READ"
  | "PAYMENT_CREATE"
  | "REPORT_READ"
  | "USER_MANAGE"
  | "TENANT_CONFIGURE";

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
}

export interface Me {
  id: string;
  name: string;
  email: string;
  tenant: TenantSummary;
  roles: Role[];
  permissions: Permission[];
}

export interface AuthenticationResult {
  expiresIn: number;
  user: {
    id: string;
    name: string;
    tenantId: string;
    roles: Role[];
  };
}

export interface Branding {
  tradeName: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  borderRadius?: number | null;
}

export interface AppearanceSettings {
  tradeName: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  borderRadius: number;
}

export interface PublicProfileSettings {
  enabled: boolean;
  slug: string;
  tradeName: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  headline?: string | null;
  description?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
  serviceArea?: string | null;
  showPrices: boolean;
  serviceSource: PublicServiceSource;
  manualServices: PublicProfileManualService[];
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  profileImagePath?: string | null;
  logoPath?: string | null;
  backgroundImagePath?: string | null;
  showLogo: boolean;
  backgroundOverlayPercentage: number;
}

export type PublicServiceSource = "CATALOG" | "MANUAL";

export interface PublicProfileManualService {
  name: string;
  description?: string | null;
  basePrice?: number | null;
}

export interface PublicProfileMediaUpload {
  kind: "BRAND" | "PROFILE" | "LOGO" | "BACKGROUND";
  path: string;
}

export interface PublicProfileService {
  name: string;
  description?: string | null;
  basePrice?: number | null;
  estimatedMinutes?: number | null;
}

export interface PublicProfile {
  slug: string;
  tradeName: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  headline: string;
  description: string;
  whatsapp: string;
  email?: string | null;
  city?: string | null;
  serviceArea?: string | null;
  showPrices: boolean;
  serviceSource: PublicServiceSource;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  profileImagePath?: string | null;
  logoPath?: string | null;
  backgroundImagePath?: string | null;
  showLogo: boolean;
  backgroundOverlayPercentage: number;
  services: PublicProfileService[];
}

export interface CompanySettings {
  requireAssets: boolean;
  subscriptionPlan: SubscriptionPlan;
  subscriptionBillingCycle: SubscriptionBillingCycle;
  subscriptionActive: boolean;
  subscriptionPaidUntil?: string | null;
  subscriptionPrice: number;
  couponCode?: string | null;
  couponDiscountPercentage: number;
  quoteCalculationMethod: QuoteCalculationMethod;
  enabledQuoteCalculationMethods: QuoteCalculationMethod[];
  defaultSquareMeterPrice?: number | null;
  defaultCubicMeterPrice?: number | null;
  includedUserLimit: number;
  additionalUserSeats: number;
  userLimit: number;
  additionalUserMonthlyPrice: number;
}

export type SubscriptionPlan = "SOLO" | "PRO" | "BUSINESS";
export type SubscriptionBillingCycle = "MONTHLY" | "ANNUAL";
export type QuoteCalculationMethod = "QUANTITY" | "SQUARE_METER" | "CUBIC_METER";

export interface SubscriptionPlanOption {
  code: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  includedUsers: number;
  features: string[];
}

export interface WhatsAppPlanSimulation {
  deliveryMode: "SIMULATION";
  destination: string;
  plan: SubscriptionPlan;
  planName: string;
  billingCycle: SubscriptionBillingCycle;
  additionalUserSeats: number;
  userLimit: number;
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  price: number;
  monthlyEquivalent: number;
  couponCode?: string | null;
  message: string;
  simulatedAt: string;
}

export interface RegistrationConfiguration {
  subscriptionPaymentSimulationEnabled: boolean;
  couponEnabled: boolean;
  termsVersion: string;
  privacyVersion: string;
  plans: SubscriptionPlanOption[];
  additionalUserMonthlyPrice: number;
  additionalUserAnnualPrice: number;
}

export interface TenantRegistrationResult {
  tenantId: string;
  userId: string;
  slug: string;
  plan: SubscriptionPlan;
  billingCycle: SubscriptionBillingCycle;
  additionalUserSeats: number;
  userLimit: number;
  subscriptionActive: boolean;
  subscriptionPaidUntil?: string | null;
  originalPrice: number;
  discountPercentage: number;
  price: number;
  monthlyEquivalent: number;
  couponCode?: string | null;
}

export interface CouponValidation {
  plan: SubscriptionPlan;
  billingCycle: SubscriptionBillingCycle;
  additionalUserSeats: number;
  userLimit: number;
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  price: number;
  monthlyEquivalent: number;
  couponCode: string;
  couponApplied: boolean;
}

export interface DataDeletionResult {
  receiptId: string;
  deletedAt: string;
}

export type CustomerType = "PERSON" | "COMPANY";
export type CustomerStatus = "ACTIVE" | "INACTIVE";

export interface Customer {
  id: string;
  tenantId: string;
  type: CustomerType;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export type AssetType = string;

export interface AssetTypeDefinition {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  systemDefault: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  tenantId: string;
  customerId: string;
  type: AssetType;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  attributes?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export type CatalogServiceType = "GENERAL" | "MAINTENANCE";

export interface CatalogService {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  basePrice: number;
  estimatedMinutes?: number;
  type: CatalogServiceType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ServiceOrderPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type ServiceOrderStatus = string;

export interface ServiceOrderStatusDefinition {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  systemDefault: boolean;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrderQuoteLine {
  serviceId?: string;
  description: string;
  notes?: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  calculationMethod: QuoteCalculationMethod;
  widthMeters?: number | null;
  lengthMeters?: number | null;
  heightMeters?: number | null;
  billableQuantity?: number;
  total?: number;
}

export interface ServiceOrder {
  id: string;
  tenantId: string;
  customerId: string;
  assetId?: string;
  serviceIds: string[];
  quoteLines: ServiceOrderQuoteLine[];
  title: string;
  description?: string;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  estimatedValue?: number;
  finalValue?: number;
  assignedTechnicianId?: string;
  openedAt: string;
  dueAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrderDocument {
  order: {
    id: string;
    title: string;
    description?: string;
    status: ServiceOrderStatus;
    statusName: string;
    priority: ServiceOrderPriority;
    estimatedValue?: number;
    finalValue?: number;
    openedAt: string;
    dueAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
  company: {
    id: string;
    legalName: string;
    tradeName: string;
    document?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  customer: {
    id: string;
    name: string;
    document?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  asset?: {
    id: string;
    type: AssetType;
    typeName: string;
    name: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
  };
  quoteLines: ServiceOrderQuoteLine[];
}

export interface ServiceOrderEmailResult {
  deliveryMode: "SIMULATION" | "SMTP" | string;
  recipient: string;
  subject: string;
  body: string;
  processedAt: string;
}

export interface CustomerServiceOrder {
  id: string;
  assetId?: string;
  serviceIds: string[];
  quoteLines: ServiceOrderQuoteLine[];
  title: string;
  description?: string;
  status: ServiceOrderStatus;
  statusName: string;
  priority: ServiceOrderPriority;
  estimatedValue?: number;
  finalValue?: number;
  openedAt: string;
  dueAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = "PENDING" | "ACTIVE" | "BLOCKED" | "INACTIVE";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  status: UserStatus;
  roles: Role[];
  permissions: Permission[];
  customerId?: string;
}

export interface ApiProblem {
  title?: string;
  detail?: string;
  message?: string;
  code?: string;
  status?: number;
  fields?: Record<string, string>;
  errors?: Record<string, string>;
}
