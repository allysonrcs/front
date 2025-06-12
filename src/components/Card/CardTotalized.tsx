import {
    CardContent,
    Grid,
    Stack,
    Typography,
    GridProps,
    CardProps as CardMuiProps,
    TypographyProps,
    CardContentProps,
    Box,
} from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";

type CardProps = {
    color?: string;
    colorTitle?: string;
    colorValue?: string;
    totalized?: string;
    name: string;
    borderColor?: boolean;
    cardProps?: CardMuiProps & React.HTMLAttributes<HTMLAnchorElement>;
    cardContentProps?: CardContentProps;
    labelProps?: TypographyProps;
    valueProps?: TypographyProps;
    children?: React.ReactNode;
    boxWidth?: string | number;
} & GridProps;

export const CardTotalized = ({
    color = "#c5c5c5",
    colorTitle = "text.primary",
    colorValue = "text.primary",
    totalized = "0",
    borderColor,
    name,
    cardProps,
    labelProps,
    cardContentProps,
    valueProps,
    children,
    boxWidth = "100%",
    ...props
}: CardProps) => {
    const { theme } = useGlobal();
    return (
        <Grid item {...props}>
            <Stack direction='row' justifyContent='space-evenly' textAlign='center'>
                <Box
                    component={"div"}
                    sx={{
                        width: boxWidth,
                        borderRadius: "16px",
                        border: theme === "light" ? "1px solid #E0E0E0" : "1px solid #1F3E45",
                        boxShadow:
                            theme === "light"
                                ? " rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                                : "none",
                    }}>
                    <Box {...cardProps}>
                        {borderColor && (
                            <Typography component='div' sx={{ backgroundColor: color, height: "0.3rem" }} />
                        )}
                        <CardContent sx={{ padding: 1, ":last-child": { paddingBottom: 1.5 } }} {...cardContentProps}>
                            {children ? (
                                children
                            ) : (
                                <Typography variant='h4' {...valueProps} color={colorValue}>
                                    {totalized}
                                </Typography>
                            )}
                            <Typography variant='body2' color={colorTitle} {...labelProps}>
                                {name}
                            </Typography>
                        </CardContent>
                    </Box>
                </Box>
            </Stack>
        </Grid>
    );
};
