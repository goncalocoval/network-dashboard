// controllers/networkController.ts
import path from 'path';
import { execFile } from 'child_process';
import { Request, Response } from 'express';

const NMAP_DIRECTORY = process.env.NMAP_DIRECTORY || "";
const SCRIPT_PATH = path.join(NMAP_DIRECTORY, 'network_connected.py');

export const getConnectedDevices = (req: Request, res: Response) => {
  execFile('python3', [SCRIPT_PATH], (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro ao executar get_devices.py:', error.message);
      console.error('📄 STDERR:', stderr);
      return res.status(500).json({ error: 'Erro ao executar scanner de rede.' });
    }

    try {
      const devices = JSON.parse(stdout);
      return res.status(200).json({ devices });
    } catch (parseError) {
      console.error('❌ Erro ao interpretar JSON:', parseError);
      console.error('📄 STDOUT (não parseável):', stdout);
      return res.status(500).json({ error: 'Erro ao interpretar dispositivos.' });
    }
  });
};