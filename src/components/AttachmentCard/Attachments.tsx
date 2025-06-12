import FilePresentIcon from "@mui/icons-material/FilePresent";
import { Grid, IconButton, SxProps, Typography, useTheme } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

let sxFile: SxProps = {
    padding: "0.3rem 0.5rem",
    borderRadius: "0.3rem",
    display: "inline-flex",
    gap: "1rem",
    alignItems: "center",
};

type AttachmentsProps = {
    name: string;
    downAction?: () => void;
    deleteAction?: () => void;
};

export const Attachments = ({ name, downAction, deleteAction }: AttachmentsProps) => {
    const theme = useTheme();

    sxFile = { ...sxFile, backgroundColor: `${theme.palette.background.default}` };

    return (
        <Grid item sx={sxFile}>
            <Grid
                container
                gap={1.5}
                padding={"8px"}
                sx={downAction ? { cursor: "pointer" } : undefined}
                title={downAction ? "Clique para fazer download" : undefined}
                onClick={() => {
                    downAction && downAction();
                }}>
                <FilePresentIcon />

                <Typography textAlign='center' noWrap>
                    {name}
                </Typography>
            </Grid>

            {deleteAction && (
                <IconButton
                    title='Remover anexo'
                    onClick={() => {
                        deleteAction();
                    }}>
                    <DeleteIcon color='error' />
                </IconButton>
            )}
        </Grid>
    );
};
