import { Request, Response } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';

const NMAP_DIRECTORY = process.env.NMAP_DIRECTORY || "";
const WIREGUARD_DIRECTORY = process.env.WIREGUARD_DIRECTORY || "";
const TFA_DIRECTORY = process.env.TFA_DIRECTORY || "";

const logFilesMap: Record<string, string> = {
  network: 'network_scan.log',
  vpn: 'vpn_connections.log',
  ssh: 'ssh_activity.log',
};

export const getLogByType = async (req: Request, res: Response) => {
 
    const { type } = req.params;
    const logFileName = logFilesMap[type];
    
    var logFilePath = "";
    
    if (type === 'network') {
        logFilePath = path.join(NMAP_DIRECTORY, logFileName);
    }
    else if (type === 'vpn') {
        logFilePath = path.join(WIREGUARD_DIRECTORY, logFileName);
    } else if (type === 'ssh') {
        logFilePath = path.join(TFA_DIRECTORY, logFileName);
    } else {
        res.status(400).json({ error: 'Tipo de log inválido.' });
        return;
    }

    try {
        var logData = fs.readFileSync(logFilePath, 'utf-8');
        // Reverse and limit to 250 lines
        const logLines = logData.split('\n').reverse().slice(0, 250);
        logData = logLines.join('\n');
        res.json({ data: logData });
    } catch (error) {
        console.error('Erro ao ler o arquivo de log:', error);
        res.status(500).json({ error: 'Erro ao ler o arquivo de log.' });
    }
};