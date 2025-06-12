import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Breadcrumbs, Grid, Link, Skeleton, Typography } from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import StackedBarChartOutlinedIcon from "@mui/icons-material/StackedBarChartOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { ISearchAllReportsCatalog, searchOneReportsCatalogDashboardById } from "@/services/reports";
import { Link as LinkRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";
// import { PowerBIEmbed } from "powerbi-client-react";
// import { models } from "powerbi-client";
// import { getEmbedConfig } from "@/services/powerbi";
// import "./DashboardBi.css";

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

export type PortfoliosMigrationProps = {
    status_finished?: AutoCompleteString;
    status_validation_destiny?: AutoCompleteString;
    collaborators?: AutoCompleteNumber;
    date_search?: AutoCompleteString;
    date_start?: Date | null;
    date_end?: Date | null;
    is_active?: AutoCompleteBoolean;
};

export function DashboardBi() {
    const [loading, setLoading] = useState(false);
    const [dataDashboardBi, setDataDashboardBi] = useState<ISearchAllReportsCatalog>();
    // const [embedConfig, setEmbedConfig] = useState<{
    //     embedToken: string;
    //     embedUrl: string;
    //     reportId: string;
    // } | null>(null);

    const { getInfoError, colorBorderSystem, theme } = useGlobal();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const isThemeLight = theme === "light";
    const currentURL = window.location.href;
    const url = new URL(currentURL);

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    setLoading(true);
                    const dataCatalogDashboard = await searchOneReportsCatalogDashboardById(Number(id));
                    setDataDashboardBi(dataCatalogDashboard);
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [id]);

    // useEffect(() => {
    //     const fetchEmbedConfig = async () => {
    //         if (dataDashboardBi?.id) {
    //             try {
    //                 setLoading(true);

    //                 const powerbiEmbedData = await getEmbedConfig(dataDashboardBi.id);

    //                 setEmbedConfig(powerbiEmbedData);
    //             } catch (error) {
    //                 toast.error("Falha ao carregar configurações do Power BI.");
    //             } finally {
    //                 setLoading(false);
    //             }
    //         }
    //     };

    //     fetchEmbedConfig();
    // }, [dataDashboardBi]);

    // Bloqueia F12, Ctrl+Shift+I e Ctrl+U
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === "F12") {
                event.preventDefault();
            }
            if (
                (event.ctrlKey && event.shiftKey && event.code === "KeyI") ||
                (event.ctrlKey && event.code === "KeyU")
            ) {
                event.preventDefault();
            }
        };

        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("contextmenu", handleContextMenu);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

    return (
        <>
            <Grid container justifyContent='center' alignItems='center' mt={1} wrap='wrap' paddingInline={2}>
                <Grid item md={12} mt={0.5}>
                    <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
                        <Breadcrumbs aria-label='breadcrumb' separator='›'>
                            <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }}>
                                <StackedBarChartOutlinedIcon
                                    sx={{ color: isThemeLight ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }}
                                />
                                <Typography color='text.primary' sx={{ mt: 0.5 }}>
                                    Relatórios
                                </Typography>
                            </Typography>

                            <Link
                                color='text.primary'
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    "&:hover": {
                                        color: "primary.main",
                                    },
                                }}
                                underline='none'
                                onClick={() => {
                                    navigate("/relatorios/catalogo");
                                }}>
                                Catálogo
                            </Link>

                            <Typography sx={{ color: "text.secondary" }}>
                                {dataDashboardBi ? dataDashboardBi.title : ""}
                            </Typography>
                        </Breadcrumbs>

                        {dataDashboardBi && url.pathname && (
                            <CSATAverageRating
                                module={`Dashboard | ${dataDashboardBi.title}`}
                                routePath={`${url.pathname || dataDashboardBi.route}`}
                                isClickable
                                formProps={{
                                    module: `Dashboard | ${dataDashboardBi.title}`,
                                    routePath: `${url.pathname || dataDashboardBi.route}`,
                                }}
                            />
                        )}
                    </Box>
                </Grid>
            </Grid>

            <Grid container mt={-1} p={2}>
                <Grid item xs={12}>
                    {loading ? (
                        <Grid item xs={12}>
                            <Skeleton variant='rounded' animation='wave' height={900} sx={{ borderRadius: 4 }} />
                        </Grid>
                    ) : dataDashboardBi && dataDashboardBi.powerbi_link ? (
                        <Box
                            component='iframe'
                            src={dataDashboardBi.powerbi_link}
                            title={dataDashboardBi.title}
                            height={dataDashboardBi.powerbi_height || "900px"}
                            width='100%'
                            allowFullScreen
                            frameBorder='0'
                            borderRadius='16px'
                            border={`1px solid ${colorBorderSystem}`}
                            onError={() => {
                                toast.error("Falha ao carregar o relatório Power BI.");
                            }}
                        />
                    ) : (
                        <Grid container justifyContent='center'>
                            <Grid item>
                                <Typography
                                    color='error'
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    component='span'
                                    mt={2}
                                    mb={2}>
                                    <SearchOffOutlinedIcon color='disabled' sx={{ mr: 0.5 }} />
                                    Dashboard não encontrado
                                </Typography>
                                <LinkRouter to='/relatorios/catalogo'>
                                    <Typography
                                        sx={{
                                            color: "#00A494",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                        fontSize={18}
                                        component='span'>
                                        <ArrowCircleLeftOutlinedIcon sx={{ mr: 0.5 }} />
                                        Retornar para página do Catálogo
                                    </Typography>
                                </LinkRouter>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </Grid>

            {/* <Grid container mt={-1} p={2}>
                <Grid item xs={12}>
                    {loading || !embedConfig ? (
                        <Grid item xs={12}>
                            <Skeleton variant='rounded' animation='wave' height={900} sx={{ borderRadius: 4 }} />
                        </Grid>
                    ) : embedConfig ? (
                        <Box
                            sx={{
                                border: `1px solid ${colorBorderSystem}`,
                                borderRadius: "16px",
                                height: dataDashboardBi?.powerbi_height || "900px",
                            }}>
                            <PowerBIEmbed
                                embedConfig={{
                                    type: "report",
                                    id: embedConfig.reportId,
                                    embedUrl: embedConfig.embedUrl,
                                    accessToken: embedConfig.embedToken,
                                    tokenType: models.TokenType.Embed,
                                    settings: {
                                        panes: {
                                            filters: { expanded: false, visible: false },
                                            pageNavigation: { visible: true },
                                        },
                                    },
                                }}
                                cssClassName='report-container'
                            />
                        </Box>
                    ) : (
                        <Grid container justifyContent='center'>
                            <Grid item>
                                <Typography
                                    color='error'
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    component='span'
                                    mt={2}
                                    mb={2}>
                                    <SearchOffOutlinedIcon color='disabled' sx={{ mr: 0.5 }} />
                                    Dashboard não encontrado
                                </Typography>
                                <LinkRouter to='/relatorios/catalogo'>
                                    <Typography
                                        sx={{
                                            color: "#00A494",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                        fontSize={18}
                                        component='span'>
                                        <ArrowCircleLeftOutlinedIcon sx={{ mr: 0.5 }} />
                                        Retornar para página do Catálogo
                                    </Typography>
                                </LinkRouter>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </Grid> */}
        </>
    );
}
