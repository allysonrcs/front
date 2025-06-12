import { Chart } from "@/components/Charts/ECharts/chart";
import { Box, Grid, Paper, SxProps, Typography, useTheme } from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";
import { formatNumberWithThousandsSeparator } from "@/functions/number";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import { useEffect, useState } from "react";
import {
    getDashboardProductivityDailyTotalizer,
    IDashboardProductivityDailyTotalizer,
} from "@/services/productivities-control";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";

type InsightsPanelProps = {
    isThemeLight: boolean;
    colorBorderSystem: string;
    isSidebarOpen: boolean;
};

export function ProductivityDailyCardsPanel({ isThemeLight, colorBorderSystem }: InsightsPanelProps) {
    const [loadingProductivity, setLoadingProductivity] = useState<boolean>(false);
    const [dashboard, setDashboard] = useState<IDashboardProductivityDailyTotalizer>();

    const { getInfoError } = useGlobal();

    const theme = useTheme();

    const onRefreshProductivity = async () => {
        try {
            await searchDashboardProductivityDailyTotalizer();

            toast.success("Dados da Produção atualizado com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    async function searchDashboardProductivityDailyTotalizer() {
        try {
            setLoadingProductivity(true);

            const dataDashboard = await getDashboardProductivityDailyTotalizer({
                is_active: true,
                only_current_month: true,
            });

            setDashboard(dataDashboard);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setTimeout(() => {
                setLoadingProductivity(false);
            }, 1500);
        }
    }

    useEffect(() => {
        async function execute() {
            await searchDashboardProductivityDailyTotalizer();
        }

        execute();
    }, []);

    const getChartColor = (type: "aprovados" | "reprovados" | "correcoes" | "pendentes") => {
        switch (type) {
            case "aprovados":
                return "#21D87D";
            case "reprovados":
                return "#F94C4A";
            case "correcoes":
                return "#2186C3";
            case "pendentes":
                return "#fcdb58";
            default:
                return "#292929";
        }
    };

    const generateChartOptions = (
        achievementPercentage: number,
        type: "aprovados" | "reprovados" | "correcoes" | "pendentes",
    ) => ({
        title: {
            text: `${achievementPercentage.toFixed(2)}%`,
            left: "center",
            top: "center",
            textStyle: {
                fontSize: 11,
                fontWeight: "bold",
                color: isThemeLight ? "#000" : "#fff",
            },
        },
        series: [
            {
                type: "pie",
                radius: ["100%", "80%"],
                avoidLabelOverlap: false,
                label: { show: false },
                emphasis: { label: { show: false } },
                data: [
                    {
                        value: achievementPercentage,
                        name: "Progresso",
                        itemStyle: { color: getChartColor(type), borderRadius: 2 },
                    },
                    {
                        value: 100 - Math.min(achievementPercentage, 100),
                        name: "Faltante",
                        itemStyle: { color: colorBorderSystem },
                    },
                ],
            },
        ],
    });

    const SxPaperProps: SxProps = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        flexGrow: 1,
        padding: 2.5,
        overflow: "auto",
        border: `1px solid ${colorBorderSystem}`,
        borderRadius: 4,
        background: isThemeLight ? "#ffffff" : "linear-gradient(135deg, #071d20, #0A2A2F)",
        boxShadow: isThemeLight
            ? "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
            : "none",
        transition: "0.3s",
        "&:hover": {
            boxShadow: "rgba(145, 158, 171, 0.2) 0px 5px 4px 0px, rgba(145, 158, 171, 0.12) 0px 4px 8px -4px",
        },
        "&::-webkit-scrollbar": {
            height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: colorBorderSystem,
        },
    };

    return (
        <>
            <Grid container minHeight={"100%"} spacing={2}>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    position={"relative"}
                    sx={{
                        "&:hover .updateButton": {
                            opacity: 1,
                            visibility: "visible",
                            transform: "translateY(0)",
                        },
                    }}>
                    <Box
                        className='updateButton'
                        position='absolute'
                        display='flex'
                        alignItems='center'
                        sx={{
                            borderRadius: 2,
                            top: -15,
                            left: 15,
                            opacity: 0,
                            visibility: "hidden",
                            transform: "translateY(10px)",
                            transition: "opacity 0.3s ease, transform 0.3s ease",
                        }}>
                        <LoadingButton
                            onClick={() => {
                                onRefreshProductivity();
                            }}
                            color='primary'
                            size='small'
                            loading={loadingProductivity}
                            startIcon={<AutorenewOutlinedIcon />}
                            aria-label='Atualizar'>
                            Atualizar
                        </LoadingButton>
                    </Box>
                    <LinkRouter to={"/controle-produtividades/produtividade-diaria"} style={{ width: "100%" }}>
                        <Paper sx={SxPaperProps}>
                            <Box
                                position={"absolute"}
                                display={"flex"}
                                alignItems='center'
                                mb={0.5}
                                sx={{
                                    backgroundColor: `${theme.palette.background.paper}`,
                                    border: `1px solid ${colorBorderSystem}`,
                                    p: 0.75,
                                    borderRadius: 2,
                                    top: 0,
                                    left: "44.5%",
                                }}>
                                <InsightsOutlinedIcon color='disabled' sx={{ mr: 0.5, fontSize: 20 }} />
                                <Typography variant='subtitle1' color='text.secondary' fontSize={10}>
                                    Produtividade Diária
                                </Typography>
                            </Box>
                            <Box
                                position={"absolute"}
                                display={"flex"}
                                alignItems='center'
                                mb={0.5}
                                sx={{
                                    p: 0.25,
                                    borderRadius: 2,
                                    bottom: 2.75,
                                    left: 22,
                                }}>
                                <CalendarMonthOutlinedIcon color='disabled' sx={{ mr: 0.5, fontSize: 16 }} />
                                <Typography
                                    variant='subtitle1'
                                    color='text.secondary'
                                    fontSize={9}
                                    title='Dados referentes ao mês atual'>
                                    {new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
                                        new Date(),
                                    )}
                                </Typography>
                            </Box>
                            {dashboard &&
                                (() => {
                                    const sumTotal =
                                        dashboard.approved +
                                        dashboard.failed +
                                        dashboard.correction +
                                        dashboard.pending;

                                    const data = [
                                        {
                                            title: "🟢 Aprovados",
                                            value: dashboard.approved,
                                            type: "aprovados",
                                            porcent: Number(((dashboard.approved / sumTotal) * 100).toFixed(2)),
                                        },
                                        {
                                            title: "🔴 Reprovados",
                                            value: dashboard.failed,
                                            type: "reprovados",
                                            porcent: Number(((dashboard.failed / sumTotal) * 100).toFixed(2)),
                                        },
                                        {
                                            title: "🔵 Correções",
                                            value: dashboard.correction,
                                            type: "correcoes",
                                            porcent: Number(((dashboard.correction / sumTotal) * 100).toFixed(2)),
                                        },
                                        {
                                            title: "🟡 Pendentes",
                                            value: dashboard.pending,
                                            type: "pendentes",
                                            porcent: Number(((dashboard.pending / sumTotal) * 100).toFixed(2)),
                                        },
                                    ];

                                    return data.map((item, index, array) => (
                                        <Box
                                            key={item.title}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flex: 1,
                                                padding: 2,
                                                borderRight:
                                                    index !== array.length - 1
                                                        ? `1px dashed ${colorBorderSystem}`
                                                        : "none",
                                            }}>
                                            <Box display='flex' alignItems='center' textAlign='center'>
                                                <Box width={65} height={60}>
                                                    <Chart
                                                        options={generateChartOptions(
                                                            item.porcent || 0,
                                                            item.type as any,
                                                        )}
                                                        height={60}
                                                    />
                                                </Box>
                                                <Box ml={2}>
                                                    <Typography variant='subtitle1' color='text.primary'>
                                                        {item.title}
                                                    </Typography>
                                                    <Typography variant='h5' color='text.secondary'>
                                                        {formatNumberWithThousandsSeparator(item.value)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ));
                                })()}
                        </Paper>
                    </LinkRouter>
                </Grid>
            </Grid>
        </>
    );
}
