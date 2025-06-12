import { useState, useEffect } from "react";
import {
    Icon,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    List,
    Box,
    BoxProps,
    Popper,
    Fade,
    Paper,
    PopperPlacementType,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CircleIcon from "@mui/icons-material/Circle";

import { useMatch, useNavigate, useResolvedPath } from "react-router-dom";

type IListItemLinkProps = {
    to: string;
    icon: string;
    label: string;
    routes: Array<{
        to: string;
        label: string;
    }>;
    onClick: (() => void) | undefined;
    isSidebarOpen?: boolean;
} & BoxProps;

interface IListItemButtonProps {
    to: string;
    label: string;
    onClick: (() => void) | undefined;
    showIcon: boolean;
}

const ListItemLink: React.FC<IListItemButtonProps> = ({ to, label, onClick, showIcon }) => {
    const navigate = useNavigate();

    const resolvedPath = useResolvedPath(to);
    const match = useMatch({ path: resolvedPath.pathname, end: false });

    const handleClick = (to: string) => {
        navigate(to);
        onClick?.();
    };

    return (
        <ListItemButton sx={{ pl: 4, height: 40 }} selected={!!match} onClick={() => handleClick(to)}>
            {showIcon && (
                <ListItemIcon sx={{ minWidth: 40 }}>
                    {match ? (
                        <CircleIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    )}
                </ListItemIcon>
            )}
            <ListItemText primary={label} primaryTypographyProps={{ style: { whiteSpace: "normal", fontSize: 14 } }} />
        </ListItemButton>
    );
};

export function ListItemOptionsLink({ to, icon, label, routes, onClick, isSidebarOpen }: IListItemLinkProps) {
    const [open, setOpen] = useState(false);

    const resolvedPath = useResolvedPath(to);
    const match = useMatch({ path: resolvedPath.pathname, end: false });

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [openPopover, setOpenPopover] = useState(false);
    const [placement, setPlacement] = useState<PopperPlacementType>();

    const handleOpenCollapseClick = () => {
        setOpen(!open);
    };

    useEffect(() => {
        if (!!match) {
            setOpen(true);
        }
    }, []);

    const handleClick = (newPlacement: PopperPlacementType) => (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
        setOpenPopover((prev) => placement !== newPlacement || !prev);
        setPlacement(newPlacement);
    };

    return (
        <>
            {!isSidebarOpen && (
                <Box sx={{ width: 500 }} component={Paper}>
                    <Popper
                        open={openPopover}
                        anchorEl={anchorEl}
                        placement={placement}
                        transition
                        onMouseEnter={() => setOpenPopover(true)}
                        onMouseLeave={() => setOpenPopover(false)}
                        style={{
                            zIndex: 2,
                        }}>
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={350}>
                                <Paper>
                                    {routes.map((drawerOption) => (
                                        <ListItemLink
                                            to={drawerOption.to}
                                            key={drawerOption.to}
                                            label={drawerOption.label}
                                            onClick={onClick}
                                            showIcon={false}
                                        />
                                    ))}
                                </Paper>
                            </Fade>
                        )}
                    </Popper>
                </Box>
            )}

            <ListItemButton
                selected={!!match}
                onClick={handleOpenCollapseClick}
                onMouseEnter={handleClick("right")}
                onMouseLeave={() => setOpenPopover(false)}
                style={{ height: 42 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon className='material-icons-outlined'>{icon}</Icon>
                </ListItemIcon>
                {isSidebarOpen && (
                    <>
                        <ListItemText
                            primary={label}
                            primaryTypographyProps={{ style: { whiteSpace: "normal", fontSize: 14 } }}
                        />
                        {open ? (
                            <ExpandLess sx={{ fontSize: 20, color: "text.secondary" }} />
                        ) : (
                            <ExpandMore sx={{ fontSize: 20, color: "text.secondary" }} />
                        )}
                    </>
                )}
            </ListItemButton>
            {isSidebarOpen && (
                <Collapse in={open} timeout='auto' unmountOnExit>
                    <List component='div' disablePadding>
                        {routes.map((drawerOption) => (
                            <ListItemLink
                                to={drawerOption.to}
                                key={drawerOption.to}
                                label={drawerOption.label}
                                onClick={onClick}
                                showIcon={true}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
}
