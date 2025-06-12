import Drawer, { DrawerProps } from "@mui/material/Drawer";
import { Box, SxProps, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

type TemporaryDrawerProps = {
    title?: string;
    children?: React.ReactNode;
    closeButton?: () => void;
} & DrawerProps;

const sxBox: SxProps = {
    display: "inline-flex",
    gap: "1rem",
    alignItems: "center",
    margin: "1rem",
};

const sxBoxTypography: SxProps = {
    padding: 1,
    borderRadius: "0.25rem",
    boxShadow: "none",
    display: "inline-flex",
    justifyContent: "space-between",
    width: "100%",
};

const sxCloseRoundedIcon: SxProps = {
    display: "flex",
    "&:hover": {
        borderRadius: "0.2rem",
        cursor: "pointer",
        color: "#009688",
    },
};

export function TemporaryDrawer({ children, title, closeButton, ...props }: TemporaryDrawerProps) {
    return (
        <Drawer anchor={"right"} {...props}>
            {(!!closeButton || !!title) && (
                <Box sx={sxBox}>
                    {closeButton && <CloseRoundedIcon onClick={closeButton} sx={sxCloseRoundedIcon} />}
                    {title && (
                        <Box sx={sxBoxTypography}>
                            <Typography
                                overflow='hidden'
                                whiteSpace='normal'
                                textOverflow='ellipses'
                                textTransform='uppercase'
                                fontWeight={900}>
                                {title}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
            {children}
        </Drawer>
    );
}
