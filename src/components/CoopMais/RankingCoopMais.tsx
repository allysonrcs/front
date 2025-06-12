import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useGlobal } from "@/contexts/GlobalContext";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import {
    Box,
    Button,
    Grid,
    IconButton,
    Stack,
    styled,
    Table,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import IndeterminateCheckBoxOutlinedIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import { Agency, ISearchRankingDetailParams, searchRankingDetail } from "@/services/coopmais";
import { toast } from "react-toastify";
import {
    formatNumberWithThousandsSeparatorComma,
    formatNumberWithThousandsSeparatorCommaFixedOne,
    parseNumber,
} from "@/functions/number";
import moment from "moment";
import html2canvas from "html2canvas";
import indefinido_icon from "@/assets/icons/coop_mais/coop-indefinido.png";
import inicial_icon from "@/assets/icons/coop_mais/coop-inicial.png";
import bronze_icon from "@/assets/icons/coop_mais/coop-bronze.png";
import prata_icon from "@/assets/icons/coop_mais/coop-prata.png";
import ouro_icon from "@/assets/icons/coop_mais/coop-ouro.png";

type RankingCoopMaisProps = {
    refMes?: string;
    closeButton?: () => void;
};

interface IconData {
    icon: string;
    title: string;
}

export function getIconForPoints(pontos: number | null | undefined): IconData {
    if (pontos == null) return { icon: indefinido_icon, title: "Indefinido" };
    if (pontos < 800) return { icon: inicial_icon, title: "Inicial" };
    if (pontos < 900) return { icon: bronze_icon, title: "Bronze" };
    if (pontos < 1000) return { icon: prata_icon, title: "Prata" };
    if (pontos >= 1000) return { icon: ouro_icon, title: "Ouro" };
    return { icon: indefinido_icon, title: "Indefinido" };
}

export function RankingCoopMais({ refMes, closeButton }: RankingCoopMaisProps) {
    const [loadingRanking, setLoadingRanking] = useState<boolean>(false);
    const [listRankingDetailCoopMais, setListRankingDetailCoopMais] = useState<Agency[]>([]);
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
    const { theme: themeContext, colorBorderSystem, getInfoError } = useGlobal();
    const { device } = useMediaQuery();
    const theme = useTheme();

    const divRef = useRef<HTMLDivElement>(null);

    const isMobile = device === "Mobile";
    const isThemeLight = themeContext === "light";

    const toggleExpand = (agencyName: string) => {
        setExpanded((prev) => ({ ...prev, [agencyName]: !prev[agencyName] }));
    };

    const handleCapture = async () => {
        if (!divRef.current) return;

        const canvas = await html2canvas(divRef.current!, {
            backgroundColor: isThemeLight ? "#003641" : "#1F3E45",
        });
        const imgData = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = imgData;
        link.download = `coopmais_ranking_${moment().format("DD-MM-YYYY-HH-mm-ss")}.png`;
        link.click();
    };

    const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: isThemeLight ? "#003641" : "#00161B",
            color: theme.palette.common.white,
        },

        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableCellHeader2 = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: isThemeLight ? "#E6E6E6" : "#00161B",
            color: isThemeLight ? theme.palette.common.black : theme.palette.common.white,
        },

        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const onFecthRankingDetailCoopMais = async (params: ISearchRankingDetailParams) => {
        try {
            setLoadingRanking(true);

            const responseRankingDetail = await searchRankingDetail({
                ref_month: params.ref_month,
            });

            const { agencies } = responseRankingDetail;

            setListRankingDetailCoopMais(agencies);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingRanking(false);
        }
    };

    useEffect(() => {
        async function execute() {
            refMes && onFecthRankingDetailCoopMais({ ref_month: refMes });
        }
        execute();
    }, [refMes]);

    return (
        <Box
            sx={{
                maxHeight: "95%",
                overflow: "auto",
                position: "absolute" as "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                borderRadius: "16px",
            }}
            minWidth={isMobile ? "90%" : "40%"}
            maxWidth={"80%"}
            maxHeight='95%'>
            <Grid container direction='row'>
                <TableContainer
                    ref={divRef}
                    sx={{
                        border: isThemeLight ? "none" : `1px solid ${colorBorderSystem}`,
                        borderRadius: "16px",
                        background: isThemeLight ? "#ffffff" : "linear-gradient(135deg, #071d20, #0A2A2F)",
                        overflow: "hidden",
                        boxShadow: isThemeLight
                            ? " rgba(145, 158, 171, 0.4) 0px 2px 3px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                            : "none",
                    }}>
                    <Table
                        sx={{
                            "& .MuiTableCell-root": {
                                borderBottom: `1px solid ${colorBorderSystem}`,
                                padding: "3px 12px",
                                fontSize: "14px",
                                lineHeight: 1,
                            },
                            "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                borderBottom: "none",
                            },
                        }}
                        size='small'>
                        <TableHead>
                            <TableRow style={{ background: isThemeLight ? "#003641" : "#00161B" }}>
                                <StyledTableCellHeader
                                    align='left'
                                    style={{ lineHeight: 1.5, fontSize: 16, border: "none", fontWeight: "bold" }}>
                                    <Tooltip
                                        title={
                                            <>
                                                Captura uma imagem da tabela: <br />
                                                (CoopMais - Ranking). <br /> <br />
                                                <strong>Atenção:</strong> se o modal estiver cortado ou redimensionado,{" "}
                                                <br />
                                                isso afetará o resultado final da imagem.
                                            </>
                                        }>
                                        <Button
                                            size='small'
                                            color='primary'
                                            variant='text'
                                            onClick={handleCapture}
                                            startIcon={<CameraAltOutlinedIcon />}
                                            sx={{ height: "20px" }}>
                                            <Typography fontSize={10} ml={-0.5}>
                                                Print
                                            </Typography>
                                        </Button>
                                    </Tooltip>
                                </StyledTableCellHeader>
                                <StyledTableCellHeader
                                    colSpan={2}
                                    style={{ lineHeight: 1.5, fontSize: 16, border: "none", fontWeight: "bold" }}
                                    align='center'>
                                    Ranking
                                </StyledTableCellHeader>
                                <StyledTableCellHeader
                                    colSpan={2}
                                    style={{ lineHeight: 1.5, border: "none" }}
                                    align='right'>
                                    <Stack direction={"row"} justifyContent={"right"} alignItems={"center"}>
                                        <Typography>{refMes}</Typography>

                                        <IconButton
                                            title='Fechar Ranking'
                                            size='small'
                                            sx={{ p: 0.25, ml: 1, mr: -1 }}
                                            onClick={closeButton}>
                                            <HighlightOffOutlinedIcon color='success' sx={{ fontSize: 19 }} />
                                        </IconButton>
                                    </Stack>
                                </StyledTableCellHeader>
                            </TableRow>
                            <TableRow>
                                <StyledTableCellHeader2
                                    align='center'
                                    sx={{ fontWeight: "bold" }}
                                    style={{ fontSize: 14, lineHeight: 2 }}>
                                    Agência
                                </StyledTableCellHeader2>
                                <StyledTableCellHeader2
                                    align='center'
                                    sx={{ fontWeight: "bold" }}
                                    style={{ fontSize: 14, lineHeight: 2 }}>
                                    Pontuação
                                </StyledTableCellHeader2>
                                <StyledTableCellHeader2
                                    align='center'
                                    sx={{ fontWeight: "bold" }}
                                    style={{ fontSize: 14, lineHeight: 2, color: theme.palette.success.light }}>
                                    Bônus
                                </StyledTableCellHeader2>
                                <StyledTableCellHeader2
                                    align='center'
                                    sx={{ fontWeight: "bold" }}
                                    style={{ fontSize: 14, lineHeight: 2, color: theme.palette.error.light }}>
                                    Dedutores
                                </StyledTableCellHeader2>
                                <StyledTableCellHeader2
                                    align='center'
                                    sx={{ fontWeight: "bold" }}
                                    style={{ fontSize: 14, lineHeight: 2 }}>
                                    Total
                                </StyledTableCellHeader2>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingRanking ? (
                                <TableRow>
                                    <TableCell colSpan={5} align='center'>
                                        <Typography fontSize={18} paddingY={4}>
                                            Carregando...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                listRankingDetailCoopMais.map((agency) => {
                                    const isConsolidated = agency.name.toLowerCase() === "consolidado";
                                    return (
                                        <React.Fragment key={agency.id}>
                                            <TableRow
                                                style={{
                                                    backgroundColor: isConsolidated
                                                        ? isThemeLight
                                                            ? "#E6E6E6"
                                                            : "#00161B"
                                                        : isThemeLight
                                                          ? "#ffffff"
                                                          : undefined,
                                                }}>
                                                <TableCell>
                                                    <Stack direction='row' justifyContent='left' alignItems='center'>
                                                        <IconButton
                                                            title='Exibir Carteiras'
                                                            size='small'
                                                            sx={{
                                                                p: 0,
                                                                cursor: agency.wallets.length ? "pointer" : "default",
                                                            }}
                                                            onClick={() =>
                                                                agency.wallets.length && toggleExpand(agency.name)
                                                            }
                                                            disabled={!agency.wallets.length}>
                                                            {expanded[agency.name] ? (
                                                                <IndeterminateCheckBoxOutlinedIcon
                                                                    color='error'
                                                                    sx={{ fontSize: 12, mr: 0.5 }}
                                                                />
                                                            ) : (
                                                                <AddBoxOutlinedIcon
                                                                    color={
                                                                        agency.wallets.length ? "success" : "disabled"
                                                                    }
                                                                    sx={{
                                                                        opacity: agency.wallets.length ? 1 : 0,
                                                                        fontSize: 12,
                                                                        mr: 0.5,
                                                                    }}
                                                                />
                                                            )}
                                                        </IconButton>
                                                        <Typography fontSize={14} fontWeight='bold'>
                                                            {agency.name}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                {agency.values.map((value: number, index: number) => {
                                                    const numericValue = parseNumber(value);
                                                    if (index === 0 || index === 3) {
                                                        const { icon, title } = getIconForPoints(numericValue);

                                                        return (
                                                            <TableCell
                                                                key={index}
                                                                align='center'
                                                                style={{ fontSize: 12, fontWeight: "bold" }}>
                                                                <Stack
                                                                    direction='row'
                                                                    spacing={0.5}
                                                                    alignItems='center'
                                                                    justifyContent='center'>
                                                                    <Typography
                                                                        component='span'
                                                                        fontSize='inherit'
                                                                        fontWeight='inherit'>
                                                                        {formatNumberWithThousandsSeparatorComma(value)}
                                                                    </Typography>
                                                                    <img
                                                                        src={icon}
                                                                        alt={title}
                                                                        width={14}
                                                                        height={14}
                                                                        title={title}
                                                                    />
                                                                </Stack>
                                                            </TableCell>
                                                        );
                                                    } else {
                                                        return (
                                                            <TableCell
                                                                key={index}
                                                                align='center'
                                                                style={{ fontSize: 12 }}>
                                                                {formatNumberWithThousandsSeparatorCommaFixedOne(value)}
                                                            </TableCell>
                                                        );
                                                    }
                                                })}
                                            </TableRow>
                                            {expanded[agency.name] &&
                                                agency.wallets.map((wallet) => (
                                                    <TableRow
                                                        key={wallet.name}
                                                        style={{
                                                            backgroundColor: isThemeLight ? "#f7f7f7" : "#00161B",
                                                        }}>
                                                        <TableCell>
                                                            <Typography
                                                                sx={{ marginLeft: 2 }}
                                                                component='span'
                                                                fontSize={12}
                                                                fontWeight='inherit'>
                                                                     - {wallet.name}
                                                            </Typography>
                                                        </TableCell>
                                                        {wallet.values.map((value: number, index: number) => {
                                                            const numericValue = parseNumber(value);

                                                            if (index === 0 || index === 3) {
                                                                const { icon, title } = getIconForPoints(numericValue);
                                                                return (
                                                                    <TableCell
                                                                        key={index}
                                                                        align='center'
                                                                        style={{ fontSize: 12, fontWeight: "bold" }}>
                                                                        <Stack
                                                                            direction='row'
                                                                            spacing={0.5}
                                                                            alignItems='center'
                                                                            justifyContent='center'>
                                                                            <Typography
                                                                                component='span'
                                                                                fontSize='inherit'
                                                                                fontWeight='inherit'>
                                                                                {formatNumberWithThousandsSeparatorComma(
                                                                                    value,
                                                                                )}
                                                                            </Typography>
                                                                            <img
                                                                                src={icon}
                                                                                alt={title}
                                                                                width={14}
                                                                                height={14}
                                                                                title={title}
                                                                            />
                                                                        </Stack>
                                                                    </TableCell>
                                                                );
                                                            } else {
                                                                return (
                                                                    <TableCell
                                                                        key={index}
                                                                        align='center'
                                                                        style={{ fontSize: 12 }}>
                                                                        {formatNumberWithThousandsSeparatorCommaFixedOne(
                                                                            value,
                                                                        )}
                                                                    </TableCell>
                                                                );
                                                            }
                                                        })}
                                                    </TableRow>
                                                ))}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Box>
    );
}
