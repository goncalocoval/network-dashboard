import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import qrcode from "qrcode";
const { exec } = require("child_process");

export const shareAuthenticator = async (req: Request, res: Response) => {
    const googleAuthenticatorDirectory = process.env.GOOGLE_AUTHENTICATOR_DIRECTORY || "";
    const filePath = path.join(googleAuthenticatorDirectory, ".google_authenticator");

    try {
        
        const fileContent = fs.readFileSync(filePath, "utf-8");

        const secret = fileContent.split("\n")[0].trim();

        const user = "admin@raspberrypi";
        const issuer = "RaspberryPi SSH";

        const otpauthURL = `otpauth://totp/${issuer}:${user}?secret=${secret}&issuer=${issuer}`;

        const qrCodeBase64 = await qrcode.toDataURL(otpauthURL);

        return res.json({ qrCode: qrCodeBase64 });

    } catch (error) {
        console.error("Erro ao gerar o QR code do Google Authenticator:", error);
        return res.status(500).json({ error: "Erro ao compartilhar o autenticador." });
    }
};

export const viewBlockedIps = (req: Request, res: Response) => {
    const command = "sudo fail2ban-client status sshd";

    exec(command, (error: any, stdout: string, stderr: string) => {
        if (error) {
            console.error("Erro ao executar o comando:", stderr);
            return res.status(500).json({ error: "Erro ao obter IPs bloqueados." });
        }

        const output = stdout.split('\n');
        const bannedIndex = output.findIndex(line => line.includes('Banned IP list:'));

        let bannedIps: string[] = [];

        if (bannedIndex !== -1) {
            const line = output[bannedIndex];
            const firstColon = line.indexOf(':');
            if (firstColon !== -1) {
                const ipsString = line.slice(firstColon + 1).trim();
                if (ipsString) {
                    bannedIps = ipsString.split(',').map(ip => ip.trim());
                }
            }
        }

        return res.json({
            total: bannedIps.length,
            blockedIps: bannedIps
        });
    });
};
