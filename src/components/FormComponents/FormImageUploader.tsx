import { useEffect, useState } from "react";
import { Box, IconButton, Typography, Input, Avatar, LinearProgress, BoxProps } from "@mui/material";
import { Controller } from "react-hook-form";
import { formatBytes } from "@/functions/number";
import { toast } from "react-toastify";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import { useGlobal } from "@/contexts/GlobalContext";

type Props = {
    name: string;
    accept: string;
    control: any;
    error?: any;
    file?: File;
    cleanFile: () => void;
    validateFile?: boolean;
    maxSize?: number;
    maxSizeUnit?: "MB" | "KB";
    allowedTypes?: string[];
} & BoxProps;

export function FormImageUploader({
    name,
    accept,
    control,
    file,
    error,
    cleanFile,
    validateFile,
    maxSize,
    maxSizeUnit,
    allowedTypes,
    ...props
}: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const { redBlur, cyanBlur } = useGlobal();

    const isFileValid = (file: File): boolean => {
        if (!validateFile) return true;

        const unit = maxSizeUnit ?? "MB";
        const sizeLimit = maxSize ?? 5;
        const maxBytes = unit === "MB" ? sizeLimit * 1024 * 1024 : sizeLimit * 1024;

        const isTypeAllowed = (allowedTypes ?? ["image/gif", "image/jpeg", "image/png", "image/webp"]).includes(
            file.type,
        );
        const isSizeAllowed = file.size <= maxBytes;

        if (!isTypeAllowed) {
            const msgIsTypeAllowed = "Tipo de arquivo inválido! Tente algum desses: gif, jpeg, png, webp";

            setLocalError(msgIsTypeAllowed);
            toast.error(msgIsTypeAllowed);

            return false;
        }

        if (!isSizeAllowed) {
            const msgIsSizeAllowed = `Tamanho máximo permitido é ${sizeLimit}${unit}.`;

            setLocalError(msgIsSizeAllowed);
            toast.error(msgIsSizeAllowed);

            return false;
        }

        setLocalError(null);
        return true;
    };

    useEffect(() => {
        if (file instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }, [file]);

    return (
        <Controller
            name={name}
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
                <label htmlFor='image-upload-field'>
                    <Box
                        position='relative'
                        width='100%'
                        height={200}
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        flexDirection='column'
                        border={isDragging ? "2px dashed" : !preview ? "2px dashed" : "none"}
                        borderColor={isDragging ? "#009688" : "#ccc"}
                        borderRadius={2}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const droppedFile = e.dataTransfer.files?.[0];
                            if (droppedFile && isFileValid(droppedFile)) {
                                field.onChange(droppedFile);
                            }
                        }}
                        sx={{
                            cursor: "pointer",
                            overflow: "hidden",
                            backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                            backgroundRepeat: "no-repeat, no-repeat",
                            backgroundSize: "50%, 50%",
                            backgroundPosition: "right top, left bottom",
                            "&:hover": {
                                borderColor: "#009688",
                            },
                        }}
                        {...props}>
                        <Input
                            type='file'
                            inputProps={{ accept }}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const selectedFile = e.target.files?.[0];

                                if (selectedFile && isFileValid(selectedFile)) {
                                    field.onChange(selectedFile);
                                }
                            }}
                            style={{ display: "none" }}
                            id='image-upload-field'
                        />

                        {!preview ? (
                            <>
                                <IconButton component='span'>
                                    <AddPhotoAlternateIcon sx={{ fontSize: 48, color: "#ccc" }} />
                                </IconButton>

                                <Typography color='text.secondary'>
                                    Clique ou arraste e solte para enviar uma imagem
                                </Typography>
                                {error && (
                                    <Typography color='error' fontSize={12} mt={1}>
                                        {error.message}
                                    </Typography>
                                )}

                                {localError && (
                                    <Typography color='error' fontSize={12} mt={1}>
                                        {localError}
                                    </Typography>
                                )}
                            </>
                        ) : (
                            <>
                                <Avatar
                                    variant='rounded'
                                    src={preview}
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: 2,
                                    }}>
                                    <ImageNotSupportedOutlinedIcon sx={{ fontSize: 48 }} />
                                </Avatar>
                                <Box
                                    position='absolute'
                                    bottom={0}
                                    width='100%'
                                    bgcolor='rgba(0,0,0,0.6)'
                                    color='#fff'
                                    px={2}
                                    py={1}
                                    display='flex'
                                    justifyContent='space-between'
                                    alignItems='center'
                                    onClick={(e) => {
                                        e.preventDefault();
                                    }}
                                    sx={{ cursor: "default", zIndex: 1000 }}>
                                    <Box>
                                        <Typography fontSize={12}>
                                            <b>Nome:</b> <span style={{ color: "#ccc" }}>{file?.name}</span>
                                        </Typography>
                                        <Typography fontSize={12}>
                                            <b>Tamanho:</b>{" "}
                                            <span style={{ color: "#ccc" }}>{formatBytes(file?.size || 0)}</span>
                                        </Typography>
                                        <Typography fontSize={12}>
                                            <b>Tipo:</b> <span style={{ color: "#ccc" }}>{file?.type}</span>
                                        </Typography>
                                    </Box>
                                    <IconButton onClick={cleanFile} color='error' size='small' title='Deletar'>
                                        <CancelRoundedIcon fontSize='small' />
                                    </IconButton>
                                </Box>
                            </>
                        )}

                        {isUploading && (
                            <Box width='100%' position='absolute' bottom={-18} zIndex={2000}>
                                <LinearProgress variant='determinate' value={progress} sx={{ height: 6 }} />
                                <Typography fontSize={12} align='center'>
                                    {progress}%
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </label>
            )}
        />
    );
}
