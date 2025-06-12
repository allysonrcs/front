import { Box, BoxProps, Typography, Divider, Grid, IconButton, SxProps } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useGlobal } from "@/contexts/GlobalContext";

const style: SxProps = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: 24,
    pt: 3,
    px: 4,
    pb: 4,
    borderRadius: 2,
};

type BoxModalProps = BoxProps & {
    title?: string;
    children: React.ReactNode;
    handleClose?: () => void;
};

export function BoxModal({ title, children, handleClose, ...props }: BoxModalProps) {
    const { theme } = useGlobal();

    return (
        <Box
            className='boxmodal-container'
            sx={{ ...style, background: theme === "light" ? "#ffffff" : "linear-gradient(135deg, #051b1f, #0c2e33)" }}
            {...props}>
            <Grid container sx={{ justifyContent: title ? "space-between" : "flex-end", flexWrap: "nowrap" }}>
                {title && (
                    <Box paddingX={1} display='flex' alignItems='center' gap={1}>
                        <Typography
                            sx={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                            overflow='hidden'
                            whiteSpace='normal'
                            textOverflow='ellipses'
                            textTransform='uppercase'
                            fontWeight={550}>
                            {title}
                        </Typography>
                    </Box>
                )}

                {handleClose && (
                    <IconButton component='span' onClick={handleClose}>
                        <CloseRoundedIcon />
                    </IconButton>
                )}
            </Grid>
            {title && <Divider />}
            <Box mt={4}>{children}</Box>
        </Box>
    );
}
