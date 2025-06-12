import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useGlobal } from "@/contexts/GlobalContext";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import {
    Box,
    Button,
    FormControlLabel,
    Grid,
    IconButton,
    Stack,
    styled,
    Switch,
    Table,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import IndeterminateCheckBoxOutlinedIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import RemoveIcon from "@mui/icons-material/Remove";
import CancelIcon from "@mui/icons-material/Cancel";
import ErrorIcon from "@mui/icons-material/Error";
import { AgencyCredit, searchCreditPortfolioConsolidatedModal } from "@/services/coopmais";
import { toast } from "react-toastify";
import { formatPercentage, formatToBRLCurrency } from "@/functions/number";
import "moment/dist/locale/pt-br";
import moment from "moment";
import html2canvas from "html2canvas";
import { formatDate } from "@/functions/date";
import "./style/ScaledIcons.scss";

type ModalConsolidatedCreditPortfolioProps = {
    refMonth: string;
    closeButton?: () => void;
};

export function ModalConsolidatedCreditPortfolio({ refMonth, closeButton }: ModalConsolidatedCreditPortfolioProps) {
    const [loadingConsolidatedCreditPortfolio, setLoadingConsolidatedCreditPortfolio] = useState<boolean>(false);
    const [listModalConsolidatedCreditPortfolio, setListModalConsolidatedCreditPortfolio] = useState<AgencyCredit[]>(
        [],
    );
    const [dateUpdate, setdateUpdate] = useState<string>();
    const [dateMoviment, setdateMoviment] = useState<string>();
    const [yearMonthActual, setYearMonthActual] = useState<string>();
    const [yearMonthBefore, setYearMonthBefore] = useState<string>();
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
    const [changeStatesSwitch, setChangeStatesSwitch] = useState<boolean>(true);
    const [changeStatesColumnSwitch, setChangeStatesColumnSwitch] = useState({
        isVisibilityColumnPortfolioVariation: true,
        isVisibilityColumnINAD10: true,
        isVisibilityColumnINAD90: true,
        isVisibilityColumnObjective: true,
        isVisibilityColumnDefaultReduction: true,
        isVisibilityLegend: true,
    });

    const { theme, getInfoError } = useGlobal();
    const { device } = useMediaQuery();

    const isMobile = device === "Mobile";
    const themeActual = theme === "light";

    const divRef = useRef<HTMLDivElement>(null);

    moment.locale("pt-br");

    const handleCapture = async () => {
        if (!divRef.current) return;

        document.body.classList.add("html2canvas-print");

        const canvas = await html2canvas(divRef.current!, {
            backgroundColor: "#003641",
        });

        document.body.classList.remove("html2canvas-print");

        const imgData = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = imgData;
        link.download = `consolidado_carteira_credito_${moment().format("DD-MM-YYYY-HH-mm-ss")}.png`;
        link.click();
    };

    const handleSwitchChangeVisilibityColumn =
        (key: keyof typeof changeStatesColumnSwitch) => (event: React.ChangeEvent<HTMLInputElement>) => {
            setChangeStatesColumnSwitch((prev) => ({
                ...prev,
                [key]: event.target.checked,
            }));
        };

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setChangeStatesSwitch(isChecked);
        const newExpanded = listModalConsolidatedCreditPortfolio.reduce(
            (acc, agency) => {
                if (agency.wallets.length > 0) {
                    acc[agency.name] = isChecked;
                }
                return acc;
            },
            {} as { [key: string]: boolean },
        );
        setExpanded(newExpanded);
    };

    const toggleExpand = (agencyName: string) => {
        setExpanded((prev) => {
            const newExpanded = { ...prev, [agencyName]: !prev[agencyName] };
            const allExpanded = listModalConsolidatedCreditPortfolio
                .filter((agency) => agency.wallets.length > 0)
                .every((agency) => newExpanded[agency.name]);
            setChangeStatesSwitch(allExpanded);
            return newExpanded;
        });
    };

    const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: "#0b4a57",
            color: theme.palette.common.white,
        },

        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableCellFooter = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.footer}`]: {
            backgroundColor: "#0b4a57",
            color: theme.palette.common.white,
        },

        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        "&:nth-of-type(odd)": {
            backgroundColor: theme.palette.action.hover,
        },
        "&:last-child td, &:last-child th": {
            border: 0,
        },
    }));

    const onFecthModalConsolidatedCreditPortfolio = async (params: { ref_month: string }) => {
        try {
            setLoadingConsolidatedCreditPortfolio(true);

            const responseModalMobilizerProduct = await searchCreditPortfolioConsolidatedModal({
                ref_month: params.ref_month,
            });

            const { agencies, date_update, date_moviment, year_month_actual, year_month_before } =
                responseModalMobilizerProduct;

            setListModalConsolidatedCreditPortfolio(agencies);
            setdateUpdate(date_update);
            setdateMoviment(moment(date_moviment, "YYYY-MM-DD").format("DD/MM/YYYY"));
            year_month_actual && setYearMonthActual(moment(year_month_actual, "YYYY-MM").format("MMMM"));
            year_month_before && setYearMonthBefore(moment(year_month_before, "YYYY-MM").format("MMMM"));

            const initialExpandedState = agencies.reduce(
                (acc, agency) => {
                    if (agency.wallets.length > 0) {
                        acc[agency.name] = changeStatesSwitch;
                    }
                    return acc;
                },
                {} as { [key: string]: boolean },
            );
            setExpanded(initialExpandedState);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingConsolidatedCreditPortfolio(false);
        }
    };

    useEffect(() => {
        async function execute() {
            refMonth && onFecthModalConsolidatedCreditPortfolio({ ref_month: refMonth });
        }
        execute();
    }, [refMonth]);

    const LegendIndicators = () => (
        <Grid container spacing={1} mb={-1} flexWrap={"nowrap"}>
            <Grid item xs={12} md={4}>
                <Typography fontWeight='bold' fontSize={12} color='#616161'>
                    Variação Saldo Carteira de Crédito
                </Typography>
                <Box display='flex' alignItems='center' mt={0.5}>
                    <ArrowDropUpIcon sx={{ color: "#63A28D", fontSize: 20, mr: 1 }} />
                    <Typography variant='body2' fontSize={10} color='#616161'>
                        Crescimento do Saldo de Crédito acima de 1 p.p. em relação ao anterior.
                    </Typography>
                </Box>
                <Box display='flex' alignItems='center' mt={0.5}>
                    <RemoveIcon sx={{ color: "#fdc878", fontSize: 20, mr: 1 }} />
                    <Typography variant='body2' fontSize={10} color='#616161'>
                        Andando de lado! Aumento no Saldo de Crédito menor que 1 p.p. em relação ao anterior.
                    </Typography>
                </Box>
                <Box display='flex' alignItems='center' mt={0.5}>
                    <ArrowDropDownIcon sx={{ color: "#DB5339", fontSize: 20, mr: 1 }} />
                    <Typography variant='body2' fontSize={10} color='#616161'>
                        Redução do Saldo de Crédito, em relação ao anterior.
                    </Typography>
                </Box>
            </Grid>

            <Grid item xs={12} md={3.5}>
                <Box ml={2}>
                    <Typography fontWeight='bold' fontSize={12} color='#616161'>
                        Escala de cor INAD10/INAD90
                    </Typography>
                    <Typography variant='body2' mt={0.5} fontSize={10} color='#616161'>
                        Valor controlado: Igual/abaixo do consolidado
                    </Typography>
                    <Typography variant='body2' mt={0.5} fontSize={10} color='orange'>
                        Valor elevado: Maior que o valor consolidado.
                    </Typography>
                    <Typography variant='body2' mt={0.5} fontSize={10} color='#DB5339'>
                        Valor descolado: Mais de 2x maior que o valor consolidado.
                    </Typography>
                </Box>
            </Grid>

            <Grid item xs={12} md={4.5}>
                <Typography fontWeight='bold' fontSize={12} color='#616161'>
                    Variação INAD10/INAD90
                </Typography>
                <Box display='flex' alignItems='center' mt={0.5}>
                    <ErrorIcon sx={{ color: "#fdc878", fontSize: 16, mr: 1 }} />
                    <Typography variant='body2' fontSize={10} color='#616161'>
                        Atenção! Aumento em relação ao percentual anterior (até 1,0 p.p. INAD10 | até 1,0 p.p. INAD90).
                    </Typography>
                </Box>
                <Box display='flex' alignItems='center' mt={0.5}>
                    <CancelIcon sx={{ borderRadius: "50%", color: "#DB5339", fontSize: 16, mr: 1 }} />
                    <Typography variant='body2' fontSize={10} color='#616161'>
                        Aumento em relação ao percentual anterior (acima de 1,0 p.p. INAD10 | acima de 1,0 p.p. INAD90).
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    );

    return (
        <Box
            sx={{
                maxHeight: "99vh",
                maxWidth: "98vw",
                minWidth: !isMobile ? "70%" : "90%",
                overflow: "auto",
                position: "absolute" as "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                borderRadius: "16px",
                boxShadow: "#24242497 0px 0px 2px 0px, #242424a2 0px 8px 25px -4px",
                background: "#042d36",
                "&::-webkit-scrollbar": {
                    width: "6px",
                    height: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: themeActual ? "#eaf6fa" : "#315a68",
                },
            }}>
            <Grid container direction='row'>
                <TableContainer
                    ref={divRef}
                    sx={{
                        border: `3px solid #042d36`,
                        borderRadius: "16px",
                        background: "#0b4a57",
                        boxShadow:
                            theme === "light"
                                ? " rgba(145, 158, 171, 0.4) 0px 2px 3px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                                : "none",
                        "&::-webkit-scrollbar": {
                            width: "6px",
                            height: "8px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: themeActual ? "#eaf6fa" : "#315a68",
                        },
                    }}>
                    <Grid
                        p={0.75}
                        pb={2.5}
                        mb={-2}
                        sx={{
                            backgroundColor: "#042d36",
                        }}>
                        <Stack direction='row' alignItems='center' justifyContent='space-between'>
                            <Typography
                                title='Mês de Referência | Data Movimento'
                                ml={1}
                                fontSize={14}
                                style={{ lineHeight: 1, border: "none" }}
                                color='white'
                                align='left'>
                                {(() => {
                                    const formattedMonth = moment(refMonth, "YYYY-MM").format("MMMM");
                                    const capitalizedMonth =
                                        formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);
                                    return capitalizedMonth + " | " + (dateMoviment || refMonth);
                                })()}
                            </Typography>

                            <Typography
                                style={{
                                    lineHeight: 1,
                                    border: "none",
                                    fontWeight: "bold",
                                    flexGrow: 1,
                                    textAlign: "center",
                                }}
                                fontSize={14}
                                color='white'>
                                Consolidado - Carteira de Crédito
                            </Typography>

                            <Typography
                                mr={1}
                                style={{ lineHeight: 1, border: "none", textAlign: "right" }}
                                fontSize={14}
                                color='white'>
                                {refMonth}
                                <IconButton
                                    title='Fechar'
                                    size='small'
                                    sx={{ p: 0.25, ml: 1, mr: -1, mt: -0.25 }}
                                    onClick={closeButton}>
                                    <HighlightOffOutlinedIcon color='success' sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Typography>
                        </Stack>
                    </Grid>

                    <Table
                        sx={{
                            "& .MuiTableCell-root": {
                                borderBottom: `1px solid #ebf3f8`,
                                padding: "2px 12px",
                                fontSize: "14px",
                                lineHeight: 0.6,
                            },
                            "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                borderBottom: "none",
                            },
                        }}
                        size='small'>
                        <TableHead>
                            <TableRow>
                                <StyledTableCellHeader
                                    align='center'
                                    sx={{ fontWeight: "bold", width: "135px", whiteSpace: "nowrap" }}
                                    style={{ fontSize: 10, lineHeight: 1.5 }}>
                                    🏢 AGÊNCIA
                                </StyledTableCellHeader>
                                <StyledTableCellHeader
                                    align='center'
                                    sx={{ fontWeight: "bold", width: "125px", whiteSpace: "nowrap" }}
                                    style={{ fontSize: 10, lineHeight: 1.5 }}>
                                    {`💰 SALDO ${yearMonthBefore?.toLocaleUpperCase() || " ANTERIOR"}`}
                                </StyledTableCellHeader>
                                <StyledTableCellHeader
                                    align='center'
                                    sx={{ fontWeight: "bold", width: "125px", whiteSpace: "nowrap" }}
                                    style={{ fontSize: 10, lineHeight: 1.5, backgroundColor: "#0f966d" }}>
                                    {`💰 SALDO ${yearMonthActual?.toLocaleUpperCase() || " ATUAL"}`}
                                </StyledTableCellHeader>
                                <StyledTableCellHeader
                                    align='center'
                                    sx={{
                                        fontWeight: "bold",
                                        width: "150px",
                                        display: changeStatesColumnSwitch.isVisibilityColumnPortfolioVariation
                                            ? "table-cell"
                                            : "none",
                                        whiteSpace: "nowrap",
                                    }}
                                    style={{
                                        fontSize: 10,
                                        lineHeight: 1.5,
                                        borderInline: `2px solid #0f7d96`,
                                        borderTop: `1px solid #0f7d96`,
                                        backgroundColor: "#0f7d96",
                                    }}>
                                    📈 VARIAÇÃO CARTEIRA
                                </StyledTableCellHeader>
                                <StyledTableCellHeader
                                    align='center'
                                    sx={{
                                        fontWeight: "bold",
                                        width: "145px",
                                        display: changeStatesColumnSwitch.isVisibilityColumnINAD10
                                            ? "table-cell"
                                            : "none",
                                        whiteSpace: "nowrap",
                                    }}
                                    style={{ fontSize: 10, lineHeight: 1.5, backgroundColor: "#d3830c" }}>
                                    ⚠️ %INAD10
                                </StyledTableCellHeader>
                                <StyledTableCellHeader
                                    align='center'
                                    sx={{
                                        fontWeight: "bold",
                                        width: "145px",
                                        display: changeStatesColumnSwitch.isVisibilityColumnINAD90
                                            ? "table-cell"
                                            : "none",
                                        whiteSpace: "nowrap",
                                    }}
                                    style={{ fontSize: 10, lineHeight: 1.5, backgroundColor: "#DB5339" }}>
                                    ⚠️ %INAD90
                                </StyledTableCellHeader>
                                <StyledTableCellHeader
                                    align='center'
                                    sx={{
                                        fontWeight: "bold",
                                        width: "100px",
                                        display: changeStatesColumnSwitch.isVisibilityColumnObjective
                                            ? "table-cell"
                                            : "none",
                                        whiteSpace: "nowrap",
                                    }}
                                    style={{ fontSize: 10, lineHeight: 1.5 }}>
                                    🎯 OBJETIVO
                                </StyledTableCellHeader>
                                <StyledTableCellHeader
                                    align='center'
                                    sx={{
                                        fontWeight: "bold",
                                        width: "100px",
                                        display: changeStatesColumnSwitch.isVisibilityColumnDefaultReduction
                                            ? "table-cell"
                                            : "none",
                                        whiteSpace: "nowrap",
                                    }}
                                    style={{ fontSize: 10, lineHeight: 1.5 }}>
                                    📉 REDUÇÃO INAD
                                </StyledTableCellHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingConsolidatedCreditPortfolio ? (
                                <TableRow style={{ background: "#FFFFFF" }}>
                                    <TableCell colSpan={8} align='center'>
                                        <Typography fontSize={18} paddingY={4} color='black'>
                                            Carregando...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : listModalConsolidatedCreditPortfolio.length > 0 ? (
                                listModalConsolidatedCreditPortfolio
                                    .filter((agency) => agency.name.toLowerCase() !== "4071 - consolidado")
                                    .map((agency) => {
                                        const consolidatedAgency = listModalConsolidatedCreditPortfolio.find(
                                            (agency) => agency.name.toLowerCase() === "4071 - consolidado",
                                        );

                                        const percINAD10Consolidated = consolidatedAgency?.values[5] ?? 0;
                                        const percINAD90Consolidated = consolidatedAgency?.values[7] ?? 0;

                                        return (
                                            <React.Fragment key={agency.id}>
                                                <TableRow>
                                                    <TableCell
                                                        sx={{
                                                            backgroundColor: "#eaf6fa",
                                                        }}>
                                                        <Stack
                                                            direction='row'
                                                            justifyContent='left'
                                                            alignItems='center'>
                                                            <IconButton
                                                                title='Exibir Carteiras'
                                                                size='small'
                                                                sx={{
                                                                    p: 0,
                                                                    cursor: agency.wallets.length
                                                                        ? "pointer"
                                                                        : "default",
                                                                }}
                                                                onClick={() =>
                                                                    agency.wallets.length && toggleExpand(agency.name)
                                                                }
                                                                disabled={!agency.wallets.length}>
                                                                {expanded[agency.name] ? (
                                                                    <IndeterminateCheckBoxOutlinedIcon
                                                                        color='error'
                                                                        sx={{ fontSize: 10, mr: 0.5 }}
                                                                    />
                                                                ) : (
                                                                    <AddBoxOutlinedIcon
                                                                        color={
                                                                            agency.wallets.length
                                                                                ? "success"
                                                                                : "disabled"
                                                                        }
                                                                        sx={{
                                                                            fontSize: 10,
                                                                            mr: 0.5,
                                                                            opacity: agency.wallets.length ? 1 : 0,
                                                                        }}
                                                                    />
                                                                )}
                                                            </IconButton>
                                                            <Typography
                                                                fontSize={10}
                                                                fontWeight='bold'
                                                                color='#03383a'
                                                                lineHeight={0}
                                                                sx={{ width: "135px" }}>
                                                                {agency.name}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    {agency.values.map((value: number, index: number) => {
                                                        const numericFormat = value
                                                            ? `R$ ${formatToBRLCurrency(value)}`
                                                            : "R$ 0,00";

                                                        if (index === 0 || index === 1) {
                                                            return (
                                                                <TableCell
                                                                    key={index}
                                                                    align='right'
                                                                    style={{
                                                                        fontSize: 10,
                                                                        backgroundColor: "#eaf6fa",
                                                                        lineHeight: 0,
                                                                        whiteSpace: "nowrap",
                                                                        color: "#03383a",
                                                                    }}>
                                                                    {numericFormat}
                                                                </TableCell>
                                                            );
                                                        } else if (index === 2) {
                                                            const percentageVariation = agency.values[3] * 100;

                                                            let IconComponent = null;

                                                            if (percentageVariation > 1) {
                                                                IconComponent = () => (
                                                                    <ArrowDropUpIcon
                                                                        className='scaled-icon'
                                                                        sx={{
                                                                            color: "#63A28D",
                                                                            fontSize: 10,
                                                                            ml: 0.5,
                                                                            transform: "scale(2)",
                                                                        }}
                                                                    />
                                                                );
                                                            } else if (
                                                                percentageVariation > 0 &&
                                                                percentageVariation <= 1
                                                            ) {
                                                                IconComponent = () => (
                                                                    <RemoveIcon
                                                                        className='scaled-icon'
                                                                        sx={{
                                                                            color: "#fdc878",
                                                                            fontSize: 10,
                                                                            ml: 0.5,
                                                                            transform: "scale(2)",
                                                                        }}
                                                                    />
                                                                );
                                                            } else if (percentageVariation < 0) {
                                                                IconComponent = () => (
                                                                    <ArrowDropDownIcon
                                                                        className='scaled-icon'
                                                                        sx={{
                                                                            color: "#DB5339",
                                                                            fontSize: 10,
                                                                            ml: 0.5,
                                                                            transform: "scale(2)",
                                                                        }}
                                                                    />
                                                                );
                                                            }

                                                            return (
                                                                <TableCell
                                                                    key={index}
                                                                    align='right'
                                                                    style={{
                                                                        fontSize: 10,
                                                                        backgroundColor: "#eaf6fa",
                                                                        borderInline: `2px solid #0f7d96`,
                                                                        display:
                                                                            changeStatesColumnSwitch.isVisibilityColumnPortfolioVariation
                                                                                ? "table-cell"
                                                                                : "none",
                                                                        lineHeight: 0,
                                                                        whiteSpace: "nowrap",
                                                                    }}>
                                                                    <Box
                                                                        component='span'
                                                                        display='inline-flex'
                                                                        alignItems='center'>
                                                                        <Typography
                                                                            component='span'
                                                                            fontSize={10}
                                                                            lineHeight={0}
                                                                            color={
                                                                                percentageVariation < 0
                                                                                    ? "#DB5339"
                                                                                    : "#03383a"
                                                                            }>
                                                                            {numericFormat}
                                                                        </Typography>
                                                                        <Typography
                                                                            component='span'
                                                                            ml={0.5}
                                                                            fontSize={10}
                                                                            lineHeight={0}
                                                                            color={
                                                                                percentageVariation < 0
                                                                                    ? "#DB5339"
                                                                                    : "#03383a"
                                                                            }>
                                                                            {` (${formatPercentage(agency.values[3], 1, false, true)})`}
                                                                        </Typography>
                                                                        {IconComponent && (
                                                                            <Box ml={0.5}>
                                                                                <IconComponent />
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </TableCell>
                                                            );
                                                        } else if (index === 4) {
                                                            const percActualINAD10 = agency.values[5] * 100;
                                                            const percBeforeINAD10 = agency.values[11] * 100;
                                                            const diffPercINAD10 = percActualINAD10 - percBeforeINAD10;
                                                            const formatPercINAD10Consolidated =
                                                                percINAD10Consolidated * 100;

                                                            let fontColor = "#03383a";

                                                            if (percActualINAD10 > formatPercINAD10Consolidated * 2) {
                                                                fontColor = "#DB5339";
                                                            } else if (
                                                                percActualINAD10 > formatPercINAD10Consolidated
                                                            ) {
                                                                fontColor = "#e29521";
                                                            }

                                                            let IconComponent = null;
                                                            if (diffPercINAD10 > 1) {
                                                                IconComponent = () => (
                                                                    <CancelIcon
                                                                        className='scaled-icon-inad'
                                                                        sx={{
                                                                            borderRadius: "50%",
                                                                            color: "#DB5339",
                                                                            fontSize: 10,
                                                                            ml: 0.5,
                                                                            transform: "scale(1.2)",
                                                                        }}
                                                                    />
                                                                );
                                                            } else if (diffPercINAD10 > 0) {
                                                                IconComponent = () => (
                                                                    <ErrorIcon
                                                                        className='scaled-icon-inad'
                                                                        sx={{
                                                                            color: "#fdc878",
                                                                            fontSize: 10,
                                                                            ml: 0.5,
                                                                            transform: "scale(1.2)",
                                                                        }}
                                                                    />
                                                                );
                                                            } else {
                                                                IconComponent = () => (
                                                                    <CancelIcon
                                                                        className='scaled-icon-inad'
                                                                        sx={{
                                                                            visibility: "hidden",
                                                                            fontSize: 10,
                                                                            ml: 0.5,
                                                                            transform: "scale(1.2)",
                                                                        }}
                                                                    />
                                                                );
                                                            }

                                                            return (
                                                                <TableCell
                                                                    key={index}
                                                                    align='right'
                                                                    style={{
                                                                        fontSize: 10,
                                                                        backgroundColor: "#eaf6fa",
                                                                        display:
                                                                            changeStatesColumnSwitch.isVisibilityColumnINAD10
                                                                                ? "table-cell"
                                                                                : "none",
                                                                        lineHeight: 0,
                                                                        whiteSpace: "nowrap",
                                                                    }}>
                                                                    <Box
                                                                        component='span'
                                                                        display='inline-flex'
                                                                        alignItems='center'>
                                                                        <Typography
                                                                            component='span'
                                                                            fontSize={10}
                                                                            lineHeight={0}
                                                                            color={fontColor}>
                                                                            {numericFormat}
                                                                        </Typography>
                                                                        <Typography
                                                                            component='span'
                                                                            ml={0.5}
                                                                            fontSize={10}
                                                                            lineHeight={0}
                                                                            color={fontColor}>
                                                                            {` (${formatPercentage(percActualINAD10, 2, false, false)})`}
                                                                        </Typography>
                                                                        {IconComponent && (
                                                                            <Box ml={0.5}>
                                                                                <IconComponent />
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </TableCell>
                                                            );
                                                        } else if (index === 6) {
                                                            const percActualINAD90 = agency.values[7] * 100;
                                                            const percBeforeINAD90 = agency.values[13] * 100;
                                                            const diffPercINAD10 = percActualINAD90 - percBeforeINAD90;
                                                            const formatPercINAD90Consolidated =
                                                                percINAD90Consolidated * 100;

                                                            let fontColor = "#03383a";

                                                            if (percActualINAD90 > formatPercINAD90Consolidated * 2) {
                                                                fontColor = "#DB5339";
                                                            } else if (
                                                                percActualINAD90 > formatPercINAD90Consolidated
                                                            ) {
                                                                fontColor = "#e29521";
                                                            }

                                                            let IconComponent = null;
                                                            if (diffPercINAD10 > 1) {
                                                                IconComponent = () => (
                                                                    <CancelIcon
                                                                        className='scaled-icon-inad'
                                                                        sx={{
                                                                            borderRadius: "50%",
                                                                            color: "#DB5339",
                                                                            fontSize: 10,
                                                                            ml: 0.5,
                                                                            transform: "scale(1.2)",
                                                                        }}
                                                                    />
                                                                );
                                                            } else if (diffPercINAD10 > 0) {
                                                                IconComponent = () => (
                                                                    <ErrorIcon
                                                                        className='scaled-icon-inad'
                                                                        sx={{
                                                                            color: "#fdc878",
                                                                            fontSize: 10,
                                                                            ml: 0.5,
                                                                            transform: "scale(1.2)",
                                                                        }}
                                                                    />
                                                                );
                                                            } else {
                                                                IconComponent = () => (
                                                                    <CancelIcon
                                                                        className='scaled-icon-inad'
                                                                        sx={{
                                                                            visibility: "hidden",
                                                                            fontSize: 10,
                                                                            ml: 0.5,
                                                                            transform: "scale(1.2)",
                                                                        }}
                                                                    />
                                                                );
                                                            }

                                                            return (
                                                                <TableCell
                                                                    key={index}
                                                                    align='right'
                                                                    style={{
                                                                        fontSize: 10,
                                                                        backgroundColor: "#eaf6fa",
                                                                        display:
                                                                            changeStatesColumnSwitch.isVisibilityColumnINAD90
                                                                                ? "table-cell"
                                                                                : "none",
                                                                        lineHeight: 0,
                                                                        whiteSpace: "nowrap",
                                                                    }}>
                                                                    <Box
                                                                        component='span'
                                                                        display='inline-flex'
                                                                        alignItems='center'>
                                                                        <Typography
                                                                            component='span'
                                                                            fontSize={10}
                                                                            lineHeight={0}
                                                                            color={fontColor}>
                                                                            {numericFormat}
                                                                        </Typography>
                                                                        <Typography
                                                                            component='span'
                                                                            ml={0.5}
                                                                            fontSize={10}
                                                                            lineHeight={0}
                                                                            color={fontColor}>
                                                                            {` (${formatPercentage(percActualINAD90, 2, false, false)})`}
                                                                        </Typography>
                                                                        {IconComponent && (
                                                                            <Box ml={0.5}>
                                                                                <IconComponent />
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </TableCell>
                                                            );
                                                        } else if (index === 8) {
                                                            return (
                                                                <TableCell
                                                                    key={index}
                                                                    align='center'
                                                                    style={{
                                                                        fontSize: 10,
                                                                        backgroundColor: "#eaf6fa",
                                                                        display:
                                                                            changeStatesColumnSwitch.isVisibilityColumnObjective
                                                                                ? "table-cell"
                                                                                : "none",
                                                                        lineHeight: 0,
                                                                        whiteSpace: "nowrap",
                                                                        color: "#03383a",
                                                                    }}>
                                                                    {formatPercentage(value, 2, true, true)}
                                                                </TableCell>
                                                            );
                                                        } else if (index === 9) {
                                                            return (
                                                                <TableCell
                                                                    key={index}
                                                                    align='right'
                                                                    style={{
                                                                        fontSize: 10,
                                                                        color: "#03383a",
                                                                        backgroundColor: "#eaf6fa",
                                                                        display:
                                                                            changeStatesColumnSwitch.isVisibilityColumnDefaultReduction
                                                                                ? "table-cell"
                                                                                : "none",
                                                                        lineHeight: 0,
                                                                        whiteSpace: "nowrap",
                                                                    }}>
                                                                    {numericFormat}
                                                                </TableCell>
                                                            );
                                                        }
                                                    })}
                                                </TableRow>
                                                {expanded[agency.name] &&
                                                    agency.wallets.map((wallet) => (
                                                        <TableRow key={wallet.name}>
                                                            <TableCell
                                                                sx={{
                                                                    lineHeight: 0,
                                                                    whiteSpace: "nowrap",
                                                                    background: "#FFFFFF",
                                                                }}>
                                                                <Typography
                                                                    sx={{ marginLeft: 1.85 }}
                                                                    fontSize={10}
                                                                    lineHeight={1}
                                                                    color='#000000ca'>
                                                                    {wallet.name}
                                                                </Typography>
                                                            </TableCell>
                                                            {wallet.values.map((value: number, index: number) => {
                                                                const numericFormat = value
                                                                    ? `R$ ${formatToBRLCurrency(value)}`
                                                                    : "R$ 0,00";

                                                                if (index === 0 || index === 1) {
                                                                    return (
                                                                        <TableCell
                                                                            key={index}
                                                                            align='right'
                                                                            style={{
                                                                                fontSize: 10,
                                                                                whiteSpace: "nowrap",
                                                                                color: "#000000ca",
                                                                                background: "#FFFFFF",
                                                                            }}>
                                                                            {numericFormat}
                                                                        </TableCell>
                                                                    );
                                                                } else if (index === 2) {
                                                                    const percentageVariation = wallet.values[3] * 100;

                                                                    let IconComponent = null;

                                                                    if (percentageVariation > 1) {
                                                                        IconComponent = () => (
                                                                            <ArrowDropUpIcon
                                                                                className='scaled-icon'
                                                                                sx={{
                                                                                    color: "#63A28D",
                                                                                    fontSize: 10,
                                                                                    ml: 0.5,
                                                                                    transform: "scale(2)",
                                                                                }}
                                                                            />
                                                                        );
                                                                    } else if (
                                                                        percentageVariation > 0 &&
                                                                        percentageVariation <= 1
                                                                    ) {
                                                                        IconComponent = () => (
                                                                            <RemoveIcon
                                                                                className='scaled-icon'
                                                                                sx={{
                                                                                    color: "#fdc878",
                                                                                    fontSize: 10,
                                                                                    ml: 0.5,
                                                                                    transform: "scale(2)",
                                                                                }}
                                                                            />
                                                                        );
                                                                    } else if (percentageVariation < 0) {
                                                                        IconComponent = () => (
                                                                            <ArrowDropDownIcon
                                                                                className='scaled-icon'
                                                                                sx={{
                                                                                    color: "#DB5339",
                                                                                    fontSize: 10,
                                                                                    ml: 0.5,
                                                                                    transform: "scale(2)",
                                                                                }}
                                                                            />
                                                                        );
                                                                    }

                                                                    return (
                                                                        <TableCell
                                                                            key={index}
                                                                            align='right'
                                                                            style={{
                                                                                fontSize: 10,
                                                                                borderInline: `2px solid #0f7d96`,
                                                                                background: "#FFFFFF",
                                                                                display:
                                                                                    changeStatesColumnSwitch.isVisibilityColumnPortfolioVariation
                                                                                        ? "table-cell"
                                                                                        : "none",
                                                                                lineHeight: 0,
                                                                                whiteSpace: "nowrap",
                                                                            }}>
                                                                            <Box
                                                                                component='span'
                                                                                display='inline-flex'
                                                                                alignItems='center'>
                                                                                <Typography
                                                                                    component='span'
                                                                                    fontSize={10}
                                                                                    lineHeight={0}
                                                                                    color={
                                                                                        percentageVariation < 0
                                                                                            ? "#DB5339"
                                                                                            : "#000000ca"
                                                                                    }>
                                                                                    {numericFormat}
                                                                                </Typography>
                                                                                <Typography
                                                                                    component='span'
                                                                                    ml={0.5}
                                                                                    fontSize={10}
                                                                                    lineHeight={0}
                                                                                    color={
                                                                                        percentageVariation < 0
                                                                                            ? "#DB5339"
                                                                                            : "#000000ca"
                                                                                    }>
                                                                                    {` (${formatPercentage(wallet.values[3], 1, false, true)})`}
                                                                                </Typography>
                                                                                {IconComponent && (
                                                                                    <Box ml={0.5}>
                                                                                        <IconComponent />
                                                                                    </Box>
                                                                                )}
                                                                            </Box>
                                                                        </TableCell>
                                                                    );
                                                                } else if (index === 4) {
                                                                    const percActualINAD10 = wallet.values[5] * 100;
                                                                    const percBeforeINAD10 = wallet.values[11] * 100;
                                                                    const diffPercINAD10 =
                                                                        percActualINAD10 - percBeforeINAD10;
                                                                    const formatPercINAD10Consolidated =
                                                                        percINAD10Consolidated * 100;

                                                                    let fontColor = "#000000ca";

                                                                    if (
                                                                        percActualINAD10 >
                                                                        formatPercINAD10Consolidated * 2
                                                                    ) {
                                                                        fontColor = "#DB5339";
                                                                    } else if (
                                                                        percActualINAD10 > formatPercINAD10Consolidated
                                                                    ) {
                                                                        fontColor = "#e29521";
                                                                    }

                                                                    let IconComponent = null;
                                                                    if (diffPercINAD10 > 1) {
                                                                        IconComponent = () => (
                                                                            <CancelIcon
                                                                                className='scaled-icon-inad'
                                                                                sx={{
                                                                                    borderRadius: "50%",
                                                                                    color: "#DB5339",
                                                                                    fontSize: 10,
                                                                                    ml: 0.5,
                                                                                    transform: "scale(1.2)",
                                                                                }}
                                                                            />
                                                                        );
                                                                    } else if (diffPercINAD10 > 0) {
                                                                        IconComponent = () => (
                                                                            <ErrorIcon
                                                                                className='scaled-icon-inad'
                                                                                sx={{
                                                                                    color: "#fdc878",
                                                                                    fontSize: 10,
                                                                                    ml: 0.5,
                                                                                    transform: "scale(1.2)",
                                                                                }}
                                                                            />
                                                                        );
                                                                    } else {
                                                                        IconComponent = () => (
                                                                            <CancelIcon
                                                                                className='scaled-icon-inad'
                                                                                sx={{
                                                                                    visibility: "hidden",
                                                                                    fontSize: 10,
                                                                                    ml: 0.5,
                                                                                    transform: "scale(1.2)",
                                                                                }}
                                                                            />
                                                                        );
                                                                    }
                                                                    return (
                                                                        <TableCell
                                                                            key={index}
                                                                            align='right'
                                                                            style={{
                                                                                fontSize: 10,
                                                                                display:
                                                                                    changeStatesColumnSwitch.isVisibilityColumnINAD10
                                                                                        ? "table-cell"
                                                                                        : "none",
                                                                                lineHeight: 0,
                                                                                whiteSpace: "nowrap",
                                                                                background: "#FFFFFF",
                                                                            }}>
                                                                            <Box
                                                                                component='span'
                                                                                display='inline-flex'
                                                                                alignItems='center'>
                                                                                <Typography
                                                                                    component='span'
                                                                                    fontSize={10}
                                                                                    lineHeight={0}
                                                                                    color={fontColor}>
                                                                                    {numericFormat}
                                                                                </Typography>
                                                                                <Typography
                                                                                    component='span'
                                                                                    ml={0.5}
                                                                                    fontSize={10}
                                                                                    lineHeight={0}
                                                                                    color={fontColor}>
                                                                                    {` (${formatPercentage(percActualINAD10, 2, false, false)})`}
                                                                                </Typography>
                                                                                {IconComponent && (
                                                                                    <Box ml={0.5}>
                                                                                        <IconComponent />
                                                                                    </Box>
                                                                                )}
                                                                            </Box>
                                                                        </TableCell>
                                                                    );
                                                                } else if (index === 6) {
                                                                    const percActualINAD90 = wallet.values[7] * 100;
                                                                    const percBeforeINAD90 = wallet.values[13] * 100;
                                                                    const diffPercINAD10 =
                                                                        percActualINAD90 - percBeforeINAD90;
                                                                    const formatPercINAD90Consolidated =
                                                                        percINAD90Consolidated * 100;

                                                                    let fontColor = "#000000ca";

                                                                    if (
                                                                        percActualINAD90 >
                                                                        formatPercINAD90Consolidated * 2
                                                                    ) {
                                                                        fontColor = "#DB5339";
                                                                    } else if (
                                                                        percActualINAD90 > formatPercINAD90Consolidated
                                                                    ) {
                                                                        fontColor = "#e29521";
                                                                    }

                                                                    let IconComponent = null;
                                                                    if (diffPercINAD10 > 1) {
                                                                        IconComponent = () => (
                                                                            <CancelIcon
                                                                                className='scaled-icon-inad'
                                                                                sx={{
                                                                                    borderRadius: "50%",
                                                                                    color: "#DB5339",
                                                                                    fontSize: 10,
                                                                                    ml: 0.5,
                                                                                    transform: "scale(1.2)",
                                                                                }}
                                                                            />
                                                                        );
                                                                    } else if (diffPercINAD10 > 0) {
                                                                        IconComponent = () => (
                                                                            <ErrorIcon
                                                                                className='scaled-icon-inad'
                                                                                sx={{
                                                                                    color: "#fdc878",
                                                                                    fontSize: 10,
                                                                                    ml: 0.5,
                                                                                    transform: "scale(1.2)",
                                                                                }}
                                                                            />
                                                                        );
                                                                    } else {
                                                                        IconComponent = () => (
                                                                            <CancelIcon
                                                                                className='scaled-icon-inad'
                                                                                sx={{
                                                                                    visibility: "hidden",
                                                                                    fontSize: 10,
                                                                                    ml: 0.5,
                                                                                    transform: "scale(1.2)",
                                                                                }}
                                                                            />
                                                                        );
                                                                    }

                                                                    return (
                                                                        <TableCell
                                                                            key={index}
                                                                            align='right'
                                                                            style={{
                                                                                fontSize: 10,
                                                                                display:
                                                                                    changeStatesColumnSwitch.isVisibilityColumnINAD90
                                                                                        ? "table-cell"
                                                                                        : "none",
                                                                                lineHeight: 0,
                                                                                whiteSpace: "nowrap",
                                                                                background: "#FFFFFF",
                                                                            }}>
                                                                            <Box
                                                                                component='span'
                                                                                display='inline-flex'
                                                                                alignItems='center'>
                                                                                <Typography
                                                                                    component='span'
                                                                                    fontSize={10}
                                                                                    lineHeight={0}
                                                                                    color={fontColor}>
                                                                                    {numericFormat}
                                                                                </Typography>
                                                                                <Typography
                                                                                    component='span'
                                                                                    ml={0.5}
                                                                                    fontSize={10}
                                                                                    lineHeight={0}
                                                                                    color={fontColor}>
                                                                                    {` (${formatPercentage(percActualINAD90, 2, false, false)})`}
                                                                                </Typography>
                                                                                {IconComponent && (
                                                                                    <Box ml={0.5}>
                                                                                        <IconComponent />
                                                                                    </Box>
                                                                                )}
                                                                            </Box>
                                                                        </TableCell>
                                                                    );
                                                                } else if (index === 8) {
                                                                    return (
                                                                        <TableCell
                                                                            key={index}
                                                                            align='center'
                                                                            style={{
                                                                                fontSize: 10,
                                                                                display:
                                                                                    changeStatesColumnSwitch.isVisibilityColumnObjective
                                                                                        ? "table-cell"
                                                                                        : "none",
                                                                                lineHeight: 0,
                                                                                whiteSpace: "nowrap",
                                                                                color: "#000000ca",
                                                                                background: "#FFFFFF",
                                                                            }}>
                                                                            {formatPercentage(value, 2, true, true)}
                                                                        </TableCell>
                                                                    );
                                                                } else if (index === 9) {
                                                                    return (
                                                                        <TableCell
                                                                            key={index}
                                                                            align='right'
                                                                            style={{
                                                                                fontSize: 10,
                                                                                display:
                                                                                    changeStatesColumnSwitch.isVisibilityColumnDefaultReduction
                                                                                        ? "table-cell"
                                                                                        : "none",
                                                                                lineHeight: 0,
                                                                                whiteSpace: "nowrap",
                                                                                color: "#000000ca",
                                                                                background: "#FFFFFF",
                                                                            }}>
                                                                            {numericFormat}
                                                                        </TableCell>
                                                                    );
                                                                }
                                                            })}
                                                        </TableRow>
                                                    ))}
                                            </React.Fragment>
                                        );
                                    })
                            ) : (
                                <>
                                    <TableRow style={{ background: "#ffffff" }}>
                                        <TableCell colSpan={8} align='center'>
                                            <Typography fontSize={18} align='center' paddingBlock={6}>
                                                Nenhuma informação disponível para o mês selecionado.
                                                <br />
                                                Experimente consultar um mês anterior ou retroativo.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow style={{ background: "#ffffff", border: "none" }}>
                                        <TableCell colSpan={8} align='center' />
                                    </TableRow>
                                </>
                            )}
                        </TableBody>
                        <TableFooter>
                            <StyledTableRow>
                                {listModalConsolidatedCreditPortfolio
                                    .filter((agency) => agency.name.toLowerCase() === "4071 - consolidado")
                                    .map((agency) => {
                                        return (
                                            <React.Fragment key={agency.id}>
                                                <StyledTableCellFooter
                                                    align='left'
                                                    sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                                                    style={{ fontSize: 10, lineHeight: 1.5 }}>
                                                    {`${agency.name}`}
                                                </StyledTableCellFooter>
                                                <StyledTableCellFooter
                                                    align='right'
                                                    style={{ fontWeight: "bold", fontSize: 10, whiteSpace: "nowrap" }}>
                                                    {`R$ ${formatToBRLCurrency(agency.values[0])}`}
                                                </StyledTableCellFooter>
                                                <StyledTableCellFooter
                                                    align='right'
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: 10,
                                                        whiteSpace: "nowrap",
                                                        backgroundColor: "#0f966d",
                                                    }}>
                                                    {`R$ ${formatToBRLCurrency(agency.values[1])}`}
                                                </StyledTableCellFooter>
                                                <StyledTableCellFooter
                                                    align='right'
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: 10,
                                                        borderInline: `2px solid #0f7d96`,
                                                        borderBottom: `-2px solid #0f7d96`,
                                                        backgroundColor: "#0f7d96",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                    sx={{
                                                        display:
                                                            changeStatesColumnSwitch.isVisibilityColumnPortfolioVariation
                                                                ? "table-cell"
                                                                : "none",
                                                    }}>
                                                    {(() => {
                                                        const percentageVariation = agency.values[3] * 100;

                                                        let IconComponent = null;

                                                        if (percentageVariation > 1) {
                                                            IconComponent = () => (
                                                                <ArrowDropUpIcon
                                                                    className='scaled-icon'
                                                                    sx={{
                                                                        color: "#63A28D",
                                                                        fontSize: 10,
                                                                        ml: 0.5,
                                                                        transform: "scale(2)",
                                                                    }}
                                                                />
                                                            );
                                                        } else if (
                                                            percentageVariation > 0 &&
                                                            percentageVariation <= 1
                                                        ) {
                                                            IconComponent = () => (
                                                                <RemoveIcon
                                                                    className='scaled-icon'
                                                                    sx={{
                                                                        color: "#fdc878",
                                                                        fontSize: 10,
                                                                        ml: 0.5,
                                                                        transform: "scale(2)",
                                                                    }}
                                                                />
                                                            );
                                                        } else if (percentageVariation < 0) {
                                                            IconComponent = () => (
                                                                <ArrowDropDownIcon
                                                                    className='scaled-icon'
                                                                    sx={{
                                                                        color: "#DB5339",
                                                                        fontSize: 10,
                                                                        ml: 0.5,
                                                                        transform: "scale(2)",
                                                                    }}
                                                                />
                                                            );
                                                        }

                                                        return (
                                                            <Box
                                                                component='span'
                                                                display='inline-flex'
                                                                alignItems='center'>
                                                                <Typography
                                                                    component='span'
                                                                    fontSize={10}
                                                                    fontWeight='bold'
                                                                    lineHeight={0}>
                                                                    {`R$ ${formatToBRLCurrency(agency.values[2])} `}
                                                                </Typography>
                                                                <Typography
                                                                    component='span'
                                                                    ml={0.5}
                                                                    fontSize={10}
                                                                    fontWeight='bold'
                                                                    lineHeight={0}>
                                                                    {` (${formatPercentage(agency.values[3], 2, false, true)})`}
                                                                </Typography>
                                                                {IconComponent && (
                                                                    <Box ml={0.5}>
                                                                        <IconComponent />
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        );
                                                    })()}
                                                </StyledTableCellFooter>

                                                <StyledTableCellFooter
                                                    align='right'
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: 10,
                                                        color: "white",
                                                        whiteSpace: "nowrap",
                                                        backgroundColor: "#d3830c",
                                                    }}
                                                    sx={{
                                                        display: changeStatesColumnSwitch.isVisibilityColumnINAD10
                                                            ? "table-cell"
                                                            : "none",
                                                    }}>
                                                    {(() => {
                                                        const percActualINAD10 = agency.values[5] * 100;
                                                        const percBeforeINAD10 = agency.values[11] * 100;
                                                        const diffPercINAD10 = percActualINAD10 - percBeforeINAD10;

                                                        let IconComponent = null;
                                                        if (diffPercINAD10 > 1) {
                                                            IconComponent = () => (
                                                                <CancelIcon
                                                                    className='scaled-icon-inad'
                                                                    sx={{
                                                                        borderRadius: "50%",
                                                                        color: "#DB5339",
                                                                        fontSize: 10,
                                                                        ml: 0.5,
                                                                        transform: "scale(1.2)",
                                                                    }}
                                                                />
                                                            );
                                                        } else if (diffPercINAD10 > 0) {
                                                            IconComponent = () => (
                                                                <ErrorIcon
                                                                    className='scaled-icon-inad'
                                                                    sx={{
                                                                        color: "#fdc878",
                                                                        fontSize: 10,
                                                                        ml: 0.5,
                                                                        transform: "scale(1.2)",
                                                                    }}
                                                                />
                                                            );
                                                        } else {
                                                            IconComponent = () => (
                                                                <CancelIcon
                                                                    className='scaled-icon-inad'
                                                                    sx={{
                                                                        visibility: "hidden",
                                                                        fontSize: 10,
                                                                        ml: 0.5,
                                                                        transform: "scale(1.2)",
                                                                    }}
                                                                />
                                                            );
                                                        }

                                                        return (
                                                            <Box
                                                                component='span'
                                                                display='inline-flex'
                                                                alignItems='center'>
                                                                <Typography
                                                                    component='span'
                                                                    fontSize={10}
                                                                    fontWeight='bold'
                                                                    lineHeight={0}>
                                                                    {`R$ ${formatToBRLCurrency(agency.values[4])}`}
                                                                </Typography>
                                                                <Typography
                                                                    component='span'
                                                                    ml={0.5}
                                                                    fontSize={10}
                                                                    fontWeight='bold'
                                                                    lineHeight={0}>
                                                                    {`(${formatPercentage(agency.values[5], 2, true, true)})`}
                                                                </Typography>
                                                                {IconComponent && (
                                                                    <Box ml={0.5}>
                                                                        <IconComponent />
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        );
                                                    })()}
                                                </StyledTableCellFooter>

                                                <StyledTableCellFooter
                                                    align='right'
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: 10,
                                                        color: "white",
                                                        whiteSpace: "nowrap",
                                                        background: "#DB5339",
                                                    }}
                                                    sx={{
                                                        display: changeStatesColumnSwitch.isVisibilityColumnINAD90
                                                            ? "table-cell"
                                                            : "none",
                                                    }}>
                                                    {(() => {
                                                        const percActualINAD90 = agency.values[7] * 100;
                                                        const percBeforeINAD90 = agency.values[13] * 100;
                                                        const diffPercINAD90 = percActualINAD90 - percBeforeINAD90;

                                                        let IconComponent = null;
                                                        if (diffPercINAD90 > 1) {
                                                            IconComponent = () => (
                                                                <CancelIcon
                                                                    className='scaled-icon-inad'
                                                                    sx={{
                                                                        borderRadius: "50%",
                                                                        color: "#DB5339",
                                                                        fontSize: 10,
                                                                        ml: 0.5,
                                                                        transform: "scale(1.2)",
                                                                    }}
                                                                />
                                                            );
                                                        } else if (diffPercINAD90 > 0) {
                                                            IconComponent = () => (
                                                                <ErrorIcon
                                                                    className='scaled-icon-inad'
                                                                    sx={{
                                                                        color: "#fdc878",
                                                                        fontSize: 10,
                                                                        ml: 0.5,
                                                                        transform: "scale(1.2)",
                                                                    }}
                                                                />
                                                            );
                                                        } else {
                                                            IconComponent = () => (
                                                                <CancelIcon
                                                                    className='scaled-icon-inad'
                                                                    sx={{
                                                                        visibility: "hidden",
                                                                        fontSize: 10,
                                                                        ml: 0.5,
                                                                        transform: "scale(1.2)",
                                                                    }}
                                                                />
                                                            );
                                                        }

                                                        return (
                                                            <Box
                                                                component='span'
                                                                display='inline-flex'
                                                                alignItems='center'>
                                                                <Typography
                                                                    component='span'
                                                                    fontSize={10}
                                                                    fontWeight='bold'
                                                                    lineHeight={0}>
                                                                    {`R$ ${formatToBRLCurrency(agency.values[6])}`}
                                                                </Typography>
                                                                <Typography
                                                                    component='span'
                                                                    ml={0.5}
                                                                    fontSize={10}
                                                                    fontWeight='bold'
                                                                    lineHeight={0}>
                                                                    {` (${formatPercentage(agency.values[7], 2, true, true)})`}
                                                                </Typography>
                                                                {IconComponent && (
                                                                    <Box ml={0.5}>
                                                                        <IconComponent />
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        );
                                                    })()}
                                                </StyledTableCellFooter>
                                                <StyledTableCellFooter
                                                    align='center'
                                                    style={{ fontWeight: "bold", fontSize: 10, whiteSpace: "nowrap" }}
                                                    sx={{
                                                        display: changeStatesColumnSwitch.isVisibilityColumnObjective
                                                            ? "table-cell"
                                                            : "none",
                                                    }}>
                                                    {formatPercentage(agency.values[8], 2, true, true)}
                                                </StyledTableCellFooter>
                                                <StyledTableCellFooter
                                                    align='right'
                                                    style={{ fontWeight: "bold", fontSize: 10, whiteSpace: "nowrap" }}
                                                    sx={{
                                                        display:
                                                            changeStatesColumnSwitch.isVisibilityColumnDefaultReduction
                                                                ? "table-cell"
                                                                : "none",
                                                    }}>
                                                    {`R$ ${formatToBRLCurrency(agency.values[9])}`}
                                                </StyledTableCellFooter>
                                            </React.Fragment>
                                        );
                                    })}
                            </StyledTableRow>
                            <TableRow sx={{ borderTop: "3px solid #FFFFFF" }}>
                                <TableCell
                                    colSpan={8}
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: 11,
                                        background: "#FFFFFF",
                                        display: changeStatesColumnSwitch.isVisibilityLegend ? "table-cell" : "none",
                                    }}>
                                    <LegendIndicators />
                                </TableCell>
                            </TableRow>
                            <TableRow sx={{ borderTop: "3px solid #FFFFFF" }}>
                                <TableCell
                                    colSpan={8}
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: 11,
                                        background: "#FFFFFF",
                                    }}>
                                    <Stack
                                        direction='row'
                                        alignItems='center'
                                        justifyContent='space-between'
                                        spacing={1}
                                        sx={{ backgroundColor: "#FFFFFF" }}>
                                        <Box display={"flex"} justifyContent={"left"}>
                                            <Typography
                                                fontSize={11}
                                                color='#000000ca'
                                                ml={1}
                                                mr={2}
                                                mt={0.5}
                                                whiteSpace={"nowrap"}>
                                                Visibilidade das Colunas:
                                            </Typography>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size='small'
                                                        color='secondary'
                                                        checked={
                                                            changeStatesColumnSwitch.isVisibilityColumnPortfolioVariation
                                                        }
                                                        onChange={handleSwitchChangeVisilibityColumn(
                                                            "isVisibilityColumnPortfolioVariation",
                                                        )}
                                                        inputProps={{ "aria-label": "Cards Inativos" }}
                                                        sx={{ transform: "scale(0.8)" }}
                                                    />
                                                }
                                                label={
                                                    <Typography fontSize={12} color='#000000ca' whiteSpace={"nowrap"}>
                                                        Variação Carteira
                                                    </Typography>
                                                }
                                                title='Exibir Carteiras'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size='small'
                                                        color='secondary'
                                                        checked={changeStatesColumnSwitch.isVisibilityColumnINAD10}
                                                        onChange={handleSwitchChangeVisilibityColumn(
                                                            "isVisibilityColumnINAD10",
                                                        )}
                                                        inputProps={{ "aria-label": "Cards Inativos" }}
                                                        sx={{ transform: "scale(0.8)" }}
                                                    />
                                                }
                                                label={
                                                    <Typography fontSize={12} color='#000000ca' whiteSpace={"nowrap"}>
                                                        INAD 10
                                                    </Typography>
                                                }
                                                title='Exibir Carteiras'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size='small'
                                                        color='secondary'
                                                        checked={changeStatesColumnSwitch.isVisibilityColumnINAD90}
                                                        onChange={handleSwitchChangeVisilibityColumn(
                                                            "isVisibilityColumnINAD90",
                                                        )}
                                                        inputProps={{ "aria-label": "Cards Inativos" }}
                                                        sx={{ transform: "scale(0.8)" }}
                                                    />
                                                }
                                                label={
                                                    <Typography fontSize={12} color='#000000ca' whiteSpace={"nowrap"}>
                                                        INAD 90
                                                    </Typography>
                                                }
                                                title='Exibir Carteiras'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size='small'
                                                        color='secondary'
                                                        checked={changeStatesColumnSwitch.isVisibilityColumnObjective}
                                                        onChange={handleSwitchChangeVisilibityColumn(
                                                            "isVisibilityColumnObjective",
                                                        )}
                                                        inputProps={{ "aria-label": "Cards Inativos" }}
                                                        sx={{ transform: "scale(0.8)" }}
                                                    />
                                                }
                                                label={
                                                    <Typography fontSize={12} color='#000000ca' whiteSpace={"nowrap"}>
                                                        Objetivo
                                                    </Typography>
                                                }
                                                title='Exibir Carteiras'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size='small'
                                                        color='secondary'
                                                        checked={
                                                            changeStatesColumnSwitch.isVisibilityColumnDefaultReduction
                                                        }
                                                        onChange={handleSwitchChangeVisilibityColumn(
                                                            "isVisibilityColumnDefaultReduction",
                                                        )}
                                                        inputProps={{ "aria-label": "Cards Inativos" }}
                                                        sx={{ transform: "scale(0.8)" }}
                                                    />
                                                }
                                                label={
                                                    <Typography fontSize={12} color='#000000ca' whiteSpace={"nowrap"}>
                                                        Redução INAD
                                                    </Typography>
                                                }
                                                title='Exibir Carteiras'
                                            />
                                        </Box>

                                        <Box justifyContent={"right"}>
                                            <Tooltip
                                                title={
                                                    <>
                                                        Captura uma imagem da tabela: <br />
                                                        (Consolidado - Carteira de Crédito). <br /> <br />
                                                        <strong>Atenção:</strong> se o modal estiver cortado ou
                                                        redimensionado, <br />
                                                        isso afetará o resultado final da imagem.
                                                    </>
                                                }>
                                                <Button
                                                    size='small'
                                                    color='primary'
                                                    variant='text'
                                                    onClick={handleCapture}
                                                    startIcon={<CameraAltOutlinedIcon />}
                                                    sx={{ height: "20px", ml: 1 }}>
                                                    <Typography fontSize={10} ml={-0.5} mr={1}>
                                                        Print
                                                    </Typography>
                                                </Button>
                                            </Tooltip>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size='small'
                                                        color='primary'
                                                        checked={changeStatesColumnSwitch.isVisibilityLegend}
                                                        onChange={handleSwitchChangeVisilibityColumn(
                                                            "isVisibilityLegend",
                                                        )}
                                                        inputProps={{ "aria-label": "Cards Inativos" }}
                                                        sx={{ transform: "scale(0.8)" }}
                                                    />
                                                }
                                                label={
                                                    <Typography fontSize={12} color='#000000ca' whiteSpace={"nowrap"}>
                                                        Legendas
                                                    </Typography>
                                                }
                                                title='Legendas dos Indicadores'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size='small'
                                                        checked={changeStatesSwitch}
                                                        onChange={handleSwitchChange}
                                                        inputProps={{ "aria-label": "Cards Inativos" }}
                                                        sx={{ transform: "scale(0.8)" }}
                                                    />
                                                }
                                                label={
                                                    <Typography fontSize={12} color='#000000ca' whiteSpace={"nowrap"}>
                                                        Visibilidade das Carteiras
                                                    </Typography>
                                                }
                                                title='Exibir Carteiras'
                                            />

                                            <Tooltip
                                                title={`⏰ Data Atualização tabela: ${dateUpdate ? formatDate(dateUpdate, "DD/MM/YYYY") : ""}`}>
                                                <IconButton
                                                    sx={{ padding: 0, cursor: "default" }}
                                                    color='primary'
                                                    component='span'>
                                                    <AccessTimeIcon sx={{ ml: -1, fontSize: 19 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Grid>
        </Box>
    );
}
