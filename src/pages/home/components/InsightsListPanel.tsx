import { useEffect, useState } from "react";
import { Box, Grid, Icon, ListItemText, MenuItem, MenuList, Skeleton, SxProps, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { getListInsights, IListInsights } from "@/services/reports";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

type InsightsListPanelProps = {
    isThemeLight: boolean;
    colorBorderSystem: string;
    isSidebarOpen: boolean;
};

export function InsightsListPanel({ isThemeLight, colorBorderSystem, isSidebarOpen }: InsightsListPanelProps) {
    const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
    const [listInsightsPanel, setListInsightsPanel] = useState<IListInsights>();

    const { getInfoError } = useGlobal();

    const navigate = useNavigate();

    const onRefreshListInsights = async () => {
        try {
            await searchListInsightsPanel();

            toast.success("Insights atualizado com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    async function searchListInsightsPanel() {
        try {
            setLoadingInsights(true);

            const dataListInsights = await getListInsights({});

            setListInsightsPanel(dataListInsights);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingInsights(false);
        }
    }

    useEffect(() => {
        async function execute() {
            await searchListInsightsPanel();
        }

        execute();
    }, []);

    const sxMenuProps: SxProps = {
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: "100%",
        borderRadius: 4,
        border: `1px solid ${colorBorderSystem}`,
        background: isThemeLight ? "#ffffff" : "linear-gradient(135deg, #071d20, #0A2A2F)",
        boxShadow: isThemeLight
            ? " rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
            : "none",
    };

    const listItemTextSt: SxProps = {
        width: "inherit",
        "& span": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
    };

    return (
        <Grid item sx={sxMenuProps}>
            <Grid item xs={12} md={12} mt={0.5} height={"45px"}>
                <Typography
                    color='text.primary'
                    fontWeight={"bold"}
                    lineHeight={3}
                    fontSize={14}
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                    }}>
                    <RocketLaunchOutlinedIcon color={isThemeLight ? "info" : "primary"} sx={{ mr: 0.5 }} /> Insights
                </Typography>
            </Grid>

            {loadingInsights ? (
                <Grid
                    mt={0}
                    sx={{
                        overflow: "auto",
                        height: "91%",
                        width: "93%",
                    }}
                    container
                    gap={1}
                    margin={2}>
                    {[...Array(6)].map((_, index) => (
                        <Grid item xs={12} key={index}>
                            <Skeleton variant='rounded' animation='wave' height={85} sx={{ borderRadius: 1.5 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                listInsightsPanel &&
                (() => {
                    const [qualified, not_qualified, account_total] = listInsightsPanel.qualified_account.split(";");

                    return (
                        <>
                            <MenuList
                                component={Box}
                                sx={{
                                    overflow: "auto",
                                    height: "620px",
                                    borderBlock: `1px solid ${colorBorderSystem}`,
                                    "&::-webkit-scrollbar": {
                                        width: "6px",
                                        height: "6px",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: colorBorderSystem,
                                    },
                                }}
                                margin={2}>
                                {[
                                    {
                                        title: "Aniversariantes",
                                        subtitle: "Cooperados fazendo aniversário este mês",
                                        value: listInsightsPanel.birthdays_cooperated,
                                        icon: "cake",
                                        icon_color: "#FFB74D",
                                        link: "/relatorios/catalogo/painel/aniversarios",
                                    },
                                    {
                                        title: "Crédito Pré-Aprovado",
                                        subtitle: "Cooperados com crédito pré-aprovado",
                                        value: listInsightsPanel.pre_approved,
                                        icon: "fact_check",
                                        icon_color: "#cfcfcf",
                                        link: "/relatorios/catalogo/painel/pre-aprovado",
                                    },
                                    {
                                        title: "Inadimplência Operação",
                                        subtitle: "Cooperados com inadimplência de crédito",
                                        value: listInsightsPanel.inad_operations,
                                        icon: "block",
                                        icon_color: "#ec7c31",
                                        link: "/relatorios/catalogo/painel/inad-operacoes",
                                    },
                                    {
                                        title: "Inadimplência Cartão",
                                        subtitle: "Cooperados com inadimplência no cartão",
                                        value: listInsightsPanel.inad_cards,
                                        icon: "credit_card_off",
                                        icon_color: "#E53935",
                                        link: "/relatorios/catalogo/painel/inad-cartoes",
                                    },
                                    {
                                        title: "Eventos a expirar",
                                        subtitle:
                                            "Eventos próximos do vencimento este mês (ex.: CRL, Investimento, Cadastro)",
                                        value: listInsightsPanel.events_expiring,
                                        icon: "calendar_month",
                                        icon_color: "#fa7305",
                                        link: "/relatorios/catalogo/painel/eventos-vencimentos",
                                    },
                                    {
                                        title: "Desembolso",
                                        subtitle: "Valor total desembolsado",
                                        value: listInsightsPanel.disbursement,
                                        icon: "currency_exchange",
                                        icon_color: "#2E7D32",
                                        link: "/relatorios/catalogo/painel/desembolso",
                                    },
                                    {
                                        title: "Contas Qualificadas",
                                        subtitle: "Contagem de Contas qualificadas/Não Qualificadas",
                                        value: `✅ ${qualified} | ❌ ${not_qualified} | Total: ${account_total}`,
                                        icon: "verified_user",
                                        icon_color: "#21D87D",
                                        link: "/relatorios/catalogo/painel/contas-qualificadas",
                                    },
                                    {
                                        title: "Contratos de Desconto de Título",
                                        subtitle: "Contratos de Desconto de Título",
                                        value: listInsightsPanel.discounted_titles,
                                        icon: "local_atm",
                                        icon_color: "#FFC107",
                                        link: "/relatorios/catalogo/painel/titulos-descontados",
                                    },
                                    {
                                        title: "Novos Adiantamentos a Depositante",
                                        subtitle: "Cooperados com adiantamento depositante",
                                        value: listInsightsPanel.deposit_advance,
                                        icon: "new_releases",
                                        icon_color: "#fa2205",
                                        link: "/relatorios/catalogo/painel/adiantamento-depositantes",
                                    },
                                    {
                                        title: "Novos Cooperados",
                                        subtitle: "Novos cooperados (💚 Ativos) neste mês",
                                        value: listInsightsPanel.new_cooperated,
                                        icon: "stars",
                                        icon_color: "#FF9800",
                                        link: "/relatorios/catalogo/painel/painel-cooperado",
                                    },
                                ].map((card, index) => {
                                    const { title, subtitle, value, icon, icon_color, link } = card;

                                    return (
                                        <MenuItem
                                            key={index}
                                            sx={{
                                                borderBottom: `1px dashed ${colorBorderSystem}`,
                                                "&:last-child": { borderBottom: "none" },
                                                cursor: link ? "pointer" : "default",
                                            }}
                                            onClick={() => navigate(`${link}`)}
                                            title={subtitle}>
                                            <Grid container flexDirection='column' padding={0.75} gap={0.5}>
                                                <ListItemText sx={listItemTextSt}>
                                                    <Box display='flex' alignItems='center' justifyContent={"center"}>
                                                        <Icon sx={{ mr: 0.5, fontSize: 18, color: icon_color }}>
                                                            {icon}
                                                        </Icon>
                                                        <Typography
                                                            component={"span"}
                                                            variant='subtitle1'
                                                            fontWeight='bold'
                                                            fontSize={!isSidebarOpen ? 15 : 14}
                                                            color={"text.primary"}>
                                                            {title}
                                                        </Typography>
                                                    </Box>
                                                </ListItemText>
                                                <Typography
                                                    whiteSpace={"wrap"}
                                                    variant='h6'
                                                    color={"text.secondary"}
                                                    fontSize={!isSidebarOpen ? 14 : 12}>
                                                    {value}
                                                </Typography>
                                            </Grid>
                                        </MenuItem>
                                    );
                                })}
                            </MenuList>
                            <LoadingButton
                                fullWidth
                                variant='text'
                                color={isThemeLight ? "info" : "primary"}
                                size='medium'
                                loading={loadingInsights}
                                onClick={() => onRefreshListInsights()}
                                sx={{ height: "45px", borderRadius: "0px 0px 16px 16px" }}
                                startIcon={<Icon>cached_outlined_icon</Icon>}>
                                Atualizar
                            </LoadingButton>
                        </>
                    );
                })()
            )}
        </Grid>
    );
}
