import {
  Category,
  CategoryProps,
  CategoryType,
} from "../../domain/entities/Category";
import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";

export interface CreateCategoryDTO {
  clinicId: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  description?: string;
}

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDTO): Promise<Category> {
    // Verifica se já existe uma categoria com esse nome
    const existing = await this.categoryRepository.findByName(
      dto.clinicId,
      dto.name,
      dto.type,
    );

    if (existing) {
      throw new Error("Já existe uma categoria com este nome");
    }

    const categoryProps: CategoryProps = {
      id: crypto.randomUUID(),
      clinicId: dto.clinicId,
      name: dto.name,
      type: dto.type,
      color: dto.color,
      icon: dto.icon,
      description: dto.description,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const category = new Category(categoryProps);
    await this.categoryRepository.save(category);

    return category;
  }
}
