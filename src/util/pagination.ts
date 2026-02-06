import { autoParseFilters } from "./prisma/parse-filters";

export async function paginate<T>(
  // eslint-disable-next-line
  model: { findMany: Function; count: Function },
  // eslint-disable-next-line
  filters: any,
  page = 1,
  limit = 10,
  include?: Record<string, boolean>,
): Promise<{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const [data, total] = await Promise.all([
    model.findMany({
      where: autoParseFilters(filters),
      skip: (page - 1) * limit,
      take: limit,
      include,
    }),
    model.count({ where: filters }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
