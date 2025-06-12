import { useState } from "react";
import { Box, Typography, Paper, IconButton, Avatar, Switch, Tooltip, Chip } from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import OpenInBrowserOutlinedIcon from "@mui/icons-material/OpenInBrowserOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import { changeStatusBannerByID, deleteBannerByID, ISearchLBanners } from "@/services/homepage-config";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";
import { formatDate } from "@/functions/date";
import { getBaseURL } from "@/functions/getBaseURL";
import { useMediaQuery } from "@/contexts/MediaQueryContext";

export interface SortableBannerItemProps {
    id: number;
    title: string;
    description?: string | null;
    display_order: number;
    is_active: boolean;
    respect_period: boolean;
    is_external_link: boolean;
    end_date?: Date | null;
    link_url: string;
    image_url: string;
}

interface SortableBannerProps {
    banner: ISearchLBanners;
    enableDragMode: boolean;
    enableDeleteMode: boolean;
    index: number;
    openDrawerBannerFields?: (idBanner: number) => void;
    updateListBanner?: () => void;
}

export function SortableBannerItem({
    banner,
    enableDragMode,
    enableDeleteMode,
    index,
    openDrawerBannerFields,
    updateListBanner,
}: SortableBannerProps) {
    const [isActive, setIsActive] = useState<boolean>(banner.is_active);
    const [loadingStatus, setLoadingStatus] = useState<boolean>(false);

    const { device } = useMediaQuery();
    const isMobile = device === "Mobile";

    const confirm = useConfirm();

    const {
        getInfoError,
        theme: themeContextGlobal,
        colorBorderSystem,
        colorBackgroundSystem,
        colorBoxShadowSystem,
        redBlur,
        cyanBlur,
    } = useGlobal();

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: banner.id,
        disabled: !enableDragMode,
    });

    const isThemeLight = themeContextGlobal === "light";

    const isExpiredPeriod = banner.respect_period && banner.end_date && new Date() > new Date(banner.end_date);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        width: "100%",
    };

    const handleDeleteBanner = (id: number, title: string) => {
        confirm({
            title: `Deseja realmente apagar o banner "${title}"?`,
            description: `O banner "${title}" será excluído permanentemente.`,
        }).then(async () => {
            try {
                await deleteBannerByID(id);

                updateListBanner?.();

                toast.success(`Banner "${title}" excluído com sucesso!`);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            }
        });
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            elevation={0}
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: !isMobile ? 1.5 : 0.5,
                border: `1px solid ${!isActive ? "#DC2626" : isExpiredPeriod ? "#FF7043" : colorBorderSystem}`,
                boxShadow: colorBoxShadowSystem,
                background: colorBackgroundSystem,
                backdropFilter: "blur(25px)",
                backgroundImage: isThemeLight ? "none" : `url(${cyanBlur}), url(${redBlur})`,
                backgroundRepeat: "no-repeat, no-repeat",
                backgroundSize: "50%, 50%",
                backgroundPosition: "right top, left bottom",
                overflowX: "auto",
                "&::-webkit-scrollbar": {
                    height: "6px",
                },
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                {enableDragMode && (
                    <IconButton
                        disabled={enableDragMode ? false : true}
                        color='default'
                        title='Arrastar'
                        sx={{ cursor: enableDragMode ? "grab" : "default" }}
                        {...(enableDragMode ? listeners : {})}
                        {...(enableDragMode ? attributes : {})}>
                        <DragIndicatorOutlinedIcon color={enableDragMode ? "action" : "disabled"} />
                    </IconButton>
                )}

                {enableDeleteMode && (
                    <IconButton
                        disabled={enableDeleteMode ? false : true}
                        color={enableDeleteMode ? "error" : "inherit"}
                        title='Excluir'
                        onClick={() => handleDeleteBanner(banner.id, banner.title)}
                        sx={{ cursor: enableDeleteMode ? "pointer" : "default" }}>
                        <DeleteForeverIcon color={enableDeleteMode ? "error" : "disabled"} />
                    </IconButton>
                )}

                <IconButton
                    color='info'
                    title='Editar'
                    onClick={() => {
                        openDrawerBannerFields?.(banner.id);
                    }}>
                    <EditIcon color='success' />
                </IconButton>

                {enableDragMode && (
                    <Box
                        component='span'
                        sx={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            backgroundColor: "#009688",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginInline: 1.5,
                        }}>
                        <Typography fontWeight='bold' fontSize={11} color='white'>
                            {index + 1}
                        </Typography>
                    </Box>
                )}

                <Avatar
                    variant='rounded'
                    src={getBaseURL() + banner.image_url}
                    alt={banner.title}
                    sx={{
                        width: !isMobile ? 220 : 120,
                        height: 50,
                        borderRadius: 1,
                        background: "#00373e",
                        marginBlock: !isMobile ? "none" : 0.5,
                    }}>
                    <ViewCarouselIcon sx={{ color: "white" }} />
                </Avatar>

                <Box
                    sx={{
                        width: !isMobile ? "none" : 100,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginInline: !isMobile ? 0.5 : 0,
                    }}>
                    <Typography fontWeight='bold' fontSize={14} noWrap ml={1.5}>
                        {banner.title}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: !isMobile ? "flex" : "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginInline: 2,
                    }}>
                    <Typography color='text.secondary' fontSize={14} noWrap>
                        {banner?.description || ""}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginInline: !isMobile ? 1.5 : 0.25 }}>
                {isExpiredPeriod && (
                    <Tooltip title='Este banner expirou e não está mais visível no carrossel. Caso queira reativá-lo, altere as datas do período ou desative-o.'>
                        <Chip
                            label={
                                <Typography color='#FF7043' fontSize={!isMobile ? 12 : 10}>
                                    {!isMobile ? "Banner Expirado" : "Expirado"}
                                </Typography>
                            }
                            variant='outlined'
                            component={"span"}
                            size='medium'
                            sx={{
                                cursor: "default",
                                mr: 0.5,
                                height: "22px",
                                color: "#e95b30",
                                borderColor: "#FF7043",
                                backgroundColor: isThemeLight ? "none" : "rgba(233, 91, 48, 0.25)",
                                "& .MuiChip-label": {
                                    fontWeight: "bold",
                                },
                            }}
                        />
                    </Tooltip>
                )}

                {banner.is_external_link ? (
                    <Tooltip title={banner.link_url ? "Link Externo ✅ Ativo" : "Link Externo ❌ Inativo"}>
                        <OpenInNewOutlinedIcon color={banner.link_url ? "success" : "disabled"} sx={{ fontSize: 25 }} />
                    </Tooltip>
                ) : (
                    <Tooltip title={banner.link_url ? "Link Externo ✅ Ativo" : "Link Externo ❌ Inativo"}>
                        <OpenInBrowserOutlinedIcon
                            color={banner.link_url ? "success" : "disabled"}
                            sx={{ fontSize: 28 }}
                        />
                    </Tooltip>
                )}

                {banner.respect_period ? (
                    <Tooltip
                        title={
                            <Typography fontSize={12}>
                                <b>Período ✅ Ativo</b> <br />
                                <br />
                                <b>Data Início:</b>{" "}
                                {banner.start_date ? formatDate(banner.start_date, "DD/MM/YYYY HH:mm:ss") : ""}
                                <br />
                                <b>Data Fim:</b>{" "}
                                {banner.end_date ? formatDate(banner.end_date, "DD/MM/YYYY HH:mm:ss") : ""}
                            </Typography>
                        }>
                        <EventAvailableOutlinedIcon color='success' />
                    </Tooltip>
                ) : (
                    <Tooltip title='Período ❌ Inativo'>
                        <EventBusyOutlinedIcon color='disabled' />
                    </Tooltip>
                )}

                {isActive ? (
                    <Tooltip title='Banner ✅ Ativo'>
                        <CheckCircleIcon color='success' />
                    </Tooltip>
                ) : (
                    <Tooltip title='Banner ❌ Inativo'>
                        <CancelIcon color='error' />
                    </Tooltip>
                )}

                <Switch
                    checked={isActive}
                    disabled={loadingStatus}
                    onChange={async (e) => {
                        const checked = e.target.checked;
                        setIsActive(checked);
                        setLoadingStatus(true);

                        try {
                            await changeStatusBannerByID(banner.id, { is_active: checked });
                            toast.success(`Banner ${checked ? "✅ ativado" : "❌ desativado"} com sucesso!`);
                        } catch (error) {
                            setIsActive(!checked);
                            toast.error("Erro ao alterar o status do banner.");
                        } finally {
                            setTimeout(() => {
                                setLoadingStatus(false);
                            }, 1700);
                        }
                    }}
                    sx={{ marginInline: !isMobile ? "none" : -1.25 }}
                    color='success'
                />

                <Tooltip
                    placement='left'
                    title={
                        <Typography fontSize={12}>
                            <b>Data Criação:</b> {formatDate(banner.created_at, "DD/MM/YYYY HH:mm:ss")} <br />
                            <b>Data Atualização:</b>{" "}
                            {banner.updated_at
                                ? formatDate(banner.updated_at, "DD/MM/YYYY HH:mm:ss")
                                : "Sem atualização"}
                            <br />
                            <b>Criado por:</b> {banner.created_by_name}
                        </Typography>
                    }>
                    <InfoOutlinedIcon sx={{ color: "text.secondary" }} />
                </Tooltip>
            </Box>
        </Paper>
    );
}
