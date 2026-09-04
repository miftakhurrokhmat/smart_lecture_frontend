import type { UserRole } from "@shared/api";

/**
 * Return dashboard path for given role.
 */
export function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "dosen":
      return "/dosen/dashboard";
    case "mahasiswa":
    default:
      return "/dashboard";
  }
}
