/**
 * Layout shell components entrypoint.
 * Sidebar, top header, and breadcrumb navigation shells will be implemented in Phase 2.
 */
export interface NavItemConfig {
  label: string;
  href: string;
  requiredPermission?: string;
}

