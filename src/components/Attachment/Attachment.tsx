import FilePresentIcon from "@mui/icons-material/FilePresent";
import { Grid, IconButton, SxProps, Theme, useTheme } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

let sxFile: SxProps = {
    padding: "0.3rem 0.5rem",
    width: "100%",
    borderRadius: "0.3rem",
    display: "inline-flex",
    gap: "1rem",
    alignItems: "center",
};

type AttachmentsProps = {
    name: string;
    downAction?: () => void;
    deleteAction?: () => void;
    sx?: SxProps<Theme>;
};

export const Attachment = ({ name, downAction, deleteAction, sx }: AttachmentsProps) => {
    const theme = useTheme();

    sxFile = {
        ...sxFile,
        backgroundColor: `${theme.palette.background.default}`,
    };

    return (
        <Grid sx={[{ ...sxFile }, ...(Array.isArray(sx) ? sx : [sx])]}>
            <Grid
                container
                display='flex'
                flexDirection='row'
                overflow='hidden'
                flex='1'
                alignItems='center'
                gap={1.5}
                padding={"8px"}
                sx={downAction ? { cursor: "pointer" } : undefined}
                title={downAction ? "Clique para fazer download" : undefined}
                onClick={() => {
                    downAction && downAction();
                }}>
                <FilePresentIcon style={{ color: `${theme.palette.primary.main}` }} />

                <span
                    style={{
                        flex: "1",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        flexWrap: "nowrap",
                    }}>
                    {name}
                </span>
            </Grid>

            {deleteAction && (
                <IconButton title='Remover anexo' onClick={deleteAction}>
                    <DeleteIcon color='error' />
                </IconButton>
            )}
        </Grid>
    );
};
