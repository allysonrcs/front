import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Stack,
    Switch,
    Grid,
    Breadcrumbs,
    Link,
    Divider,
    FormControlLabel,
    Skeleton,
} from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import { useNavigate } from "react-router-dom";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import { toast } from "react-toastify";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableBannerItem } from "./components/SortableBannerItem";
import { LoadingButton } from "@mui/lab";
import { changeReorderBanners, ISearchLBanners, searchAllBanners } from "@/services/homepage-config";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { useConfirm } from "material-ui-confirm";
import { BannersFields } from "./BannersFields";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import RefreshIcon from "@mui/icons-material/Refresh";

export function Banners() {
    const [loading, setLoading] = useState<boolean>(false);
    const [banners, setBanners] = useState<ISearchLBanners[]>([]);
    const [initialBannerOrder, setInitialBannerOrder] = useState<number[]>([]);
    const [idBanner, setIdBanner] = useState<number>();
    const [enableDragMode, setEnableDragMode] = useState<boolean>(false);
    const [enableDeleteMode, setEnableDeleteMode] = useState<boolean>(false);
    const [openDrawerBannerFields, setOpenDrawerBannerFields] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const {
        getInfoError,
        theme: themeContextGlobal,
        colorBorderSystem,
        colorBackgroundSystem,
        redBlur,
        cyanBlur,
    } = useGlobal();

    const navigate = useNavigate();
    const confirm = useConfirm();

    const { device } = useMediaQuery();
    const isThemeLight = themeContextGlobal === "light";
    const isMobile = device === "Mobile";

    const handleDrawerBannerFields = () => {
        setOpenDrawerBannerFields((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    function handleOpenDrawer(idBanner: number) {
        setIdBanner(idBanner);
        handleDrawerBannerFields();
    }

    const handleSaveOrderBanners = async () => {
        setLoading(true);
        try {
            const payload = banners.map((banner, index) => ({
                id: banner.id,
                display_order: index + 1,
            }));

            await changeReorderBanners(payload);
            setInitialBannerOrder(banners.map((b) => b.id));

            toast.success("Ordem dos banners atualizada com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error("Erro ao salvar a nova ordem. " + info.message);
        } finally {
            setLoading(false);
        }
    };

    async function fetchListBanners() {
        try {
            setLoading(true);

            const listBannerFetch = await searchAllBanners({});
            setBanners(listBannerFetch);
            setInitialBannerOrder(listBannerFetch.map((b) => b.id));
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    }

    const isOrderBannerChanged = (): boolean => {
        const currentOrder = banners.map((b) => b.id);
        return JSON.stringify(currentOrder) !== JSON.stringify(initialBannerOrder);
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchListBanners();
        };

        fetchData();
    }, []);

    return (
        <Grid container justifyContent='center' mt={-1} padding={2}>
            <Grid item xs={12} md={12} mt={0.5}>
                <Breadcrumbs aria-label='breadcrumb' separator='›'>
                    <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }}>
                        <SettingsOutlinedIcon sx={{ color: isThemeLight ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                        <Typography color='text.primary' sx={{ mt: 0.5 }}>
                            Funções Administrativas
                        </Typography>
                    </Typography>

                    <Link
                        color='text.primary'
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            cursor: "pointer",
                            "&:hover": {
                                color: "primary.main",
                            },
                        }}
                        underline='none'
                        onClick={() => {
                            navigate("/funcoes-administrativas/pagina-inicial");
                        }}>
                        Página Inicial
                    </Link>
                    <Typography sx={{ color: "text.secondary" }}>Banners</Typography>
                </Breadcrumbs>
            </Grid>

            <Divider
                sx={{
                    borderColor: colorBorderSystem,
                    borderStyle: "dashed",
                    width: "100%",
                    ml: 0.75,
                    mr: 0.75,
                    mb: 1,
                }}
            />

            <Grid item xs={12} mb={1} paddingInline={1}>
                <Box display='flex' justifyContent='space-between' alignItems='center' gap={1}>
                    <Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    size='medium'
                                    color='primary'
                                    disabled={enableDeleteMode}
                                    checked={enableDragMode}
                                    onChange={() => setEnableDragMode((prev) => !prev)}
                                    inputProps={{ "aria-label": "Cards Inativos" }}
                                />
                            }
                            label={
                                <Typography fontSize={14} whiteSpace={"nowrap"}>
                                    Modo de Ordenação
                                </Typography>
                            }
                            title='Alterar modo para re-ordernar Banners'
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    size='medium'
                                    color='primary'
                                    disabled={enableDragMode}
                                    checked={enableDeleteMode}
                                    onChange={() => setEnableDeleteMode((prev) => !prev)}
                                    inputProps={{ "aria-label": "Cards Inativos" }}
                                />
                            }
                            label={
                                <Typography fontSize={14} whiteSpace={"nowrap"}>
                                    Modo de Exclusão
                                </Typography>
                            }
                            title='Alterar modo para re-ordernar Banners'
                        />
                    </Box>

                    {enableDragMode && (
                        <LoadingButton
                            type='submit'
                            size='small'
                            color='success'
                            variant='contained'
                            startIcon={<SaveAsIcon />}
                            loading={loading}
                            onClick={handleSaveOrderBanners}
                            disabled={!isOrderBannerChanged()}
                            sx={{ boxShadow: "none", whiteSpace: "nowrap", paddingInline: 2 }}>
                            Salvar Ordem
                        </LoadingButton>
                    )}
                </Box>
            </Grid>

            <Grid container padding={1} mb={3}>
                <Grid item xs={12} md={12} mb={3}>
                    <Typography fontSize={18} fontWeight={700}>
                        Lista de Banners | {banners.length || "0"}
                    </Typography>
                </Grid>

                <Stack spacing={2} width='100%' sx={{ overflow: "clip" }}>
                    {loading ? (
                        <>
                            {[...Array(5)].map((_, index) => (
                                <Grid item xs={12} key={index}>
                                    <Skeleton
                                        variant='rectangular'
                                        animation='wave'
                                        width='100%'
                                        height={76}
                                        sx={{ borderRadius: 2 }}
                                    />
                                </Grid>
                            ))}
                        </>
                    ) : banners.length === 0 ? (
                        <Grid item xs={12} md={12} border={`1px dashed ${colorBorderSystem}`} borderRadius={4}>
                            <Typography fontSize={22} color='text.secondary' align='center' lineHeight={8}>
                                Nenhum Banner configurado.
                            </Typography>
                        </Grid>
                    ) : (
                        <DndContext
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => {
                                const { active, over } = event;
                                if (active.id !== over?.id) {
                                    const oldIndex = banners.findIndex((b) => b.id === active.id);
                                    const newIndex = banners.findIndex((b) => b.id === over?.id);
                                    setBanners((items) => arrayMove(items, oldIndex, newIndex));
                                }
                            }}>
                            <SortableContext items={banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                                <Stack spacing={2} width='100%'>
                                    {banners.map((banner, index) => (
                                        <SortableBannerItem
                                            key={banner.id}
                                            banner={banner}
                                            index={index}
                                            enableDragMode={enableDragMode}
                                            enableDeleteMode={enableDeleteMode}
                                            openDrawerBannerFields={handleOpenDrawer}
                                            updateListBanner={fetchListBanners}
                                        />
                                    ))}
                                </Stack>
                            </SortableContext>
                        </DndContext>
                    )}
                </Stack>
            </Grid>

            <TemporaryDrawer
                sx={{
                    "& .MuiDrawer-paperAnchorRight": {
                        width: isMobile ? "100%" : "70%",
                    },
                    "& .MuiModal-backdrop": {
                        backgroundColor: "rgb(0 0 0 / 30%)",
                    },
                    "& .MuiDrawer-paper": {
                        background: colorBackgroundSystem,
                        borderLeft: `1px solid ${colorBorderSystem}`,
                        backdropFilter: "blur(30px)",
                        backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                        backgroundRepeat: "no-repeat, no-repeat",
                        backgroundSize: "50%, 50%",
                        backgroundPosition: "right top, left bottom",
                    },
                }}
                open={openDrawerBannerFields}
                title={idBanner ? "Editar Banner" : "Criar Banner"}
                closeButton={async () => {
                    await confirm({
                        title: "Confirmação de Fechamento de Janela",
                        description: (
                            <>
                                <Typography>
                                    Você tem certeza de que deseja fechar esta janela? Todas as informações preenchidas
                                    serão perdidas e não poderão ser recuperadas.
                                </Typography>
                            </>
                        ),
                    })
                        .then(() => {
                            if (idBanner) {
                                setIdBanner(undefined);
                            }

                            handleDrawerBannerFields();
                        })
                        .catch(() => {});
                }}>
                <BannersFields idBanner={idBanner} updateListBanner={fetchListBanners} />
            </TemporaryDrawer>

            <BasicSpeedDial
                ariaLabel='Opções'
                open={speedDialOpen}
                onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                actions={[
                    {
                        icon: <AddCircleOutlineOutlinedIcon color='action' />,
                        name: "Criar Banner",
                        click_event: () => {
                            setIdBanner(undefined);
                            handleDrawerBannerFields();
                        },
                    },
                    {
                        icon: <RefreshIcon color='action' />,
                        name: "Atualizar Lista",
                        click_event: () => {
                            fetchListBanners();
                            setSpeedDialOpen(false);
                            toast.success("A lista de banners foi atualizada com sucesso!");
                        },
                    },
                ]}
                sx={{
                    position: "absolute",
                    bottom: 17,
                    right: 8,
                    "& .MuiSpeedDial-fab": {
                        width: "40px",
                        height: "40px",
                        boxShadow: "0 0 12px 1px #0096876f",
                    },
                }}
            />
        </Grid>
    );
}
