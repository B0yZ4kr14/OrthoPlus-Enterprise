import { z } from 'zod';

export const createDashboardSchema = z.object({
  name: z.string().max(200),
  description: z.string().max(1000).optional(),
  is_default: z.boolean().optional(),
  is_public: z.boolean().optional(),
  layout: z.any().optional(),
  tags: z.array(z.string()).optional(),
  refresh_interval_minutes: z.number().int().positive().optional(),
});
export const updateDashboardSchema = createDashboardSchema.partial();

export const createWidgetSchema = z.object({
  dashboard_id: z.string().uuid(),
  widget_type: z.string(),
  name: z.string().max(200),
  data_source: z.string(),
  query_config: z.any(),
  display_config: z.any().optional(),
  position_x: z.number().int().nonnegative().optional(),
  position_y: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  chart_type: z.string().optional(),
});
export const updateWidgetSchema = createWidgetSchema.partial();
