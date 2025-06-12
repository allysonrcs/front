import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { GridRenderCellParams } from "@mui/x-data-grid";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import { Grid, IconButton, SxProps } from "@mui/material";

export type ActionsProps = Array<{
    name: string;
    icon: React.ReactNode;
    action: CallableFunction;
    disabled?: (cell: GridRenderCellParams<any, any, any>) => boolean;
}>;

type OptionsProps = {
    cellValues: GridRenderCellParams<any, any, any>;
    actions: ActionsProps;
    sx?: SxProps;
    color?: "default" | "inherit" | "info" | "primary" | "secondary" | "error" | "success" | "warning";
};

export default function BasicMenu({ cellValues, actions, sx, color, ...props }: OptionsProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton
                id='basic-button'
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup='true'
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                color={color}
                sx={sx}>
                <MenuOpenOutlinedIcon onBlur={handleClose} />
            </IconButton>

            <Menu
                id='basic-menu'
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}>
                {actions.map((action, position) =>
                    !action.disabled || !action?.disabled(cellValues) ? (
                        <MenuItem
                            key={position}
                            onClick={() => {
                                action.action(cellValues.row);
                                handleClose();
                            }}
                            disabled={action.disabled !== undefined ? action.disabled(cellValues) : false}>
                            <Grid container gap={2}>
                                <Grid>{action.icon}</Grid>
                                <Grid>{action.name}</Grid>
                            </Grid>
                        </MenuItem>
                    ) : null,
                )}
            </Menu>
        </div>
    );
}
