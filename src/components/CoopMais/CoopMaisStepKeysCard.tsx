import { Box, Paper, Typography, Grid, useMediaQuery, BoxProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { formatNumberWithThousandsSeparatorComma } from "@/functions/number";
import { useGlobal } from "@/contexts/GlobalContext";
import { Chart } from "@/components/Charts/ECharts/chart";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import moment from "moment";

type CoopMaisStepKeysProps = {
    borderColor: string;
    title: string;
    currentValue: number;
    goalValue: number;
    labelValue?: string;
    targetDateTop?: string;
    targetDateBottom?: string;
    achievementPercentage: number;
    weight: number;
    points: number;
    chartLine?: boolean;
    isInverse?: boolean;
} & BoxProps;

export function CoopMaisStepKeysCard({
    borderColor,
    title,
    currentValue,
    goalValue,
    labelValue,
    targetDateTop,
    targetDateBottom,
    achievementPercentage,
    weight,
    points,
    chartLine = false,
    isInverse = false,
    ...props
}: CoopMaisStepKeysProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("xl"));
    const { isSidebarOpen, theme: themeContext, colorBorderSystem } = useGlobal();

    const isLight = themeContext === "light";
    const isSuccess = isInverse ? currentValue < goalValue : currentValue >= goalValue;
    const icon = isSuccess ? (
        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: theme.palette.success.main, ml: 0.5 }} />
    ) : (
        <ErrorOutlineIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
    );

    const getProgressColor = () => {
        if (achievementPercentage < 50) return theme.palette.info.light;
        if (achievementPercentage < 60) return theme.palette.warning.light;
        if (achievementPercentage < 100) return theme.palette.success.light;
        return theme.palette.primary.light;
    };

    const pieChartOptions = {
        tooltip: {
            trigger: "item",
            formatter: (params: any) => {
                const val = parseFloat(params.value).toFixed(2);
                return `${params.marker} ${params.name} ${val}%`;
            },
            textStyle: {
                color: isLight ? "#011216" : "#ffffff",
            },
            backgroundColor: isLight ? "#ffffff" : "#00161b",
        },
        title: {
            text: `${achievementPercentage.toFixed(2)}%`,
            left: "center",
            top: "center",
            textStyle: {
                fontSize: 14,
                fontWeight: "bold",
                color: isLight ? "#000" : "#fff",
            },
        },
        series: [
            {
                type: "pie",
                radius: ["100%", "75%"],
                avoidLabelOverlap: false,
                label: { show: false },
                emphasis: { label: { show: false } },
                data: [
                    {
                        value: achievementPercentage,
                        name: "Progresso",
                        itemStyle: { color: getProgressColor(), borderRadius: 2 },
                    },
                    {
                        value: 100 - Math.min(achievementPercentage, 100),
                        name: "Faltante",
                        itemStyle: { color: colorBorderSystem },
                    },
                ],
            },
        ],
    };

    const lineChartOptions = {
        xAxis: {
            type: "category",
            show: false,
        },
        yAxis: {
            type: "value",
            show: false,
        },
        series: [
            {
                type: "line",
                smooth: true,
                data: [Math.random() * 100, Math.random() * 100],
                lineStyle: {
                    color: theme.palette.primary.main,
                },
                symbol: "circle",
                symbolSize: 8,
            },
        ],
        tooltip: {
            trigger: "axis",
        },
        grid: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
    };

    return (
        <Box
            component={Paper}
            padding={1}
            sx={{
                flex: 1,
                border: `1px solid ${borderColor}`,
                borderRadius: "16px",
                background: theme.palette.mode === "light" ? "#ffffff" : "linear-gradient(135deg, #071d20, #0A2A2F)",
                boxShadow:
                    theme.palette.mode === "light"
                        ? "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                        : "none",
            }}
            {...props}>
            <Typography
                title={title}
                fontWeight='bold'
                fontSize={!isSidebarOpen ? 16 : 14}
                textAlign='center'
                overflow='hidden'
                whiteSpace='nowrap'
                textOverflow='ellipses'
                sx={{
                    background: getProgressColor(),
                    color: "#fff",
                    padding: "8px",
                    borderRadius: "8px",
                }}>
                {title}
            </Typography>

            <Box textAlign='center' mt={1}>
                <Box display='flex' justifyContent='center' alignItems='center' gap={0.25}>
                    <Typography
                        title={formatNumberWithThousandsSeparatorComma(currentValue)}
                        component={"span"}
                        fontSize={!isSidebarOpen ? 15 : 13}
                        fontWeight='bold'
                        color={isSuccess ? "primary" : "text.primary"}
                        overflow='hidden'
                        whiteSpace='nowrap'
                        textOverflow='ellipses'>
                        {formatNumberWithThousandsSeparatorComma(currentValue)}
                    </Typography>
                    <Typography component={"span"} fontSize={12}>
                        {icon}
                    </Typography>
                </Box>

                <Typography
                    fontSize={!isSidebarOpen ? 12 : 11}
                    color='text.secondary'
                    overflow='hidden'
                    whiteSpace='nowrap'
                    textOverflow='ellipses'>
                    {isSidebarOpen || isMobile ? "" : "Meta:"} {formatNumberWithThousandsSeparatorComma(goalValue)}
                </Typography>

                {targetDateTop && (
                    <Grid item textAlign='center' xs={12} mt={0.5}>
                        <Typography fontSize={11} color='text.secondary'>
                            {moment(targetDateTop, ["YYYY-MM-DD", "YYYY-MM"]).format(
                                targetDateTop.length === 10 ? "DD/MM/YYYY" : "MM/YYYY",
                            )}
                        </Typography>
                    </Grid>
                )}
            </Box>

            {chartLine && (
                <Box height={40} mt={1}>
                    <Chart options={lineChartOptions} height={40} />
                </Box>
            )}

            {labelValue && (
                <Typography fontSize={14} fontWeight='bold' textAlign='center' color='text.primary' mt={1}>
                    {labelValue}
                </Typography>
            )}

            <Box display='flex' justifyContent='center' alignItems='center' mt={1} gap={2}>
                <Box width={90} height={90}>
                    <Chart options={pieChartOptions} height={90} />
                </Box>
            </Box>

            <Grid container justifyContent='space-between' alignItems='center' mt={1}>
                <Grid item xs='auto' ml={1}>
                    <Typography fontSize={!isSidebarOpen ? 12 : 10} color='text.secondary'>
                        Peso
                    </Typography>
                    <Typography fontSize={!isSidebarOpen ? 14 : 12} fontWeight='bold' color='text.primary'>
                        {weight}
                    </Typography>
                </Grid>

                <Grid item xs='auto' mr={1}>
                    <Typography fontSize={!isSidebarOpen ? 12 : 10} color='text.secondary'>
                        Pontos
                    </Typography>
                    <Typography fontSize={!isSidebarOpen ? 14 : 12} fontWeight='bold' color='text.primary'>
                        {points.toFixed(2)}
                    </Typography>
                </Grid>

                {targetDateBottom && (
                    <Grid item xs={12} textAlign='center' mt={0.5}>
                        <Typography fontSize={11} color='text.secondary'>
                            {moment(targetDateBottom, ["YYYY-MM-DD", "YYYY-MM"]).format(
                                targetDateBottom.length === 10 ? "DD/MM/YYYY" : "MM/YYYY",
                            )}
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
