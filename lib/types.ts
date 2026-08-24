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
}

export interface CompanySettings {
  requireAssets: boolean;
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
  quantity: number;
  unit: string;
  unitPrice: number;
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
