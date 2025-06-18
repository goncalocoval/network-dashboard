// src/controllers/deviceController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/devices
export const getDevices = async (_req: Request, res: Response) => {
  try {
    const devices = await prisma.device.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter dispositivos.' });
  }
};

// GET allowed devices
export const getAllowedDevices = async (_req: Request, res: Response) => {
    try {
        const devices = await prisma.device.findMany({
            where: { allowed: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(devices);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao obter dispositivos permitidos.' });
    }
};

// GET /api/devices/:id
export const getDeviceById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const device = await prisma.device.findUnique({
            where: { id: Number(id) }
        });
        if (!device) {
            res.status(404).json({ error: 'Dispositivo não encontrado.' });
            return;
        }
        res.json(device);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao obter dispositivo.' });
    }
};

// POST /api/devices
export const addDevice = async (req: Request, res: Response): Promise<void> => {
  const { ip, mac, name } = req.body;

  if (!ip || !mac) {
    res.status(400).json({ error: 'IP ou MAC são obrigatórios.' });
    return;
  }

  const existing = await prisma.device.findFirst({
    where: {
      OR: [
        { ip },
        { mac: mac.toUpperCase() }
      ]
    }
  });

  if (existing) {
    res.status(409).json({ error: 'Dispositivo já registado.' });
    return;
  }

  try {
    const newDevice = await prisma.device.create({
      data: { ip, mac, name, allowed: false },
    });
    res.status(201).json(newDevice);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar dispositivo.' });
  }
};

// PUT /api/devices/:id
export const updateDevice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, allowed } = req.body;

  try {
    const updated = await prisma.device.update({
      where: { id: Number(id) },
      data: { name, allowed },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar dispositivo.' });
  }
};

// DELETE /api/devices/:id
export const deleteDevice = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.device.delete({ where: { id: Number(id) } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover dispositivo.' });
  }
};

export const updateDeviceStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { allowed } = req.body;

  try {
    const updatedDevice = await prisma.device.update({
      where: { id: Number(id) },
      data: { allowed },
    });
    res.json(updatedDevice);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar o estado do dispositivo.' });
  }
}