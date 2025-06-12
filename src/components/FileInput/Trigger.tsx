import React, { useState } from "react";
import { Paper, Typography } from "@mui/material";
import { useFileInput } from "./Root";
import { formatBytes } from "@/functions/number";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export function Trigger() {
    const { id, files, allowedTypes, maxSizeBytes, onFilesSelected } = useFileInput();
    const [isDragging, setIsDragging] = useState(false);
    const hasInvalid = files.some((f) => !f.isValid);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length) {
            onFilesSelected(droppedFiles, true);
        }
    };

    return (
        <label htmlFor={id}>
            <Paper
                variant='outlined'
                sx={{
                    p: 2,
                    borderStyle: "dashed",
                    cursor: "pointer",
                    textAlign: "center",
                    borderColor: hasInvalid ? "error.main" : "grey.400",
                    bgcolor: isDragging ? "action.hover" : "transparent",
                    "&:hover": { borderColor: "primary.main" },
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}>
                <UploadFileIcon
                    color={hasInvalid ? "error" : "disabled"}
                    sx={{ "&:hover": { color: hasInvalid ? "error.dark" : "primary.main" } }}
                />
                <Typography variant='body2'>
                    <Typography
                        component='span'
                        color={hasInvalid ? "error" : "primary"}
                        fontWeight='bold'
                        fontSize={14}>
                        Clique para carregar{" "}
                    </Typography>
                    <Typography component='span' color='text.secondary' fontSize={14}>
                        ou arraste para anexar
                    </Typography>
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                    Tipos: {allowedTypes.map((e) => `.${e}`).join(", ")} | Até {formatBytes(maxSizeBytes)}
                </Typography>
                {hasInvalid && (
                    <Typography variant='caption' color='error' display='block'>
                        Há arquivos inválidos na lista. Remova-os para prosseguir.
                    </Typography>
                )}
            </Paper>
        </label>
    );
}
