import { Box, Paper, Typography, Divider, IconButton, BoxProps, Icon } from "@mui/material";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "@/contexts/GlobalContext";

type BoxMainProps = {
    title?: string;
    icon?: string;
    children: React.ReactNode;
    toolbar?: React.ReactNode;
    footer?: React.ReactNode;
    goBack?: boolean;
    isDivider?: boolean;
} & BoxProps;

export function BoxMain({ title, toolbar, children, footer, goBack, icon, isDivider = true, ...props }: BoxMainProps) {
    const navigate = useNavigate();
    const { colorBoxShadowSystem, colorBorderSystem, colorBackgroundSystem } = useGlobal();

    return (
        <Box
            margin={2}
            padding={2}
            flexDirection='column'
            component={Paper}
            sx={{
                borderRadius: "16px",
                border: `1px solid ${colorBorderSystem}`,
                background: colorBackgroundSystem,
                boxShadow: colorBoxShadowSystem,
            }}
            gap={1}
            {...props}>
            <Box paddingX={1} display='flex' alignItems='center' gap={1}>
                {goBack && (
                    <IconButton
                        sx={{ padding: 0 }}
                        color='primary'
                        component='span'
                        onClick={() => {
                            navigate(-1);
                        }}>
                        <ArrowCircleLeftOutlinedIcon />
                    </IconButton>
                )}
                {icon && <Icon color='primary'>{icon}</Icon>}
                <Typography
                    overflow='hidden'
                    whiteSpace='nowrap'
                    textOverflow='ellipses'
                    textTransform='uppercase'
                    fontWeight={500}>
                    {title}
                </Typography>
            </Box>

            {isDivider && (
                <Divider sx={{ borderColor: colorBorderSystem, borderStyle: "dashed", mt: 0.75, ml: 0.75, mr: 0.75 }} />
            )}

            {toolbar && <> {toolbar} </>}

            <Box flex={1} padding={1} overflow='auto'>
                {children}
            </Box>

            {footer && <> {footer} </>}
        </Box>
    );
}
