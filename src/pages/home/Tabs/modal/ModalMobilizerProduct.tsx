import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useGlobal } from "@/contexts/GlobalContext";
import {
    Box,
    BoxProps,
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
    TableFooter,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { Agency, searchProductInMobilizerModal, SearchProductInMobilizerParams } from "@/services/coopmais";
import { formatNumberWithThousandsSeparator, formatPercentage } from "@/functions/number";
import { formatDate } from "@/functions/date";
import { toast } from "react-toastify";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import IndeterminateCheckBoxOutlinedIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import iconEstrela from "@/assets/icons/coop_mais/coop-estrela.png";
import iconTrofeu from "@/assets/icons/coop_mais/coop-trofeu.png";
import iconContrato from "@/assets/icons/coop_mais/coop-contrato-icon.png";
import iconCoopAzul from "@/assets/icons/coop_mais/coop-azul.png";
import "moment/dist/locale/pt-br";
import moment from "moment";
import html2canvas from "html2canvas";

type ModalMobilizerProductProps = {
    refMonth?: string;
    idProduct?: number;
    closeButton?: () => void;
} & BoxProps;

export const ModalMobilizerProduct = forwardRef<HTMLDivElement, ModalMobilizerProductProps>(
    ({ refMonth, idProduct, closeButton, ...props }, ref) => {
        const [loadingMobilizerProduct, setLoadingMobilizerProduct] = useState<boolean>(false);
        const [listModalMobilizerProduct, setListModalMobilizerProduct] = useState<Agency[]>([]);
        const [dateUpdateMobilizerProduct, setDateUpdateMobilizerProduct] = useState<string>("");
        const [productName, setProductName] = useState<string>("");
        const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
        const { theme: themeContext, getInfoError } = useGlobal();

        const divRef = useRef<HTMLDivElement>(null);

        moment.locale("pt-br");

        const handleCapture = async () => {
            if (!divRef.current) return;

            const canvas = await html2canvas(divRef.current!, {
                backgroundColor: "#003641",
            });
            const imgData = canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.href = imgData;
            link.download = `mobilizadores_por_produto_${moment().format("DD-MM-YYYY-HH-mm-ss")}.png`;
            link.click();
        };

        const toggleExpand = (agencyName: string) => {
            setExpanded((prev) => ({ ...prev, [agencyName]: !prev[agencyName] }));
        };

        const isThemeLight = themeContext === "light";

        const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
            [`&.${tableCellClasses.head}`]: {
                backgroundColor: isThemeLight ? "#0b4a57" : "#0b4a57",
                color: theme.palette.common.white,
            },

            [`&.${tableCellClasses.body}`]: {
                fontSize: 11,
            },
        }));

        const StyledTableCellFooter = styled(TableCell)(({ theme }) => ({
            [`&.${tableCellClasses.footer}`]: {
                backgroundColor: isThemeLight ? "#003641" : "#042d36",
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

        const onFecthModalMobilizerProduct = async (params: SearchProductInMobilizerParams) => {
            try {
                setLoadingMobilizerProduct(true);

                const responseModalMobilizerProduct = await searchProductInMobilizerModal({
                    ref_month: params.ref_month,
                    id_product: params.id_product,
                });

                const { agencies, product_name, date_update } = responseModalMobilizerProduct;

                setProductName(product_name);
                setListModalMobilizerProduct(agencies);
                setDateUpdateMobilizerProduct(date_update);

                const initialExpandedState = agencies.reduce(
                    (acc, agency) => {
                        if (agency.wallets.length > 0) {
                            acc[agency.name] = true;
                        } else {
                            acc[agency.name] = false;
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
                setLoadingMobilizerProduct(false);
            }
        };

        useEffect(() => {
            if (!refMonth || !idProduct) return;

            async function execute() {
                idProduct && refMonth && onFecthModalMobilizerProduct({ ref_month: refMonth, id_product: idProduct });
            }
            execute();
        }, [idProduct]);

        return (
            <Box
                ref={ref}
                sx={{
                    maxHeight: "98vh",
                    maxWidth: "96vw",
                    width: "700px",
                    overflow: "auto",
                    position: "absolute" as "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "16px",
                    boxShadow: "#24242497 0px 0px 2px 0px, #242424a2 0px 8px 25px -4px",
                    background: isThemeLight ? "#003641" : "#042d36",
                    "&::-webkit-scrollbar": {
                        width: "6px",
                        height: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: isThemeLight ? "#eaf6fa" : "#315a68",
                    },
                }}
                {...props}>
                <Grid container direction='row'>
                    <TableContainer
                        ref={divRef}
                        sx={{
                            border: isThemeLight ? `3px solid #003641` : `3px solid #042d36`,
                            borderRadius: "16px",
                            overflow: "hidden",
                            minWidth: "675px",
                            "&::-webkit-scrollbar": {
                                width: "6px",
                                height: "6px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: isThemeLight ? "#eaf6fa" : "#315a68",
                            },
                        }}>
                        <Grid
                            p={0.75}
                            pb={2.5}
                            mb={-2}
                            sx={{
                                backgroundColor: isThemeLight ? "#003641" : "#042d36",
                            }}>
                            <Stack direction='row' alignItems='center' justifyContent='space-between' mt={-0.5}>
                                <Box display='flex' alignItems='center' justifyContent='center' mt={-0.25}>
                                    <img
                                        src={iconCoopAzul}
                                        alt='Coop Mobilizadores'
                                        width={20}
                                        height={20}
                                        title={`Mobilizadores - ${productName}`}
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
                                    fontSize={15}
                                    color='white'>
                                    {productName}
                                </Typography>

                                <Box display='flex' alignItems='center' justifyContent='center' mt={-0.25}>
                                    <img
                                        src={iconContrato}
                                        alt='Icon Contrato'
                                        width={20}
                                        height={20}
                                        title={`Mobilizadores - ${productName}`}
                                    />
                                    <Typography
                                        ml={1}
                                        fontSize={14}
                                        style={{ lineHeight: 1, border: "none" }}
                                        color='white'
                                        align='left'>
                                        {refMonth}
                                    </Typography>

                                    <IconButton
                                        title='Fechar'
                                        size='small'
                                        sx={{ p: 0.25, ml: 1, mr: -0.5, mt: -0.25 }}
                                        onClick={closeButton}>
                                        <HighlightOffOutlinedIcon color='success' sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Box>
                            </Stack>
                        </Grid>

                        <Table
                            sx={{
                                "& .MuiTableCell-root": {
                                    borderBottom: `1px solid #ebf3f8`,
                                    padding: "2px 12px",
                                    lineHeight: 0,
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
                                        sx={{
                                            fontWeight: "bold",
                                            whiteSpace: "nowrap",
                                        }}
                                        style={{ fontSize: 11, lineHeight: 2 }}>
                                        🏢 Agência
                                    </StyledTableCellHeader>
                                    <StyledTableCellHeader
                                        align='center'
                                        sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                                        style={{ fontSize: 11, lineHeight: 2 }}
                                    />
                                    <StyledTableCellHeader
                                        align='center'
                                        sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                                        style={{ fontSize: 11, lineHeight: 2 }}>
                                        🎯 Objetivo
                                    </StyledTableCellHeader>
                                    <StyledTableCellHeader
                                        align='center'
                                        sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                                        style={{ fontSize: 11, lineHeight: 2 }}>
                                        ✅ Acumulado
                                    </StyledTableCellHeader>
                                    <StyledTableCellHeader
                                        align='center'
                                        sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                                        style={{ fontSize: 11, lineHeight: 2 }}>
                                        📈 Realizado
                                    </StyledTableCellHeader>
                                    <StyledTableCellHeader
                                        align='center'
                                        sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                                        style={{ fontSize: 11, lineHeight: 2 }}>
                                        🏆 Atingimento
                                    </StyledTableCellHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingMobilizerProduct ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align='center'>
                                            <Typography fontSize={18} paddingY={4} color='white'>
                                                Carregando...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    listModalMobilizerProduct
                                        .filter((agency) => agency.name.toLowerCase() !== "4071 - consolidado")
                                        .map((agency) => {
                                            return (
                                                <React.Fragment key={agency.id}>
                                                    <TableRow style={{ backgroundColor: "#eaf6fa" }}>
                                                        <TableCell sx={{ lineHeight: 0 }}>
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
                                                                        agency.wallets.length &&
                                                                        toggleExpand(agency.name)
                                                                    }
                                                                    disabled={!agency.wallets.length}>
                                                                    {expanded[agency.name] ? (
                                                                        <IndeterminateCheckBoxOutlinedIcon
                                                                            color='error'
                                                                            sx={{ fontSize: 11, mr: 0.5 }}
                                                                        />
                                                                    ) : (
                                                                        <AddBoxOutlinedIcon
                                                                            color={
                                                                                agency.wallets.length
                                                                                    ? "success"
                                                                                    : "disabled"
                                                                            }
                                                                            sx={{
                                                                                fontSize: 11,
                                                                                mr: 0.5,
                                                                                opacity: agency.wallets.length ? 1 : 0,
                                                                            }}
                                                                        />
                                                                    )}
                                                                </IconButton>
                                                                <Typography
                                                                    fontSize={10}
                                                                    fontWeight='bold'
                                                                    color={"black"}
                                                                    lineHeight={1.2}>
                                                                    {agency.name}
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box
                                                                display='flex'
                                                                alignItems='center'
                                                                justifyContent='center'>
                                                                {agency?.achievement != null &&
                                                                    agency?.ideal_speed != null &&
                                                                    agency.achievement >= agency.ideal_speed &&
                                                                    agency.achievement < 100 && (
                                                                        <img
                                                                            src={iconEstrela}
                                                                            alt='Estrela'
                                                                            width={12}
                                                                            height={12}
                                                                            title={`Igualou ou ultrapassou a velocidade ideal! \nAtingimento: ${formatPercentage(agency.achievement, 2, false)} | Velocidade Ideal: ${agency.ideal_speed}%`}
                                                                        />
                                                                    )}
                                                                {agency?.achievement != null &&
                                                                    agency.achievement >= 100 && (
                                                                        <img
                                                                            src={iconTrofeu}
                                                                            alt='Troféu'
                                                                            width={12}
                                                                            height={12}
                                                                            title={`Parabéns, Atingiu o objetivo! \nAtingimento: ${formatPercentage(agency.achievement, 2, false)} | Velocidade Ideal: ${agency.ideal_speed}%`}
                                                                        />
                                                                    )}
                                                            </Box>
                                                        </TableCell>
                                                        {agency.values.map((value: number, index: number) => {
                                                            const numericFormat =
                                                                formatNumberWithThousandsSeparator(value);

                                                            if (index === 0) {
                                                                return (
                                                                    <TableCell
                                                                        key={index}
                                                                        align='center'
                                                                        style={{
                                                                            fontSize: 10,
                                                                            fontWeight: "bold",
                                                                            color: "black",
                                                                            lineHeight: 0,
                                                                        }}>
                                                                        {numericFormat}
                                                                    </TableCell>
                                                                );
                                                            } else if (index === 1) {
                                                                return (
                                                                    <TableCell
                                                                        key={index}
                                                                        align='center'
                                                                        style={{
                                                                            fontSize: 10,
                                                                            fontWeight: "bold",
                                                                            color: "black",
                                                                            lineHeight: 0,
                                                                        }}>
                                                                        {numericFormat}
                                                                    </TableCell>
                                                                );
                                                            } else if (index === 2) {
                                                                return (
                                                                    <TableCell
                                                                        key={index}
                                                                        align='center'
                                                                        style={{
                                                                            fontSize: 10,
                                                                            fontWeight: "bold",
                                                                            color: "black",
                                                                            lineHeight: 0,
                                                                        }}>
                                                                        {numericFormat}
                                                                    </TableCell>
                                                                );
                                                            } else if (index === 3) {
                                                                const numericFormatPercentage = formatPercentage(
                                                                    value,
                                                                    0,
                                                                    false,
                                                                );

                                                                return (
                                                                    <TableCell
                                                                        key={index}
                                                                        align='center'
                                                                        style={{
                                                                            fontSize: 10,
                                                                            fontWeight: "bold",
                                                                            color: "black",
                                                                            lineHeight: 0,
                                                                        }}>
                                                                        <Stack
                                                                            direction='row'
                                                                            spacing={0.5}
                                                                            alignItems='center'
                                                                            justifyContent='center'>
                                                                            <Typography
                                                                                fontSize='inherit'
                                                                                fontWeight='inherit'
                                                                                lineHeight={0}
                                                                                color={
                                                                                    agency?.achievement != null &&
                                                                                    agency?.ideal_speed != null &&
                                                                                    agency.achievement >=
                                                                                        agency.ideal_speed &&
                                                                                    agency.achievement < 100
                                                                                        ? "success.light"
                                                                                        : agency?.achievement != null &&
                                                                                            agency.achievement >= 100
                                                                                          ? "primary.light"
                                                                                          : "inherit"
                                                                                }>
                                                                                {numericFormatPercentage}
                                                                            </Typography>
                                                                        </Stack>
                                                                    </TableCell>
                                                                );
                                                            }
                                                        })}
                                                    </TableRow>
                                                    {expanded[agency.name] &&
                                                        agency.wallets.map((wallet) => (
                                                            <TableRow
                                                                key={wallet.name}
                                                                style={{ background: "#ffffff" }}>
                                                                <TableCell
                                                                    sx={{
                                                                        color: "black",
                                                                        lineHeight: 0,
                                                                    }}>
                                                                    <Typography
                                                                        sx={{ marginLeft: 2 }}
                                                                        fontSize={10}
                                                                        lineHeight={1.2}>
                                                                        {wallet.name}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell
                                                                    sx={{
                                                                        color: "black",
                                                                    }}>
                                                                    <Box
                                                                        display='flex'
                                                                        alignItems='center'
                                                                        justifyContent='center'>
                                                                        {wallet?.achievement != null &&
                                                                            wallet?.ideal_speed != null &&
                                                                            wallet?.achievement >=
                                                                                wallet?.ideal_speed &&
                                                                            wallet?.achievement < 100 && (
                                                                                <img
                                                                                    src={iconEstrela}
                                                                                    alt='Estrela'
                                                                                    width={12}
                                                                                    height={12}
                                                                                    title={`Igualou ou ultrapassou a velocidade ideal! \nAtingimento: ${formatPercentage(wallet.achievement, 2, false)} | Velocidade Ideal: ${wallet.ideal_speed}%`}
                                                                                />
                                                                            )}
                                                                        {wallet?.achievement != null &&
                                                                            wallet?.achievement >= 100 && (
                                                                                <img
                                                                                    src={iconTrofeu}
                                                                                    alt='Troféu'
                                                                                    width={12}
                                                                                    height={12}
                                                                                    title={`Parabéns, Atingiu o objetivo! \nAtingimento: ${formatPercentage(wallet.achievement, 2, false)}  | Velocidade Ideal: ${wallet.ideal_speed}%`}
                                                                                />
                                                                            )}
                                                                    </Box>
                                                                </TableCell>
                                                                {wallet.values.map((value: number, index: number) => {
                                                                    if (index === 3) {
                                                                        const numericFormatPercentage =
                                                                            formatPercentage(value, 0, false);

                                                                        return (
                                                                            <TableCell
                                                                                key={index}
                                                                                align='center'
                                                                                style={{
                                                                                    fontSize: 10,
                                                                                    fontWeight: "bold",
                                                                                    color: "black",
                                                                                    lineHeight: 0,
                                                                                }}>
                                                                                <Stack
                                                                                    direction='row'
                                                                                    spacing={0.5}
                                                                                    alignItems='center'
                                                                                    justifyContent='center'>
                                                                                    <Typography
                                                                                        component='span'
                                                                                        fontSize='inherit'
                                                                                        fontWeight='inherit'
                                                                                        lineHeight={0}
                                                                                        color={
                                                                                            wallet?.achievement !=
                                                                                                null &&
                                                                                            wallet?.ideal_speed !=
                                                                                                null &&
                                                                                            wallet.achievement >=
                                                                                                wallet.ideal_speed &&
                                                                                            wallet.achievement < 100
                                                                                                ? "success.light"
                                                                                                : wallet?.achievement !=
                                                                                                        null &&
                                                                                                    wallet.achievement >=
                                                                                                        100
                                                                                                  ? "primary.light"
                                                                                                  : "inherit"
                                                                                        }>
                                                                                        {numericFormatPercentage}
                                                                                    </Typography>
                                                                                </Stack>
                                                                            </TableCell>
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <TableCell
                                                                                key={index}
                                                                                align='center'
                                                                                style={{
                                                                                    fontSize: 10,
                                                                                    color: "black",
                                                                                    lineHeight: 0,
                                                                                }}>
                                                                                {formatNumberWithThousandsSeparator(
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
                            <TableFooter>
                                <StyledTableRow>
                                    {listModalMobilizerProduct
                                        .filter((agency) => agency.name.toLowerCase() === "4071 - consolidado")
                                        .map((agency) => (
                                            <React.Fragment key={agency.id}>
                                                <StyledTableCellFooter
                                                    align='left'
                                                    sx={{ fontWeight: "bold" }}
                                                    style={{ fontSize: 11, lineHeight: 1.75 }}>
                                                    {`${agency.name}`}
                                                </StyledTableCellFooter>
                                                <StyledTableCellFooter
                                                    align='center'
                                                    style={{ fontWeight: "bold", fontSize: 11 }}>
                                                    <Box display='flex' alignItems='center' justifyContent='center'>
                                                        {agency?.achievement != null &&
                                                            agency?.ideal_speed != null &&
                                                            agency.achievement >= agency.ideal_speed &&
                                                            agency.achievement < 100 && (
                                                                <img
                                                                    src={iconEstrela}
                                                                    alt='Estrela'
                                                                    width={16}
                                                                    height={16}
                                                                    title={`Igualou ou ultrapassou a velocidade ideal! \nAtingimento: ${formatPercentage(agency.achievement, 2, false)} | Velocidade Ideal: ${agency.ideal_speed}%`}
                                                                />
                                                            )}
                                                        {agency?.achievement != null && agency.achievement >= 100 && (
                                                            <img
                                                                src={iconTrofeu}
                                                                alt='Troféu'
                                                                width={16}
                                                                height={16}
                                                                title={`Parabéns, Atingiu o objetivo! \nAtingimento: ${formatPercentage(agency.achievement, 2, false)} | Velocidade Ideal: ${agency.ideal_speed}%`}
                                                            />
                                                        )}
                                                    </Box>
                                                </StyledTableCellFooter>
                                                <StyledTableCellFooter
                                                    align='center'
                                                    style={{ fontWeight: "bold", fontSize: 11 }}>
                                                    {`${formatNumberWithThousandsSeparator(agency.values[0])}`}
                                                </StyledTableCellFooter>
                                                <StyledTableCellFooter
                                                    align='center'
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: 11,
                                                    }}>
                                                    {`${formatNumberWithThousandsSeparator(agency.values[1])}`}
                                                </StyledTableCellFooter>

                                                <StyledTableCellFooter
                                                    align='center'
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: 11,
                                                    }}>
                                                    {`${formatNumberWithThousandsSeparator(agency.values[2])}`}
                                                </StyledTableCellFooter>

                                                <StyledTableCellFooter
                                                    align='center'
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: 11,
                                                    }}>
                                                    {`${formatPercentage(agency.values[3], 0, false)}`}
                                                </StyledTableCellFooter>
                                            </React.Fragment>
                                        ))}
                                </StyledTableRow>
                                <StyledTableRow sx={{ background: "#ffffff" }}>
                                    <StyledTableCellFooter
                                        align='left'
                                        style={{
                                            fontWeight: "bold",
                                            fontSize: 11,
                                            background: "#ffffff",
                                            color: "#042d36",
                                            lineHeight: 1.5,
                                        }}
                                        colSpan={2}>
                                        {`Atualizado até: ${formatDate(dateUpdateMobilizerProduct, "DD/MM/YYYY")}`}
                                    </StyledTableCellFooter>

                                    <StyledTableCellFooter
                                        align='right'
                                        style={{
                                            fontWeight: "bold",
                                            fontSize: 11,
                                            background: "#ffffff",
                                            color: "#042d36",
                                        }}
                                        colSpan={4}>
                                        <Tooltip
                                            title={
                                                <>
                                                    Captura uma imagem da tabela: <br />({productName}). <br /> <br />
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
                                                sx={{ height: "20px" }}>
                                                <Typography fontSize={10} ml={-0.5}>
                                                    Print
                                                </Typography>
                                            </Button>
                                        </Tooltip>
                                        {`Objetivo Diário Acumulado: ${listModalMobilizerProduct[0]?.ideal_speed ? formatPercentage(listModalMobilizerProduct[0].ideal_speed, 2, false, false) : "0%"}`}
                                    </StyledTableCellFooter>
                                </StyledTableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </Grid>
            </Box>
        );
    },
);
