import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "@/contexts/GlobalContext";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { BannersFields } from "./banners/BannersFields";
import {
    Box,
    Breadcrumbs,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Collapse,
    Divider,
    Grid,
    Icon,
    Link,
    SxProps,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import backGroundImageCard from "@/assets//images/report/report-bg-dashboard.jpg";
import { formatDate } from "@/functions/date";

export function ListRecordsHomePageConfig() {
    const [edit, setEdit] = useState(false);

    const { colorBorderSystem, colorBackgroundSystem, colorBoxShadowSystem, theme, redBlur, cyanBlur } = useGlobal();
    const navigate = useNavigate();
    const themeContext = useTheme();

    const isMobile = useMediaQuery(themeContext.breakpoints.down("sm"));
    const isThemeLight = theme === "light";

    const handleNewRegister = () => {
        navigate("/funcoes-administrativas/pagina-inicial/banners");
    };

    const gridArchiveProps: SxProps = {
        transition: "0.3s",
        "&:hover": {
            transform: "translateY(-08px)",
        },
        paddingBottom: isMobile ? "5px" : "0",
    };

    return (
        <>
            <Grid container justifyContent='center' mt={-1} padding={2}>
                <Grid item xs={12} md={12} mt={0.5}>
                    <Breadcrumbs aria-label='breadcrumb' separator='›'>
                        <Link
                            color='text.primary'
                            sx={{ display: "inline-flex", alignItems: "center" }}
                            underline='none'>
                            <SettingsOutlinedIcon sx={{ color: isThemeLight ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                            <Typography color='text.primary' sx={{ mt: 0.5 }}>
                                Funções Administrativas
                            </Typography>
                        </Link>
                        <Typography sx={{ color: "text.secondary" }}>Página Inicial</Typography>
                    </Breadcrumbs>
                </Grid>

                <Divider
                    sx={{
                        borderColor: colorBorderSystem,
                        borderStyle: "dashed",
                        width: "100%",
                        ml: 0.75,
                        mr: 0.75,
                        mb: 1,
                    }}
                />

                <Box display='flex' flex={1} flexDirection='column' padding={1} mb={3}>
                    <Grid item xs={12} md={12} mb={3}>
                        <Typography fontSize={18} fontWeight={700}>
                            Configuração de Banners
                        </Typography>
                    </Grid>

                    <Grid container spacing={2} justifyContent='flex-start' alignItems='stretch'>
                        <Grid item sx={gridArchiveProps} xs={12} sm={6} md={4} lg={4} xl={4}>
                            <Tooltip title={"Configuração de Banner"}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: "8px",
                                        border: `1px solid ${colorBorderSystem}`,
                                        background: colorBackgroundSystem,
                                        boxShadow: colorBoxShadowSystem,
                                    }}>
                                    <CardActionArea onClick={handleNewRegister}>
                                        <Box position='relative'>
                                            {false ? (
                                                <CardMedia
                                                    component='img'
                                                    height='70px'
                                                    image={backGroundImageCard}
                                                    alt='Imagem de Capa'
                                                />
                                            ) : (
                                                <Box
                                                    height='70px'
                                                    sx={{
                                                        backgroundImage: "linear-gradient(to right, #0e3b8f, #067fa3)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "white",
                                                        fontSize: "1.5rem",
                                                        fontWeight: "bold",
                                                        position: "relative",
                                                    }}
                                                />
                                            )}
                                            <>
                                                {false && (
                                                    <Box
                                                        position='absolute'
                                                        bottom={8}
                                                        right={8}
                                                        bgcolor='rgba(0, 0, 0, 0.6)'
                                                        color='white'
                                                        padding='4px 8px'
                                                        borderRadius='4px'
                                                        fontSize='1rem'>
                                                        {-123}
                                                    </Box>
                                                )}

                                                <Box
                                                    position='absolute'
                                                    top={2}
                                                    left={2}
                                                    color='white'
                                                    padding='4px 8px'
                                                    borderRadius='4px'
                                                    fontSize='1rem'>
                                                    <Icon className='material-icons-outlined'>view_carousel_Icon</Icon>
                                                </Box>
                                            </>
                                        </Box>
                                        <CardContent
                                            sx={{
                                                background: colorBackgroundSystem,
                                                backdropFilter: "blur(25px)",
                                                backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                                                backgroundRepeat: "no-repeat, no-repeat",
                                                backgroundSize: "50%, 50%",
                                                backgroundPosition: "right top, left bottom",
                                            }}>
                                            <Box>
                                                <Typography
                                                    variant='body2'
                                                    fontSize='0.90rem'
                                                    color='text.primary'
                                                    textOverflow='ellipses'
                                                    noWrap>
                                                    Banners
                                                </Typography>
                                                <Typography
                                                    width='100%'
                                                    maxWidth='400px'
                                                    minWidth='150px'
                                                    variant='body2'
                                                    fontSize='0.8rem'
                                                    color='text.secondary'
                                                    textOverflow='ellipses'
                                                    noWrap>
                                                    Área de configuração dos banners da página inicial do SING
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                    <Collapse in={false}>
                                        <>
                                            <Divider
                                                sx={{
                                                    width: "100%",
                                                    borderColor: colorBorderSystem,
                                                    borderStyle: "dashed",
                                                    mt: 0.07,
                                                }}
                                            />
                                            <Box
                                                padding={1}
                                                display='flex'
                                                justifyContent='space-between'
                                                alignItems='center'
                                                title={`Data Atualização: ${formatDate("2025-04-08T16:10:10", "DD/MM/YYYY HH:mm:ss")}`}>
                                                <Box
                                                    sx={{
                                                        cursor: "default",
                                                        mr: 0.5,
                                                    }}>
                                                    <Typography
                                                        component={"span"}
                                                        color='text.secondary'
                                                        fontSize={9}
                                                        title='Data Criação'>
                                                        {formatDate("2025-04-08T16:10:10", "DD/MM/YYYY HH:mm") || ""}
                                                    </Typography>
                                                    <Typography
                                                        component={"span"}
                                                        color='text.secondary'
                                                        ml={1}
                                                        title='Posição do Card'>
                                                        {"0"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </>
                                    </Collapse>
                                </Card>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Box>
            </Grid>

            <TemporaryDrawer
                open={edit}
                title='Setor'
                sx={{
                    "& .MuiDrawer-paperAnchorRight": {
                        width: isMobile ? "100%" : "70%",
                    },
                    "& .MuiModal-backdrop": {
                        backgroundColor: "rgb(0 0 0 / 30%)",
                    },
                    "& .MuiDrawer-paper": {
                        background: colorBackgroundSystem,
                        borderLeft: `1px solid ${colorBorderSystem}`,
                        backdropFilter: "blur(25px)",
                        backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                        backgroundRepeat: "no-repeat, no-repeat",
                        backgroundSize: "50%, 50%",
                        backgroundPosition: "right top, left bottom",
                    },
                }}
                closeButton={() => {
                    setEdit((prev) => !prev);
                }}>
                <BannersFields />
            </TemporaryDrawer>
        </>
    );
}
