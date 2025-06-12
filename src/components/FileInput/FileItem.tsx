import { useState, useEffect } from "react";
import { useFileInput, FileMeta } from "./Root";
import { Paper, Box, Typography, LinearProgress, IconButton, Tooltip } from "@mui/material";
import { formatBytes } from "@/functions/number";
import { FileIcon } from "./FileIcon";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";

interface FileItemProps {
    meta: FileMeta;
}

export function FileItem({ meta }: FileItemProps) {
    const { removeFile } = useFileInput();
    const { file, isValid, error } = meta;
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        if (!isValid) return;
        setProgress(0);

        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = Math.min(prev + 10, 90);
                return next;
            });
        }, 200);

        const finishTimeout = setTimeout(() => {
            clearInterval(interval);
            setProgress(100);
        }, 2200);

        return () => {
            clearInterval(interval);
            clearTimeout(finishTimeout);
        };
    }, [file, isValid]);

    const ext = file.name.split(".").pop() || "";

    return (
        <Paper
            variant='outlined'
            sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderColor: isValid ? (progress === 100 ? "success.main" : "primary.main") : "error.main",
            }}>
            {isValid ? (
                progress === 100 ? (
                    <FileIcon ext={ext} />
                ) : (
                    <CloudUploadIcon color='primary' />
                )
            ) : (
                <DangerousOutlinedIcon color={"error"} />
            )}

            <Box flex={1}>
                <Typography variant='body2' fontWeight='bold'>
                    {file.name}
                </Typography>
                <Typography variant='caption' color={isValid ? "text.secondary" : "error"}>
                    {isValid ? formatBytes(file.size) : error}
                </Typography>
                {isValid && (
                    <LinearProgress
                        variant='determinate'
                        value={progress}
                        sx={{ mt: 0.5, height: 6, borderRadius: 4 }}
                        color={progress === 100 ? "success" : "primary"}
                    />
                )}
            </Box>
            <Tooltip title='Remover'>
                <IconButton onClick={() => removeFile(file.name)}>
                    <DeleteForeverOutlinedIcon
                        color={isValid ? "disabled" : "error"}
                        sx={{
                            "&:hover": {
                                color: "error.main",
                            },
                        }}
                    />
                </IconButton>
            </Tooltip>
        </Paper>
    );
}
