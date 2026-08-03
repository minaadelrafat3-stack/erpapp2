import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchDashboardSummary,
  fetchRecentNotifications,
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchCategoriesWithCounts,
  fetchCategoryById,
  fetchInventory,
  fetchBranches,
  fetchBranchById,
  fetchWarehouses,
  fetchWarehouseById,
  type ProductListResult,
  type ProductListItem,
  type InventoryFilter,
} from '@services/erpService';
import { APP_CONFIG } from '@constants';
import type {
  DashboardSummary,
  ERPNotification,
  Category,
  CategoryWithCount,
  InventoryItemWithStatus,
  Branch,
  BranchDetail,
  Warehouse,
  WarehouseDetail,
  ProductDetail,
} from '@apptypes/erp';

// ============================================================
// Query Keys
// ============================================================

export const erpKeys = {
  dashboard: ['erp', 'dashboard'] as const,
  notifications: (limit: number) => ['erp', 'notifications', limit] as const,
  products: ['erp', 'products'] as const,
  productsList: (search: string, categoryId: string | null) => ['erp', 'products', 'list', search, categoryId] as const,
  product: (id: string) => ['erp', 'products', 'detail', id] as const,
  categories: ['erp', 'categories'] as const,
  category: (id: string) => ['erp', 'categories', 'detail', id] as const,
  inventory: (filters: InventoryFilter) => ['erp', 'inventory', filters] as const,
  branches: ['erp', 'branches'] as const,
  branch: (id: string) => ['erp', 'branches', 'detail', id] as const,
  warehouses: ['erp', 'warehouses'] as const,
  warehouse: (id: string) => ['erp', 'warehouses', 'detail', id] as const,
};

// ============================================================
// Dashboard Hooks
// ============================================================

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: erpKeys.dashboard,
    queryFn: fetchDashboardSummary,
    staleTime: 60_000,
  });
}

export function useRecentNotifications(userId: string | null | undefined, limit = 5) {
  return useQuery<ERPNotification[]>({
    queryKey: erpKeys.notifications(limit),
    queryFn: () => fetchRecentNotifications(userId!, limit),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

// ============================================================
// Product Hooks
// ============================================================

export function useProducts(search: string, categoryId: string | null) {
  return useInfiniteQuery<ProductListResult>({
    queryKey: erpKeys.productsList(search, categoryId ?? 'all'),
    queryFn: ({ pageParam }) =>
      fetchProducts({
        search: search || undefined,
        categoryId: categoryId ?? undefined,
        cursor: (pageParam as string | null) ?? null,
        limit: APP_CONFIG.itemsPerPage,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30_000,
  });
}

export function useProduct(id: string | null) {
  return useQuery<ProductDetail>({
    queryKey: erpKeys.product(id ?? ''),
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export type { ProductListItem, ProductListResult };

// ============================================================
// Category Hooks
// ============================================================

export function useCategories() {
  return useQuery<CategoryWithCount[]>({
    queryKey: erpKeys.categories,
    queryFn: fetchCategoriesWithCounts,
    staleTime: 5 * 60_000,
  });
}

export function useCategoryDetail(id: string | null) {
  return useQuery<CategoryWithCount>({
    queryKey: erpKeys.category(id ?? ''),
    queryFn: () => fetchCategoryById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

// ============================================================
// Inventory Hooks
// ============================================================

export function useInventory(filters: InventoryFilter = {}) {
  return useQuery<InventoryItemWithStatus[]>({
    queryKey: erpKeys.inventory(filters),
    queryFn: () => fetchInventory(filters),
    staleTime: 30_000,
  });
}

// ============================================================
// Branches & Warehouses Hooks
// ============================================================

export function useBranches() {
  return useQuery<Branch[]>({
    queryKey: erpKeys.branches,
    queryFn: fetchBranches,
    staleTime: 5 * 60_000,
  });
}

export function useBranchDetail(id: string | null) {
  return useQuery<BranchDetail>({
    queryKey: erpKeys.branch(id ?? ''),
    queryFn: () => fetchBranchById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useWarehouses() {
  return useQuery<Warehouse[]>({
    queryKey: erpKeys.warehouses,
    queryFn: fetchWarehouses,
    staleTime: 5 * 60_000,
  });
}

export function useWarehouseDetail(id: string | null) {
  return useQuery<WarehouseDetail>({
    queryKey: erpKeys.warehouse(id ?? ''),
    queryFn: () => fetchWarehouseById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

// ============================================================
// Refresh Helper
// ============================================================

export function useRefreshERP() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: ['erp'] });
  };
}
