import { ToObjectOptions } from "mongoose";

// Helper function to transform the pagination response
export const apiOk = (response: any) => {
  return {
    result: {
      messages: response.docs,
      pagination: {
        page: response.page,
        perPage: response.limit,
        totalDocs: response.totalDocs,
        totalPages: response.totalPages,
        hasPrevPage: response.hasPrevPage,
        hasNextPage: response.hasNextPage,
      },
    },
  };
};

export function transformSchema(doc: unknown, ret: Record<string, unknown>, opt: ToObjectOptions<unknown>, excludeFields: string[] = []) {
  // Add `id` at the top of the response
  const transformed = { id: ret._id, ...ret };
  
  // Remove unnecessary fields
  delete transformed['_id'];

  // Remove fields that need to be excluded (e.g., password, authCode)
  excludeFields.forEach(field => {
    delete transformed[field];
  });

  return transformed;
}