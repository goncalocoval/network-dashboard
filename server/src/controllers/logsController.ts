import { Request, Response } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';

const LOG_DIRECTORY = process.env.LOG_DIRECTORY || "";

const logFilesMap: Record<string, string> = {
  network: 'network_scan.log',
  vpn: 'vpn.log',
  ssh: 'ssh.log',
};

export const getLogByType = async (req: Request, res: Response) => {
 
    const { type } = req.params;
    const logFileName = logFilesMap[type];
    
    if (!logFileName) {
        res.status(400).json({ error: 'Tipo de log inválido.' });
    }
    
    const logFilePath = path.join(LOG_DIRECTORY, logFileName);

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