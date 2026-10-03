import type { ZodType } from 'zod'

export function parseInput<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) throw createError({ statusCode: 422, statusMessage: 'Invalid input' })
  return result.data
}
