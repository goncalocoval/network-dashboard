import { Request, Response } from 'express';
import { execFile } from 'child_process';
import os from 'os';
import path from 'path';

const WIREGUARD_DIRECTORY = process.env.WIREGUARD_DIRECTORY || "";

const scriptGenerate = path.join(WIREGUARD_DIRECTORY, 'add_peer.py');
const scriptReset = path.join(WIREGUARD_DIRECTORY, 'reset_peers.py');

export const generateVPNClient = (req: Request, res: Response) => {

  execFile('python3', [scriptGenerate], (error, stdout, stderr) => {
    if (error) {
      console.error('Erro ao gerar cliente VPN:', stderr);
      return res.status(500).json({ error: 'Erro ao gerar cliente VPN.' });
    }

    try {
	console.log('Raw stdout do script:', JSON.stringify(stdout)); 
      const output = JSON.parse(stdout);
 
      return res.json({ qr: output.qr, filename: output.filename });
    } catch (err) {
      return res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao interpretar QR code.' });
    }
  });
};

export const resetVPN = (req: Request, res: Response) => {

  execFile('python3', [scriptReset], (error, stdout, stderr) => {
    if (error) {
      console.error('Erro ao resetar VPN:', stderr);
      return res.status(500).json({ error: 'Erro ao resetar VPN.' });
    }

    return res.json({ message: 'VPN resetada com sucesso. Todas as configurações de clientes foram limpas.' });
  });
};

export const downloadVPNClient = (req: Request, res: Response) => {
  const filename = req.params.filename;
  const clientsDir = path.join(WIREGUARD_DIRECTORY, 'clients');
  const filePath = path.join(clientsDir, filename);

  res.download(filePath, (err) => {
    if (err) {
      console.error('Erro ao baixar o arquivo:', err);
      res.status(500).send('Erro ao baixar o arquivo.');
    }
  });
  
}
