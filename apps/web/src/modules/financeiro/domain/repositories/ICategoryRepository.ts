import { Category, CategoryType } from "../entities/Category";

export interface CategoryFilters {
  type?: CategoryType;
  isActive?: boolean;
}

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByClinic(
    clinicId: string,
    filters?: CategoryFilters,
  ): Promise<Category[]>;
  save(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
  delete(id: string): Promise<void>;

  // Utility methods
  findByName(
    clinicId: string,
    name: string,
    type: CategoryType,
  ): Promise<Category | null>;
}
