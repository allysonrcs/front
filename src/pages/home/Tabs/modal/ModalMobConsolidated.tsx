import React, { useEffect, useRef, useState } from "react";
import { useGlobal } from "@/contexts/GlobalContext";
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
import { AgenciesMobConsolidated, searchMobilizerConsolidatedModal } from "@/services/coopmais";
import { toast } from "react-toastify";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import IndeterminateCheckBoxOutlinedIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import iconCoopAzul from "@/assets/icons/coop_mais/coop-azul.png";
import { formatPercentage } from "@/functions/number";
import { formatDate } from "@/functions/date";
import "moment/dist/locale/pt-br";
import moment from "moment";
import html2canvas from "html2canvas";

type ModalMobConsolidatedProps = {
    refMonth: string;
    closeButton?: () => void;
};

export function ModalMobConsolidated({ refMonth, closeButton }: ModalMobConsolidatedProps) {
    const [loadingMobConsolidated, setLoadingMobConsolidated] = useState<boolean>(false);
    const [listModalMobConsolidated, setListModalMobConsolidated] = useState<AgenciesMobConsolidated[]>([]);
    const [listProductConsolidated, setListProductConsolidated] = useState<string[]>([]);
    const [listIdealSpeedFooter, setListIdealSpeedFooter] = useState<number[]>([]);
    const [listdateMovimentFooter, setListdateMovimentFooter] = useState<string[]>([]);
    const [dateUpdate, setdateUpdate] = useState<string>();
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
    const [changeStatesSwitch, setChangeStatesSwitch] = useState<boolean>(true);
    const { theme, getInfoError } = useGlobal();

    const divRef = useRef<HTMLDivElement>(null);

    const themeActual = theme === "light";

    moment.locale("pt-br");

    const handleCapture = async () => {
        if (!divRef.current) return;

        const canvas = await html2canvas(divRef.current!, {
            backgroundColor: "#003641",
        });
        const imgData = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = imgData;
        link.download = `mobilizadores_consolidado_${moment().format("DD-MM-YYYY-HH-mm-ss")}.png`;
        link.click();
    };

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setChangeStatesSwitch(isChecked);
        const newExpanded = listModalMobConsolidated.reduce(
            (acc, agency) => {
                if (agency.portfolios.length > 0) {
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
            const allExpanded = listModalMobConsolidated
                .filter((agency) => agency.portfolios.length > 0)
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
            backgroundColor: "#003641",
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

    const arrayColor = [
        { backgroundColor: "#fcd4d4", colorFont: "#B91C1C" },
        { backgroundColor: "#f8f8b6", colorFont: "#7B5400" },
        { backgroundColor: "#aedd9e", colorFont: "#43751b" },
        { backgroundColor: "#92e3e6", colorFont: "#065c5f" },
    ];

    const onFecthModalConsolidatedMobilizer = async (params: { ref_month: string }) => {
        try {
            setLoadingMobConsolidated(true);

            const responseModalMobilizerConsolidated = await searchMobilizerConsolidatedModal({
                ref_month: params.ref_month,
            });

            const { agencies, products, ideal_speed, date_moviment, date_update } = responseModalMobilizerConsolidated;

            setListModalMobConsolidated(agencies);
            setListProductConsolidated(products);
            setListIdealSpeedFooter(ideal_speed);
            setListdateMovimentFooter(date_moviment);
            setdateUpdate(date_update);

            const initialExpandedState = agencies.reduce(
                (acc, agency) => {
                    if (agency.portfolios.length > 0) {
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
            setLoadingMobConsolidated(false);
        }
    };

    useEffect(() => {
        async function execute() {
            refMonth && onFecthModalConsolidatedMobilizer({ ref_month: refMonth });
        }
        execute();
    }, [refMonth]);

    return (
        <Box
            sx={{
                maxHeight: "98vh",
                maxWidth: "96vw",
                width: "1100px",
                overflow: "auto",
                position: "absolute" as "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                borderRadius: "16px",
                boxShadow: "#24242497 0px 0px 2px 0px, #242424a2 0px 8px 25px -4px",
                background: themeActual ? "#003641" : "#042d36",
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
                        border: themeActual ? `3px solid #003641` : `3px solid #042d36`,
                        borderRadius: "16px",
                        background: "#003641",
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
                            backgroundColor: themeActual ? "#003641" : "#042d36",
                        }}>
                        <Stack direction='row' alignItems='center' justifyContent='space-between' mt={-0.5}>
                            <Box display='flex' alignItems='center' justifyContent='center' mt={-0.25}>
                                <img
                                    src={iconCoopAzul}
                                    alt='Coop Mobilizadores'
                                    width={20}
                                    height={20}
                                    title='Mobilizadores - Consolidado'
                                />
                                <Typography
                                    ml={1}
                                    fontSize={14}
                                    style={{ lineHeight: 1, border: "none" }}
                                    color='white'
                                    align='left'>
                                    {(() => {
                                        const formattedMonth = moment(refMonth, "YYYY-MM").format("MMMM");
                                        const capitalizedMonth =
                                            formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);
                                        return capitalizedMonth;
                                    })()}
                                </Typography>
                            </Box>

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
                                Mobilizadores - Consolidado
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
                                    sx={{ p: 0.25, ml: 1, mr: -1.5, mt: -0.25 }}
                                    onClick={closeButton}>
                                    <HighlightOffOutlinedIcon color='success' sx={{ fontSize: 20 }} />
                                </IconButton>
                            </Typography>
                        </Stack>
                    </Grid>
                    <Table
                        sx={{
                            "& .MuiTableCell-root": {
                                borderBottom: `1px solid #d0e4f1`,
                                padding: "2px 12px",
                                lineHeight: 0.75,
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
                                    sx={{ fontWeight: "bold", width: "135px" }}
                                    style={{ fontSize: 11, lineHeight: 2 }}>
                                    Agência
                                </StyledTableCellHeader>

                                {listProductConsolidated.map((product, index) => {
                                    return (
                                        <StyledTableCellHeader
                                            key={index}
                                            align='center'
                                            sx={{ fontWeight: "bold" }}
                                            style={{ fontSize: 11, lineHeight: 2, whiteSpace: "nowrap" }}>
                                            {product}
                                        </StyledTableCellHeader>
                                    );
                                })}

                                <StyledTableCellHeader
                                    align='center'
                                    sx={{ fontWeight: "bold" }}
                                    style={{ fontSize: 11, lineHeight: 2, whiteSpace: "nowrap" }}>
                                    Ating. MOB.
                                </StyledTableCellHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingMobConsolidated ? (
                                <TableRow>
                                    <TableCell colSpan={6} align='center'>
                                        <Typography fontSize={18} paddingY={4} color='white'>
                                            Carregando...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                listModalMobConsolidated
                                    .filter((agencies) => agencies.name.toLowerCase() !== "4071 - consolidado")
                                    .map((agencies) => {
                                        return (
                                            <React.Fragment key={agencies.id}>
                                                <TableRow>
                                                    <TableCell
                                                        sx={{
                                                            backgroundColor: "#e4f0f8",
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
                                                                    cursor: agencies.portfolios.length
                                                                        ? "pointer"
                                                                        : "default",
                                                                }}
                                                                onClick={() =>
                                                                    agencies.portfolios.length &&
                                                                    toggleExpand(agencies.name)
                                                                }
                                                                disabled={!agencies.portfolios.length}>
                                                                {expanded[agencies.name] ? (
                                                                    <IndeterminateCheckBoxOutlinedIcon
                                                                        color='error'
                                                                        sx={{ fontSize: 11, mr: 0.5 }}
                                                                    />
                                                                ) : (
                                                                    <AddBoxOutlinedIcon
                                                                        color={
                                                                            agencies.portfolios.length
                                                                                ? "success"
                                                                                : "disabled"
                                                                        }
                                                                        sx={{
                                                                            fontSize: 11,
                                                                            mr: 0.5,
                                                                            opacity: agencies.portfolios.length ? 1 : 0,
                                                                        }}
                                                                    />
                                                                )}
                                                            </IconButton>
                                                            <Typography
                                                                fontSize={10}
                                                                fontWeight='bold'
                                                                color={"#03383a"}
                                                                lineHeight={0}
                                                                sx={{ width: "135px" }}>
                                                                {agencies.name}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    {agencies.achievement_array.map((value: string, index: number) => {
                                                        const idealSpeed = agencies.ideal_speed[index];
                                                        const idealSpeedRound = Number(idealSpeed).toFixed(0);

                                                        const faltaIdealSpeed =
                                                            Number(idealSpeed) - Number(value) < 0
                                                                ? 0
                                                                : 100 - Number(value);

                                                        let backgroundColor = "#eaf6fa";
                                                        let colorFont = "black";

                                                        if (value !== "-" && idealSpeed !== "-") {
                                                            const numericValue = Number(value);

                                                            if (numericValue < 1) {
                                                                backgroundColor = arrayColor[0].backgroundColor;
                                                                colorFont = arrayColor[0].colorFont;
                                                            } else if (numericValue < Number(idealSpeedRound)) {
                                                                backgroundColor = arrayColor[1].backgroundColor;
                                                                colorFont = arrayColor[1].colorFont;
                                                            } else if (
                                                                numericValue >= Number(idealSpeedRound) &&
                                                                numericValue < 100
                                                            ) {
                                                                backgroundColor = arrayColor[2].backgroundColor;
                                                                colorFont = arrayColor[2].colorFont;
                                                            } else if (numericValue >= 100) {
                                                                backgroundColor = arrayColor[3].backgroundColor;
                                                                colorFont = arrayColor[3].colorFont;
                                                            }
                                                        }

                                                        const numericFormat =
                                                            value !== "-"
                                                                ? `${formatPercentage(Number(value), 0, false, false)}`
                                                                : value;

                                                        return (
                                                            <TableCell
                                                                key={index}
                                                                align='center'
                                                                title={
                                                                    idealSpeed !== "-"
                                                                        ? `Velocidade Mobilizador: ${Number(value).toFixed(2)}% | Faltam: ${faltaIdealSpeed.toFixed(2)}%`
                                                                        : ""
                                                                }
                                                                style={{
                                                                    borderInline: "1px solid #e4f0f8",
                                                                    fontSize: 10,
                                                                    fontWeight: "bold",
                                                                    backgroundColor: backgroundColor,
                                                                    color: colorFont,
                                                                    lineHeight: 0,
                                                                }}>
                                                                {numericFormat}
                                                            </TableCell>
                                                        );
                                                    })}

                                                    <TableCell
                                                        align='center'
                                                        style={{
                                                            fontSize: 10,
                                                            fontWeight: "bold",
                                                            background: "#eaf6fa",
                                                            color: "#03383a",
                                                            lineHeight: 0,
                                                        }}>
                                                        {(() => {
                                                            const [achievement, countMobilizerLength] =
                                                                agencies.achievement_mob.split("/");

                                                            const trophy = achievement === countMobilizerLength;

                                                            return (
                                                                <Typography
                                                                    ml={1}
                                                                    component='span'
                                                                    fontSize={10}
                                                                    lineHeight={0}
                                                                    fontWeight='bold'
                                                                    color={trophy ? "#02964c" : "#03383a"}>
                                                                    {agencies.achievement_mob}

                                                                    <Typography
                                                                        component='span'
                                                                        fontSize={10}
                                                                        lineHeight={0}
                                                                        fontWeight='bold'
                                                                        ml={0.5}
                                                                        visibility={trophy ? "visible" : "hidden"}>
                                                                        ✅
                                                                    </Typography>
                                                                </Typography>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                </TableRow>
                                                {expanded[agencies.name] &&
                                                    agencies.portfolios.map((portfolios, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell
                                                                sx={{
                                                                    background: "#ffffff",
                                                                    color: "#000000ca",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                <Typography
                                                                    sx={{ marginLeft: 2 }}
                                                                    component='span'
                                                                    fontSize={10}
                                                                    lineHeight={0}>
                                                                    {portfolios.name}
                                                                </Typography>
                                                            </TableCell>
                                                            {portfolios.achievement_array.map(
                                                                (value: string, index: number) => {
                                                                    const idealSpeed = portfolios.ideal_speed[index];
                                                                    const idealSpeedRound =
                                                                        Number(idealSpeed).toFixed(0);

                                                                    const faltaIdealSpeed =
                                                                        Number(idealSpeed) - Number(value) < 0
                                                                            ? 0
                                                                            : 100 - Number(value);

                                                                    let backgroundColor = "#ffffff";
                                                                    let colorFont = "black";

                                                                    if (value !== "-" && idealSpeed !== "-") {
                                                                        const numericValue = Number(value);

                                                                        if (numericValue < 1) {
                                                                            backgroundColor =
                                                                                arrayColor[0].backgroundColor;
                                                                            colorFont = arrayColor[0].colorFont;
                                                                        } else if (
                                                                            numericValue < Number(idealSpeedRound)
                                                                        ) {
                                                                            backgroundColor =
                                                                                arrayColor[1].backgroundColor;
                                                                            colorFont = arrayColor[1].colorFont;
                                                                        } else if (
                                                                            numericValue >= Number(idealSpeedRound) &&
                                                                            numericValue < 100
                                                                        ) {
                                                                            backgroundColor =
                                                                                arrayColor[2].backgroundColor;
                                                                            colorFont = arrayColor[2].colorFont;
                                                                        } else if (numericValue >= 100) {
                                                                            backgroundColor =
                                                                                arrayColor[3].backgroundColor;
                                                                            colorFont = arrayColor[3].colorFont;
                                                                        }
                                                                    }

                                                                    const numericFormat =
                                                                        value !== "-"
                                                                            ? `${formatPercentage(Number(value), 0, false, false)}`
                                                                            : value;

                                                                    return (
                                                                        <TableCell
                                                                            key={index}
                                                                            align='center'
                                                                            title={
                                                                                idealSpeed !== "-"
                                                                                    ? `Velocidade Mobilizador: ${Number(value).toFixed(2)}% | Faltam: ${faltaIdealSpeed.toFixed(2)}%`
                                                                                    : ""
                                                                            }
                                                                            style={{
                                                                                borderInline: "1px solid #e4f0f8",
                                                                                fontSize: 10,
                                                                                fontWeight: "bold",
                                                                                backgroundColor: backgroundColor,
                                                                                color: colorFont,
                                                                                lineHeight: 0,
                                                                            }}>
                                                                            {numericFormat}
                                                                        </TableCell>
                                                                    );
                                                                },
                                                            )}

                                                            <TableCell
                                                                align='center'
                                                                style={{
                                                                    fontSize: 10,
                                                                    fontWeight: "bold",
                                                                    background: "#ffffff",
                                                                    color: "#000000ca",
                                                                    lineHeight: 0,
                                                                }}>
                                                                {(() => {
                                                                    const [achievement, countMobilizerLength] =
                                                                        portfolios.achievement_mob.split("/");

                                                                    const trophy = achievement === countMobilizerLength;

                                                                    return (
                                                                        <Typography
                                                                            ml={1}
                                                                            component='span'
                                                                            fontSize={10}
                                                                            lineHeight={0}
                                                                            fontWeight='bold'
                                                                            color={trophy ? "#02964c" : "#000000ca"}>
                                                                            {portfolios.achievement_mob}

                                                                            <Typography
                                                                                component='span'
                                                                                fontSize={10}
                                                                                lineHeight={0}
                                                                                fontWeight='bold'
                                                                                ml={0.5}
                                                                                visibility={
                                                                                    trophy ? "visible" : "hidden"
                                                                                }>
                                                                                ✅
                                                                            </Typography>
                                                                        </Typography>
                                                                    );
                                                                })()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </React.Fragment>
                                        );
                                    })
                            )}
                        </TableBody>
                        <TableFooter>
                            {listModalMobConsolidated
                                .filter((agencies) => agencies.name.toLowerCase() === "4071 - consolidado")
                                .map((agencies, index) => {
                                    return (
                                        <StyledTableRow key={index}>
                                            <StyledTableCellFooter align='left' sx={{ fontWeight: "bold" }}>
                                                <Typography fontSize={11} lineHeight={1.5} ml={1.75} fontWeight='bold'>
                                                    {agencies.name}
                                                </Typography>
                                            </StyledTableCellFooter>

                                            {agencies.achievement_array.map((achievement, index) => {
                                                const idealSpeed = agencies.ideal_speed[index];

                                                return (
                                                    <StyledTableCellFooter
                                                        key={index}
                                                        align='center'
                                                        style={{
                                                            fontSize: 11,
                                                            fontWeight: "bold",
                                                        }}
                                                        title={
                                                            idealSpeed !== "-"
                                                                ? `Velocidade Ideal: ${Number(idealSpeed).toFixed(0)}%`
                                                                : ""
                                                        }>
                                                        {achievement !== "-"
                                                            ? `${formatPercentage(Number(achievement), 0, false, false)}`
                                                            : achievement}
                                                    </StyledTableCellFooter>
                                                );
                                            })}

                                            <StyledTableCellFooter
                                                align='center'
                                                sx={{ fontWeight: "bold" }}
                                                style={{ fontSize: 11, lineHeight: 1 }}>
                                                {agencies.achievement_mob}
                                            </StyledTableCellFooter>
                                        </StyledTableRow>
                                    );
                                })}

                            <TableRow style={{ background: "#ffffff" }}>
                                <TableCell
                                    align='center'
                                    style={{
                                        border: "none",
                                        fontWeight: "bold",
                                        fontSize: 11,
                                        color: "#000000ca",
                                    }}>
                                    Velocidade ideal:
                                </TableCell>

                                {listIdealSpeedFooter.map((ideal_speed, index) => {
                                    return (
                                        <StyledTableCellHeader
                                            key={index}
                                            align='center'
                                            sx={{ fontWeight: "bold" }}
                                            style={{
                                                border: "none",
                                                fontSize: 11,
                                                color: "#00000099",
                                                lineHeight: 1,
                                                whiteSpace: "nowrap",
                                            }}>
                                            {`${formatPercentage(Number(ideal_speed), 0, true)}`}
                                        </StyledTableCellHeader>
                                    );
                                })}

                                <TableCell
                                    align='center'
                                    style={{
                                        border: "none",
                                        fontWeight: "bold",
                                        fontSize: 11,
                                    }}
                                />
                            </TableRow>

                            <TableRow style={{ background: "#ffffff" }}>
                                <TableCell
                                    align='center'
                                    style={{
                                        border: "none",
                                        fontWeight: "bold",
                                        fontSize: 11,
                                        color: "#000000ca",
                                    }}>
                                    Atualizado até:
                                </TableCell>

                                {listdateMovimentFooter.map((date_moviment, index) => {
                                    return (
                                        <StyledTableCellHeader
                                            key={index}
                                            align='center'
                                            sx={{ fontWeight: "bold" }}
                                            style={{
                                                border: "none",
                                                fontSize: 11,
                                                color: "#00000099",
                                                lineHeight: 1,
                                                whiteSpace: "nowrap",
                                            }}>
                                            {formatDate(date_moviment, "DD/MM/YYYY")}
                                        </StyledTableCellHeader>
                                    );
                                })}

                                <TableCell
                                    align='center'
                                    style={{
                                        border: "none",
                                        fontWeight: "bold",
                                        fontSize: 11,
                                        color: "#00000099",
                                    }}
                                />
                            </TableRow>

                            <TableRow style={{ background: "#ffffff" }}>
                                <TableCell
                                    align='left'
                                    title='Data de Atualização'
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: 11,
                                        color: "#555555c9",
                                    }}>
                                    {`⏰ ${dateUpdate ? formatDate(dateUpdate, "DD/MM/YYYY") : ""}`}
                                </TableCell>
                                <TableCell
                                    align='right'
                                    colSpan={listModalMobConsolidated.length}
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: 11,
                                    }}>
                                    <Tooltip
                                        title={
                                            <>
                                                Captura uma imagem da tabela: <br />
                                                (Mobilizadores - Consolidado). <br /> <br />
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
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Grid>
        </Box>
    );
}
