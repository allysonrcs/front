import { Grid, IconButton, Input, SxProps, TextFieldProps, Typography } from "@mui/material";
import { Controller, get } from "react-hook-form";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { formatBytes } from "../../functions/number";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

type UploadFileProps = {
    cleanFile: () => void;
    control: any;
    errors: any;
    name: string;
    file?: {
        id?: number;
        type: string;
        size: number;
        name: string;
    };
    accept?: string;
    styleContainer?: SxProps;
    icons?: "inherit" | "default" | "info" | "primary" | "secondary" | "error" | "success" | "warning" | undefined;
    multipleFile?: boolean;
    download?: () => void;
} & TextFieldProps;

const defaultText = {
    color: "#706969",
    fontSize: "0.9rem",
};

const defaultStyle: SxProps = {
    borderRadius: "0.5rem",
    boxShadow: "0.5px 1.5px 5px 1px rgb(64 60 67 / 16%)",
    padding: "0.5rem",
    minHeight: "5rem",
};

export function UploadFileBanner({
    accept = "/*",
    styleContainer = defaultStyle,
    icons = "info",
    control,
    file,
    name,
    cleanFile,
    download,
    errors,
    multipleFile = false,
}: UploadFileProps) {
    const error = get(errors, name);

    return (
        <>
            {!file && (
                <Grid item container justifyContent='center' sx={styleContainer}>
                    <label htmlFor='icon-button-file' style={{ textAlign: "center", cursor: "pointer" }}>
                        <Controller
                            name={name}
                            control={control}
                            defaultValue={undefined}
                            render={({ field }) => (
                                <Input
                                    type='file'
                                    inputProps={{ accept, multiple: multipleFile }}
                                    id='icon-button-file'
                                    onChange={(e: any) => {
                                        field.onChange(e.target.files);
                                    }}
                                    style={{ display: "none" }}
                                />
                            )}
                        />
                        <IconButton color={icons} sx={{ padding: 0 }} aria-label='upload picture' component='span'>
                            <CloudUploadRoundedIcon sx={{ width: "2.5rem", height: "2.5rem" }} />
                        </IconButton>
                        <Typography sx={defaultText}>Anexe arquivo aqui</Typography>
                        {error ? <Typography color='error'>{error.message}</Typography> : null}
                    </label>
                </Grid>
            )}

            {file && (
                <Grid item container justifyContent='space-around' alignItems='center' sx={styleContainer}>
                    {download !== undefined && (
                        <Grid item>
                            <IconButton
                                title='download'
                                color={icons}
                                aria-label='download file'
                                component='span'
                                onClick={download}>
                                <DownloadRoundedIcon />
                            </IconButton>
                        </Grid>
                    )}

                    <Grid item display={"inline-block"}>
                        <label style={defaultText}>Nome: </label>
                        <Typography display={"inline-block"} component='p' title={file.name}>
                            {file.name.length > 30 ? file.name.substring(0, 30) + "..." : file.name}
                        </Typography>
                    </Grid>
                    <Grid item display={"inline-block"}>
                        <label style={defaultText}>Tamanho: </label>
                        <Typography display={"inline-block"} component='p' title={formatBytes(file.size)}>
                            {formatBytes(file.size)}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <label style={defaultText}>Tipo do Arquivo: </label>
                        <Typography display={"inline-block"} component='p' title={file.type}>
                            {file.type.length > 30 ? file.type.substring(0, 30) + "..." : file.type}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <IconButton
                            title='Remover Arquivo'
                            color='error'
                            aria-label='upload file'
                            component='span'
                            onClick={cleanFile}>
                            <CancelRoundedIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            )}
        </>
    );
}
