import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import {
    gridPageCountSelector,
    gridPageSelector,
    GridPagination,
    useGridApiContext,
    useGridSelector,
} from "@mui/x-data-grid";
import KeyboardDoubleArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftOutlined";
import KeyboardDoubleArrowRightOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowRightOutlined";

export function CustomPagination() {
    const apiRef = useGridApiContext();
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
    const currentPage = useGridSelector(apiRef, gridPageSelector);

    const handleFirstPage = () => apiRef.current.setPage(0);
    const handleLastPage = () => apiRef.current.setPage(pageCount - 1);
    return (
        <Stack direction='row' spacing={1} alignItems='center' justifyContent='space-between' sx={{ width: "100%" }}>
            <Box>
                <Tooltip title='Primeira Página'>
                    <span>
                        <IconButton
                            size='small'
                            color='primary'
                            onClick={handleFirstPage}
                            disabled={currentPage === 0}
                            sx={{ ml: 1 }}>
                            <KeyboardDoubleArrowLeftOutlinedIcon fontSize='small' />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title='Última Página'>
                    <span>
                        <IconButton
                            size='small'
                            color='primary'
                            onClick={handleLastPage}
                            disabled={currentPage === pageCount - 1}>
                            <KeyboardDoubleArrowRightOutlinedIcon fontSize='small' />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
            <GridPagination />
        </Stack>
    );
}
