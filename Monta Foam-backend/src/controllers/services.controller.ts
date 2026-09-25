import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const slugify = (text: string) =>
  text
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

const serviceFieldsSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(5000),
  image: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export const serviceBodySchema = z.object({
  body: serviceFieldsSchema,
});

export const serviceUpdateSchema = z.object({
  body: serviceFieldsSchema.partial().refine((body) => Object.keys(body).length > 0, {
    message: 'At least one service field is required',
  }),
});

export const listServices = catchAsync(async (_req: Request, res: Response) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ success: true, data: services });
});

export const listServicesAdmin = catchAsync(async (_req: Request, res: Response) => {
  const services = await prisma.service.findMany({ orderBy: { createdAt: 'asc' } });
  res.json({ success: true, data: services });
});

export const getService = catchAsync(async (req: Request, res: Response) => {
  const service = await prisma.service.findFirst({
    where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true },
  });
  if (!service) throw AppError.notFound('Service not found', 'SERVICE_NOT_FOUND');
  res.json({ success: true, data: service });
});

export const createService = catchAsync(async (req: Request, res: Response) => {
  const { title, description, image, isActive } = req.body as {
    title: string; description: string; image?: string; isActive?: boolean;
  };

  const slug = slugify(title);
  const existing = await prisma.service.findUnique({ where: { slug } });
  if (existing) throw AppError.conflict('A service with a similar title already exists', 'SLUG_CONFLICT');

  const service = await prisma.service.create({
    data: { title, slug, description, image, isActive: isActive ?? true },
  });
  res.status(201).json({ success: true, message: 'Service created.', data: service });
});

export const updateService = catchAsync(async (req: Request, res: Response) => {
  const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound('Service not found', 'SERVICE_NOT_FOUND');

  const { title, description, image, isActive } = req.body as {
    title?: string; description?: string; image?: string; isActive?: boolean;
  };

  const slug = title ? slugify(title) : existing.slug;

  const service = await prisma.service.update({
    where: { id: req.params.id },
    data: { title, slug, description, image, isActive },
  });
  res.json({ success: true, message: 'Service updated.', data: service });
});

export const deleteService = catchAsync(async (req: Request, res: Response) => {
  const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound('Service not found', 'SERVICE_NOT_FOUND');
  await prisma.service.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Service deleted.' });
});
