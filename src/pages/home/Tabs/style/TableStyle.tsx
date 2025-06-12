import { styled, TableCell, tableCellClasses, TableRow } from "@mui/material";

export const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.mode === "light" ? "#009688" : "#00161B",
        color: theme.palette.common.white,
    },

    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export const StyledTableCellFooter = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.footer}`]: {
        backgroundColor: theme.palette.mode === "light" ? "#009688" : "#00161B",
        color: theme.palette.common.white,
    },

    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },

    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));
