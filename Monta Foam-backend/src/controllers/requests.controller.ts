import { Request, Response } from 'express';
import { RequestStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendEmail, serviceRequestConfirmationTemplate } from '../services/email.service';
import { notifyAdmins } from '../services/notification.service';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { recordAuditLog, AuditActions } from '../services/auditLog.service';

export const createRequestSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email(),
    phone: z.string().trim().min(7).max(20),
    // Accept the database UUID as documented, or a service slug used by the
    // frontend's offline fallback catalog.
    serviceId: z.string().trim().min(1).max(100).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
});

export const createServiceRequest = catchAsync(async (req: Request, res: Response) => {
  const { fullName, email, phone, serviceId, notes } = req.body as {
    fullName: string; email: string; phone: string; serviceId?: string; notes?: string;
  };

  let service = null;
  if (serviceId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serviceId);
    service = await prisma.service.findUnique({
      where: isUuid ? { id: serviceId } : { slug: serviceId },
      select: { id: true, title: true, isActive: true },
    });
    if (!service) throw AppError.notFound('Service not found', 'SERVICE_NOT_FOUND');
    if (!service.isActive) throw AppError.badRequest('This service is not currently available', 'SERVICE_INACTIVE');
  }

  const request = await prisma.serviceRequest.create({
    data: {
      userId: req.user?.id ?? null,
      serviceId: service?.id ?? null,
      fullName,
      email,
      phone,
      notes,
    },
  });

  // Fire-and-forget side effects
  Promise.all([
    sendEmail({
      to: email,
      subject: 'تم استلام طلبك – مونتا فوم',
      html: serviceRequestConfirmationTemplate(fullName, service?.title),
    }),
    notifyAdmins({
      title: 'New service request',
      message: `${fullName} requested ${service?.title ?? 'a service'}. Phone: ${phone}`,
      type: 'NEW_REQUEST',
      metadata: { requestId: request.id },
    }),
    recordAuditLog({
      action: AuditActions.SERVICE_REQUEST_CREATED,
      actorId: req.user?.id,
      metadata: { requestId: request.id },
      req,
    }),
  ]).catch(() => null);

  const whatsappLink = buildWhatsAppLink({
    name: fullName,
    phone,
    service: service?.title ?? 'General inquiry',
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Request submitted. Our team will contact you shortly.',
    data: { requestId: request.id, whatsappLink },
  });
});

export const listRequests = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const status = Object.values(RequestStatus).includes(req.query.status as RequestStatus)
    ? (req.query.status as RequestStatus) : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

  const where = {
    ...(status ? { status } : {}),
    ...(search ? {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  };

  const [requests, total] = await prisma.$transaction([
    prisma.serviceRequest.findMany({
      where,
      include: { service: { select: { id: true, title: true } }, user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.serviceRequest.count({ where }),
  ]);

  res.json({ success: true, data: requests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getRequest = catchAsync(async (req: Request, res: Response) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: req.params.id },
    include: { service: true, user: { select: { id: true, fullName: true, email: true } } },
  });
  if (!request) throw AppError.notFound('Request not found', 'REQUEST_NOT_FOUND');
  res.json({ success: true, data: request });
});

export const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body as { status: RequestStatus };
  if (!Object.values(RequestStatus).includes(status)) {
    throw AppError.badRequest('Invalid status value', 'INVALID_STATUS');
  }

  const existing = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound('Request not found', 'REQUEST_NOT_FOUND');

  const updated = await prisma.serviceRequest.update({ where: { id: req.params.id }, data: { status } });
  res.json({ success: true, message: 'Status updated.', data: updated });
});

export const myRequests = catchAsync(async (req: Request, res: Response) => {
  const requests = await prisma.serviceRequest.findMany({
    where: { userId: req.user!.id },
    include: { service: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: requests });
});
