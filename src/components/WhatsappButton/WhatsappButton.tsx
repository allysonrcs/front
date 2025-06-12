import React from "react";
import { IconButton, Typography, Box } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

interface WhatsAppButtonProps {
    phoneNumber: string;
    message?: string;
    colorText?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber, message, colorText }) => {
    if (!phoneNumber) return null;

    const formattedPhone = phoneNumber.replace(/[\s\(\)\-]/g, "");
    const defaultMessage = "Olá, tudo bem? Gostaríamos de falar com você.";
    const customMessage = encodeURIComponent(message || defaultMessage);
    const whatsappUrl = `https://wa.me/55${formattedPhone}?text=${customMessage}`;
    const defaultColorText = "text.primary";

    return (
        <Box component={"span"} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1px" }}>
            <IconButton
                size='small'
                color='warning'
                onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
                sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                }}
                title='Enviar mensagem no WhatsApp'>
                <WhatsAppIcon color='success' fontSize='small' />
            </IconButton>
            <Typography fontSize={14} color={colorText || defaultColorText}>
                {phoneNumber}
            </Typography>
        </Box>
    );
};

export default WhatsAppButton;
