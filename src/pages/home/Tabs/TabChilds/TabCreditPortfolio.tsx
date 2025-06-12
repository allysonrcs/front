import {
    Box,
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
import { formatPercentage, formatToBRLCurrency } from "@/functions/number";
import { IListCreditPortfolioProps } from "@/services/coopmais";
import "moment/dist/locale/pt-br";
import moment from "moment";

type DataCreditPortfolioProps = {
    listCredit: IListCreditPortfolioProps[];
    dateUpdate: string;
    year_month_actual: string;
    year_month_before: string;
    message?: string | null;
};

type TabCreditPortfolioProps = {
    dataCreditPortfolio: DataCreditPortfolioProps;
    isThemeLight: boolean;
    colorBorderSystem: string;
    isSidebarOpen: boolean;
    themeUI: Theme;
};

export function TabCreditPortfolio({
    dataCreditPortfolio,
    isThemeLight,
    colorBorderSystem,
    isSidebarOpen,
    themeUI,
}: TabCreditPortfolioProps) {
    moment.locale("pt-br");

    const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: isThemeLight ? "#f8f8f8" : "#00161B",
            color: theme.palette.text.primary,
        },

        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableCellFooter = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.footer}`]: {
            backgroundColor: isThemeLight ? "#f8f8f8" : "#00161B",
            color: theme.palette.text.primary,
        },

        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        "&:last-child td, &:last-child th": {
            border: 0,
        },
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        "&:last-child td, &:last-child th": {
            border: 0,
        },
    }));

    let year_month_actual = "Atual";
    let year_month_before = "Anterior";

    if (dataCreditPortfolio.year_month_actual !== undefined && dataCreditPortfolio.year_month_before !== undefined) {
        year_month_actual = moment(dataCreditPortfolio.year_month_actual, "YYYY-MM").format("MMMM");
        year_month_actual = year_month_actual.charAt(0).toUpperCase() + year_month_actual.slice(1);

        year_month_before = moment(dataCreditPortfolio.year_month_before, "YYYY-MM").format("MMMM");
        year_month_before = year_month_before.charAt(0).toUpperCase() + year_month_before.slice(1);
    }

    return (
        <Box sx={{ width: "100%" }}>
            <TableContainer
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
                    sx={{
                        minWidth: "800px",
                        borderCollapse: "collapse",
                        "& .MuiTableCell-root": {
                            borderBottom: `1px solid ${colorBorderSystem}`,
                            padding: "3px 12px",
                            fontSize: "14px",
                            lineHeight: 2.5,
                        },
                        "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                            borderBottom: "none",
                        },
                    }}
                    size='small'>
                    <TableHead>
                        <TableRow sx={{ borderBottom: `1px dashed ${colorBorderSystem}`, whiteSpace: "nowrap" }}>
                            <StyledTableCellHeader
                                style={{ fontSize: 11.5, fontWeight: "bold", lineHeight: 3.95, width: "35px" }}>
                                🏢 PA
                            </StyledTableCellHeader>
                            <StyledTableCellHeader align='left' style={{ fontSize: 11.5, fontWeight: "bold" }}>
                                {!isSidebarOpen ? "💼 Carteira" : "💼 Cart"}
                            </StyledTableCellHeader>
                            <StyledTableCellHeader align='center' style={{ fontSize: 11.5, fontWeight: "bold" }}>
                                {!isSidebarOpen ? `💰 Saldo ${year_month_before}` : "💰 Sal. Ant"}
                            </StyledTableCellHeader>
                            <StyledTableCellHeader align='center' style={{ fontSize: 11.5, fontWeight: "bold" }}>
                                {!isSidebarOpen ? `💰 Saldo ${year_month_actual}` : "💰 Sal. Atl"}
                            </StyledTableCellHeader>
                            <StyledTableCellHeader align='center' style={{ fontSize: 11.5, fontWeight: "bold" }}>
                                {!isSidebarOpen ? "📈 Variação Carteira" : "📈 Var. Cart"}
                            </StyledTableCellHeader>
                            <StyledTableCellHeader align='center' style={{ fontSize: 11.5, fontWeight: "bold" }}>
                                ⚠️ INAD10
                            </StyledTableCellHeader>
                            <StyledTableCellHeader align='center' style={{ fontSize: 11.5, fontWeight: "bold" }}>
                                ⚠️ INAD90
                            </StyledTableCellHeader>
                            <StyledTableCellHeader align='center' style={{ fontSize: 11.5, fontWeight: "bold" }}>
                                {!isSidebarOpen ? "🎯 Objetivo" : "🎯 Obj"}
                            </StyledTableCellHeader>
                            <StyledTableCellHeader align='center' style={{ fontSize: 11.5, fontWeight: "bold" }}>
                                {!isSidebarOpen ? " 📉 Redução INAD" : " 📉 Red. INAD"}
                            </StyledTableCellHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataCreditPortfolio.listCredit.length > 0 ? (
                            dataCreditPortfolio.listCredit.map((item, index) => {
                                return (
                                    <StyledTableRow key={item.sguid}>
                                        {index === 0 && (
                                            <TableCell
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: "text.primary",
                                                    borderRight: `1px dashed ${colorBorderSystem}`,
                                                }}
                                                rowSpan={dataCreditPortfolio.listCredit.length}>
                                                <Typography align='center' fontWeight='bold' fontSize={13}>
                                                    {item.id_agencia}
                                                </Typography>
                                            </TableCell>
                                        )}
                                        <TableCell
                                            sx={{
                                                fontWeight: "bold",
                                                color: "text.primary",
                                                whiteSpace: "nowrap",
                                            }}
                                            style={{ fontSize: 12 }}>
                                            {item.aloc_name}
                                        </TableCell>
                                        {[
                                            <Box
                                                display='flex'
                                                alignItems='right'
                                                justifyContent='right'
                                                sx={{ whiteSpace: "nowrap" }}>
                                                <Typography variant='caption' fontSize={10}>
                                                    {`R$ ${formatToBRLCurrency(item.mes_ref_saldo)}`}
                                                </Typography>
                                            </Box>,
                                            <Box
                                                display='flex'
                                                alignItems='right'
                                                justifyContent='right'
                                                sx={{ whiteSpace: "nowrap" }}>
                                                <Typography variant='caption' fontSize={10}>
                                                    {`R$ ${formatToBRLCurrency(item.val_saldo_devedor)}`}
                                                </Typography>
                                            </Box>,
                                            <Box
                                                display='flex'
                                                alignItems='right'
                                                justifyContent='right'
                                                sx={{ whiteSpace: "nowrap" }}>
                                                <Typography component='span' variant='caption' fontSize={10}>
                                                    {`R$ ${formatToBRLCurrency(item.var_val_saldo_devedor)}`}
                                                    <Typography component='span' variant='caption' fontSize={10}>
                                                        {` (${formatPercentage(item.var_val_saldo_devedor_per * 100, 2)})`}
                                                    </Typography>
                                                </Typography>
                                            </Box>,
                                            <Box
                                                display='flex'
                                                alignItems='right'
                                                justifyContent='right'
                                                sx={{ whiteSpace: "nowrap" }}>
                                                <Typography component='span' variant='caption' fontSize={10}>
                                                    {`R$ ${formatToBRLCurrency(item.val_inad10)}`}
                                                    <Typography component='span' variant='caption' fontSize={10}>
                                                        {` (${formatPercentage(item.perc_inad10 * 100, 2)})`}
                                                    </Typography>
                                                </Typography>
                                            </Box>,
                                            <Box
                                                display='flex'
                                                alignItems='right'
                                                justifyContent='right'
                                                sx={{ whiteSpace: "nowrap" }}>
                                                <Typography component='span' variant='caption' fontSize={10}>
                                                    {`R$ ${formatToBRLCurrency(item.val_inad90)}`}
                                                    <Typography component='span' variant='caption' fontSize={10}>
                                                        {` (${formatPercentage(item.perc_inad90 * 100, 2)})`}
                                                    </Typography>
                                                </Typography>
                                            </Box>,
                                            formatPercentage(item.objetivo_perc_inad90, 2, true, true),
                                            <Box
                                                display='flex'
                                                alignItems='right'
                                                justifyContent='right'
                                                sx={{ whiteSpace: "nowrap" }}>
                                                <Typography variant='caption' fontSize={10}>
                                                    {`R$ ${formatToBRLCurrency(item.reducao_inad)}`}
                                                </Typography>
                                            </Box>,
                                        ].map((value, index) => (
                                            <StyledTableCell key={index} align='right' style={{ fontSize: 10 }}>
                                                <Typography variant='caption' fontSize={10}>
                                                    {value}
                                                </Typography>
                                            </StyledTableCell>
                                        ))}
                                    </StyledTableRow>
                                );
                            })
                        ) : (
                            <StyledTableRow>
                                <TableCell align='center' colSpan={10}>
                                    <Typography fontSize={13} fontWeight='bold' color='text.secondary' lineHeight={5}>
                                        {dataCreditPortfolio.message ||
                                            "Não encontramos dados para este mês de referência e a agência selecionada. Tente consultar um mês anterior ou outro período disponível."}
                                    </Typography>
                                </TableCell>
                            </StyledTableRow>
                        )}
                    </TableBody>

                    <TableFooter>
                        <StyledTableRow sx={{ borderTop: `1px dashed ${colorBorderSystem}`, whiteSpace: "nowrap" }}>
                            <StyledTableCellFooter
                                colSpan={2}
                                style={{ fontSize: 12, fontWeight: "bold", lineHeight: 3.75 }}>
                                <Typography fontSize={12} color='text.secondary' component={"span"}>
                                    <Typography fontSize={12} color='text.primary' component={"span"}>
                                        📅 Data Atualização:{" "}
                                    </Typography>
                                    {dataCreditPortfolio.dateUpdate
                                        ? moment(dataCreditPortfolio.dateUpdate).format("DD/MM/YYYY")
                                        : "--/--/-----"}
                                </Typography>
                            </StyledTableCellFooter>
                            <StyledTableCellFooter
                                align='center'
                                style={{ fontSize: 12, fontWeight: "bold" }}></StyledTableCellFooter>
                            <StyledTableCellFooter
                                align='center'
                                style={{ fontSize: 12, fontWeight: "bold" }}></StyledTableCellFooter>
                            <StyledTableCellFooter
                                align='center'
                                style={{ fontSize: 12, fontWeight: "bold" }}></StyledTableCellFooter>
                            <StyledTableCellFooter
                                align='center'
                                style={{ fontSize: 12, fontWeight: "bold" }}></StyledTableCellFooter>
                            <StyledTableCellFooter
                                align='center'
                                style={{ fontSize: 12, fontWeight: "bold" }}></StyledTableCellFooter>
                            <StyledTableCellFooter
                                align='center'
                                style={{ fontSize: 12, fontWeight: "bold" }}></StyledTableCellFooter>
                            <StyledTableCellFooter
                                align='center'
                                style={{ fontSize: 12, fontWeight: "bold" }}></StyledTableCellFooter>
                        </StyledTableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    );
}
