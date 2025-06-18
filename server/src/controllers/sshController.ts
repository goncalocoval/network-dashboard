import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import qrcode from "qrcode";

export const shareAuthenticator = async (req: Request, res: Response) => {
    const googleAuthenticatorDirectory = process.env.GOOGLE_AUTHENTICATOR_DIRECTORY || "";
    const filePath = path.join(googleAuthenticatorDirectory, ".google_authenticator");

    try {
        // Lê o ficheiro
        const fileContent = fs.readFileSync(filePath, "utf-8");

        // Extrai a secret da primeira linha
        const secret = fileContent.split("\n")[0].trim();

        // Define utilizador e emissor (podes personalizar isto)
        const user = "admin@raspberrypi";
        const issuer = "RaspberryPi SSH";

        // Gera a URI do tipo otpauth://
        const otpauthURL = `otpauth://totp/${issuer}:${user}?secret=${secret}&issuer=${issuer}`;

        // Gera QR code em formato base64 (imagem PNG embutida)
        const qrCodeBase64 = await qrcode.toDataURL(otpauthURL);

        // Envia para o frontend
        return res.json({ qrCode: qrCodeBase64 });

    } catch (error) {
        console.error("Erro ao gerar o QR code do Google Authenticator:", error);
        return res.status(500).json({ error: "Erro ao compartilhar o autenticador." });
    }
};

export const viewBlockedIps = (req: Request, res: Response) => {

    const command = "sudo fail2ban-client status sshd";
    const exec = require("child_process").exec;
    exec(command, (error: any, stdout: string, stderr: string) => {
            if (error) {
                console.error("Erro ao executar o comando:", stderr);
                return res.status(500).json({ error: "Erro ao obter IPs bloqueados." });
            }

            const output = stdout.split("\n");
            const blockedIps = output.slice(1, -1).map(line => line.trim());
            
            return res.json({ blockedIps });
        }
    );

};