import { useState } from "react";
import {
    Box,
    IconButton,
    Modal,
    Paper,
    styled,
    Table,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    Theme,
    Typography,
} from "@mui/material";
import { formatNumberWithThousandsSeparator, formatPercentage, formatVariationPeriodicTithe } from "@/functions/number";
import { Chart } from "@/components/Charts/ECharts/chart";
import { IListMobilizerProps } from "@/services/coopmais";
import { ModalMobilizerProduct } from "../modal/ModalMobilizerProduct";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import iconEstrela from "@/assets/icons/coop_mais/coop-estrela.png";
import iconTrofeu from "@/assets/icons/coop_mais/coop-trofeu.png";
import moment from "moment";

type DataMobilizerProps = {
    list: IListMobilizerProps[];
    idealSpeed: number;
    dateUpdate: string;
    mensagem?: string | null;
};

type TabMobilizerProps = {
    dataMobilizer: DataMobilizerProps;
    isThemeLight: boolean;
    colorBorderSystem: string;
    isSidebarOpen: boolean;
    themeUI: Theme;
};

export function TabMobilizer({
    dataMobilizer,
    isThemeLight,
    colorBorderSystem,
    isSidebarOpen,
    themeUI,
}: TabMobilizerProps) {
    const [openModalMobilizerProduct, setOpenModalMobilizerProduct] = useState(false);
    const [idProduct, setIdProduct] = useState<number>();
    const [refMonth, setRefMonth] = useState<string>();

    const handleOpenModalMobilizerProduct = () => {
        setOpenModalMobilizerProduct((oldValue) => !oldValue);
    };

    const processedMobilizers = dataMobilizer.list.map((item) => {
        const achievementPercentage = Math.min(item.attainment * 100, 100);
        const achievement = item.attainment * 100;
        const variationFormatted = formatVariationPeriodicTithe(item.variation);

        return { ...item, achievementPercentage, achievement, variationFormatted };
    });

    const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: isThemeLight ? "#f8f8f8" : "#00161B",
            color: theme.palette.text.primary,
        },
    }));

    const StyledTableCellFooter = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.footer}`]: {
            backgroundColor: isThemeLight ? "#f8f8f8" : "#00161B",
            color: theme.palette.text.primary,
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        "&:last-child td, &:last-child th": {
            border: 0,
        },
    }));

    const getProgressColor = (value: number) => {
        if (value < 50) return themeUI.palette.info.light;
        if (value < 60) return themeUI.palette.warning.light;
        if (value < 100) return themeUI.palette.success.light;
        return themeUI.palette.primary.light;
    };

    const pieChartOptions = (achievementPercentage: number) => {
        return {
            tooltip: {
                trigger: "item",
                formatter: (params: any) => {
                    const val = parseFloat(params.value).toFixed(2);
                    return `${params.marker} ${params.name} ${val}%`;
                },
                textStyle: {
                    color: isThemeLight ? "#011216" : "#ffffff",
                },
                backgroundColor: isThemeLight ? "#ffffff" : "#00161b",
            },
            series: [
                {
                    type: "pie",
                    radius: ["100%", "65%"],
                    avoidLabelOverlap: false,
                    label: { show: false },
                    emphasis: { disabled: true },
                    data: [
                        {
                            value: achievementPercentage,
                            name: "Progresso",
                            itemStyle: {
                                color: getProgressColor(achievementPercentage),
                                borderRadius: 2,
                            },
                        },
                        {
                            value: 100 - achievementPercentage,
                            name: "Faltante",
                            itemStyle: { color: colorBorderSystem },
                        },
                    ],
                },
            ],
        };
    };

    return (
        <Box sx={{ width: "100%" }}>
            <TableContainer
                component={Paper}
                sx={{
                    border: `1px solid ${colorBorderSystem}`,
                    borderRadius: "16px",
                    background: isThemeLight ? "#ffffff" : "linear-gradient(135deg, #071d20, #0A2A2F)",
                    overflow: "auto",
                    boxShadow: isThemeLight
                        ? " rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                        : "none",
                    "&::-webkit-scrollbar": {
                        height: "8px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: colorBorderSystem,
                    },
                }}>
                <Table
                    size='small'
                    sx={{
                        minWidth: "800px",
                        "& .MuiTableCell-root": {
                            borderBottom: `1px solid ${colorBorderSystem}`,
                            padding: "3px 12px",
                            fontSize: "14px",
                            lineHeight: 2.5,
                        },
                        "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                            borderBottom: "none",
                        },
                    }}>
                    <TableHead>
                        <TableRow sx={{ borderBottom: `1px dashed ${colorBorderSystem}` }}>
                            <StyledTableCellHeader
                                align='left'
                                sx={{ fontWeight: "bold" }}
                                style={{ fontSize: 13, lineHeight: 3.5 }}>
                                {!isSidebarOpen ? "🚀 Mobilizador" : "🚀 Mob"}
                            </StyledTableCellHeader>
                            <StyledTableCellHeader
                                align='center'
                                sx={{ fontWeight: "bold", width: "40px" }}
                                style={{ fontSize: 13, lineHeight: 3.5 }}></StyledTableCellHeader>
                            <StyledTableCellHeader
                                align='center'
                                sx={{
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                }}
                                style={{ fontSize: 13, lineHeight: 3.5 }}>
                                {!isSidebarOpen ? "🎯 Objetivo" : "🎯 Obj"}
                            </StyledTableCellHeader>
                            <StyledTableCellHeader
                                align='center'
                                sx={{
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                }}
                                style={{ fontSize: 13, lineHeight: 3.5 }}>
                                ✅ Acumulado
                            </StyledTableCellHeader>
                            <StyledTableCellHeader
                                align='center'
                                sx={{
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                }}
                                style={{ fontSize: 13, lineHeight: 3.5 }}>
                                {!isSidebarOpen ? "📈 Realizado" : "📈 Real."}
                            </StyledTableCellHeader>
                            <StyledTableCellHeader
                                align='center'
                                title='Mobilizadores em Correção na produção diária'
                                sx={{
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                }}
                                style={{ fontSize: 13, lineHeight: 3.5 }}>
                                🔵 Correção
                            </StyledTableCellHeader>
                            <StyledTableCellHeader
                                align='center'
                                title='Mobilizadores em Análise/Pendete na produção diária'
                                sx={{
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                }}
                                style={{ fontSize: 13, lineHeight: 3.5 }}>
                                🟡 Análise
                            </StyledTableCellHeader>
                            <StyledTableCellHeader
                                align='center'
                                title='Porcentagem de Atingimento'
                                sx={{
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                }}
                                style={{ fontSize: 13, lineHeight: 3.5 }}>
                                {!isSidebarOpen ? "🏆 Atingimento" : "🏆 Ating%"}
                            </StyledTableCellHeader>
                            <StyledTableCellHeader
                                align='center'
                                title='Pontos / Peso'
                                sx={{
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                }}
                                style={{ fontSize: 13, lineHeight: 3.5 }}>
                                ⭐ Pontos
                            </StyledTableCellHeader>
                            <StyledTableCellHeader
                                align='center'
                                title='Data de Movimento'
                                sx={{
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                }}
                                style={{ fontSize: 13, lineHeight: 3.5 }}>
                                {!isSidebarOpen ? "⏰ Movimento" : "⏰ Mov"}
                            </StyledTableCellHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processedMobilizers.length > 0 ? (
                            processedMobilizers.map((item) => {
                                return (
                                    <StyledTableRow key={item.name_mobilizer}>
                                        <TableCell
                                            sx={{
                                                fontWeight: "bold",
                                                color: "text.primary",
                                                whiteSpace: "nowrap",
                                            }}
                                            style={{ fontSize: 13 }}>
                                            <IconButton
                                                title='Abrir Modal'
                                                size='small'
                                                sx={{ border: `1px solid ${colorBorderSystem}`, mr: 0.75 }}
                                                onClick={() => {
                                                    setIdProduct(item.id_product);
                                                    setRefMonth(item.ref_month);
                                                    handleOpenModalMobilizerProduct();
                                                }}>
                                                <DashboardOutlinedIcon
                                                    color='success'
                                                    style={{ fontSize: !isSidebarOpen ? 12 : 11 }}
                                                />
                                            </IconButton>
                                            {item.name_mobilizer}
                                        </TableCell>
                                        {[
                                            <Box display='flex' alignItems='center' justifyContent='center'>
                                                {item.achievement >= item.ideal_speed && item.achievement < 100 && (
                                                    <img
                                                        src={iconEstrela}
                                                        alt='Estrela'
                                                        width={16}
                                                        height={16}
                                                        title='Igualou ou ultrapassou a velocidade ideal diária'
                                                    />
                                                )}
                                                {item.achievement >= 100 && (
                                                    <img
                                                        src={iconTrofeu}
                                                        alt='Troféu'
                                                        width={16}
                                                        height={16}
                                                        title='Atingiu o objetivo'
                                                    />
                                                )}
                                            </Box>,
                                            formatNumberWithThousandsSeparator(item.objective),
                                            formatNumberWithThousandsSeparator(item.accumulated),
                                            formatNumberWithThousandsSeparator(Number(item.variationFormatted)),
                                            formatNumberWithThousandsSeparator(item.correction),
                                            formatNumberWithThousandsSeparator(item.analysis),
                                            <Box display='flex' alignItems='center' justifyContent='space-evenly'>
                                                <Box width={22} height={22}>
                                                    <Chart
                                                        options={pieChartOptions(item.achievementPercentage)}
                                                        height={22}
                                                    />
                                                </Box>
                                                <Typography variant='caption' ml={1}>
                                                    {formatPercentage(item.attainment * 100, 0, false)}
                                                </Typography>
                                            </Box>,
                                            <Box display='flex' alignItems='center' justifyContent='space-evenly'>
                                                <Typography variant='caption'>
                                                    {item.points.toFixed(2) + " | " + item.weight}
                                                </Typography>
                                            </Box>,
                                            moment(item.date_moviment_mob).format("DD/MM"),
                                        ].map((value, index) => (
                                            <TableCell
                                                key={index}
                                                align='center'
                                                style={{ fontSize: !isSidebarOpen ? 13.5 : 12 }}>
                                                {value}
                                            </TableCell>
                                        ))}
                                    </StyledTableRow>
                                );
                            })
                        ) : (
                            <StyledTableRow>
                                <TableCell align='center' colSpan={10}>
                                    <Typography fontSize={13} fontWeight='bold' color='text.secondary' lineHeight={5}>
                                        {dataMobilizer.mensagem ||
                                            "Não encontramos dados para este mês de referência e a carteira selecionada. Tente consultar um mês anterior ou outro período disponível."}
                                    </Typography>
                                </TableCell>
                            </StyledTableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <StyledTableRow sx={{ borderTop: `1px dashed ${colorBorderSystem}` }}>
                            <StyledTableCellFooter
                                style={{ fontSize: 13, fontWeight: "bold", lineHeight: 3.5 }}
                                sx={{
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                }}>
                                <Typography component={"span"} fontWeight={"bold"} fontSize={13}>
                                    {`⚡ Velocidade Ideal: ${Number(dataMobilizer.idealSpeed).toFixed(0)}%`}
                                </Typography>
                            </StyledTableCellFooter>
                            <StyledTableCellFooter align='center' colSpan={4}>
                                <Typography fontSize={12} color='text.secondary' component={"span"}>
                                    <Typography fontSize={12} color='text.primary' component={"span"}>
                                        📅 Data Atualização:{" "}
                                    </Typography>
                                    {dataMobilizer.dateUpdate
                                        ? moment(dataMobilizer.dateUpdate).format("DD/MM/YYYY")
                                        : "--/--/----"}
                                </Typography>
                            </StyledTableCellFooter>
                            <StyledTableCellFooter align='center' style={{ fontSize: 13, fontWeight: "bold" }}>
                                {/* {formatNumberWithThousandsSeparator(
                                    dataMobilizer.list.reduce((acc, curr) => acc + curr.correction, 0),
                                )} */}
                            </StyledTableCellFooter>
                            <StyledTableCellFooter align='center' style={{ fontSize: 13, fontWeight: "bold" }}>
                                {/* {formatNumberWithThousandsSeparator(
                                    dataMobilizer.list.reduce((acc, curr) => acc + curr.analysis, 0),
                                )} */}
                            </StyledTableCellFooter>
                            <StyledTableCellFooter align='center' style={{ fontSize: 13, fontWeight: "bold" }}>
                                {dataMobilizer.list.filter((item) => item.attainment * 100 >= 100).length}/
                                {dataMobilizer.list.length}
                            </StyledTableCellFooter>
                            <StyledTableCellFooter />
                            <StyledTableCellFooter colSpan={2} />
                        </StyledTableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            <Modal
                open={openModalMobilizerProduct}
                onClose={handleOpenModalMobilizerProduct}
                disableEscapeKeyDown={false}
                sx={{
                    "& .MuiModal-backdrop": {
                        backgroundColor: "rgb(0 0 0 / 60%)",
                    },
                }}>
                <ModalMobilizerProduct
                    closeButton={handleOpenModalMobilizerProduct}
                    idProduct={idProduct}
                    refMonth={refMonth}
                />
            </Modal>
        </Box>
    );
}
