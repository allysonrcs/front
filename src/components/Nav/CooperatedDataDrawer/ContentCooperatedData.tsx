import { useEffect, useState } from "react";
import { Badge, Box, Divider, Grid, GridProps, IconButton, Skeleton, styled, Tooltip, Typography } from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { ISearchExtClientAllInfo } from "@/services/ext-tables";
import { formatCnpjCpf, formatToBRLCurrency } from "@/functions/number";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridToolbarContainer,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { formatDate } from "@/functions/date";
import { copyText } from "@/functions/text";
import { statusCurrentAccountMap } from "@/constants/array-type-status-current-account-client-complet";
import { useCooperatedData } from "@/contexts/CooperatedDataContext";
import moment from "moment";
import WhatsAppButton from "@/components/WhatsappButton/WhatsappButton";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import IconMasterCardSVG from "@/assets/icons/icon-master-card.svg?react";
import IconVisaCardSVG from "@/assets/icons/icon-visa-card.svg?react";
import IconBndesCardSVG from "@/assets/icons/icon-bndes-card.svg?react";
import IconCabalCardPNG from "@/assets/icons/icon-cabal-logo.png";

export type ExtClientInfoProps = {
    idExtClient?: number;
} & GridProps;

interface StyledBadgeProps {
    badgeColor: string;
}

export const mapValueCurrentAccount = (value: string | null | undefined) => {
    switch (value) {
        case "ATIVA":
            return "🟢 Ativa";
        case "INATIVA":
            return "🔴 Inativa";
        case "ENCERRADA":
            return "❌ Encerrada";
        case "BLOQUEADA":
            return "🚫 Bloqueada";
        default:
            return "⚠️ Não Possui";
    }
};

export function ContentCooperatedData({ idExtClient, ...props }: ExtClientInfoProps) {
    const [copied, setCopied] = useState(false);

    const {
        cooperatedContent,
        infoDataAccountClient,
        infoDataCardsClient,
        infoDataDisbursementClient,
        toggleDrawer,
        closeDrawer,
        clearContent,
    } = useCooperatedData();

    const { theme, colorBorderSystem, colorScrollSystem } = useGlobal();

    const isThemeLight = theme === "light";

    const productsIAP: { key: keyof ISearchExtClientAllInfo; label: string }[] = [
        { key: "cambio", label: "Câmbio" },
        { key: "cons_pesado", label: "Consórcio Pesados" },
        { key: "lca", label: "LCA" },
        { key: "seg_risco_financ", label: "Seguro Risco Financeiro" },
        { key: "utiliz_cartao_cred", label: "Cartão de Crédito" },
        { key: "cons_servicos", label: "Consórcio Serviço" },
        { key: "lci", label: "LCI" },
        { key: "seg_rural", label: "Seguro Rural" },
        { key: "utiliz_cart_deb", label: "Cartão de Débito" },
        { key: "coopcerto", label: "Coopcerto" },
        { key: "rdc", label: "RDC" },
        { key: "sipag", label: "SIPAG" },
        { key: "ch_esp_conta_garant", label: "Cheque Especial/Conta Garantida" },
        { key: "credito_rural", label: "Crédito Rural" },
        { key: "poupanca", label: "Poupança" },
        { key: "tag", label: "TAG" },
        { key: "cobranca", label: "Cobrança" },
        { key: "deb_auto_efetivado", label: "Débito Automático Efetivado" },
        { key: "pix", label: "Pix" },
        { key: "td", label: "Título Descontado" },
        { key: "cons_auto", label: "Consórcio Automóvel" },
        { key: "egd", label: "EGD" },
        { key: "pgbl", label: "Previdência" },
        { key: "unimed", label: "Unimed" },
        { key: "cons_bens_moveis", label: "Consórcio Bens Móveis" },
        { key: "emprestimo", label: "Empréstimo" },
        { key: "seg_auto", label: "Seguro Auto" },
        { key: "vgbl", label: "VGBL" },
        { key: "cons_imovel", label: "Consórcio Imóvel" },
        { key: "financiamento", label: "Financiamento" },
        { key: "seg_massificado", label: "Seguro Massificado" },
        { key: "vida_prestamista", label: "Vida Prestamista" },
        { key: "cons_moto", label: "Consórcio Moto" },
        { key: "fundo_investimento", label: "Fundo de Investimento" },
        { key: "seg_patrimonial", label: "Seguro Patrimonial" },
        { key: "seg_vida_pf_pj", label: "Vida/Coletivo" },
    ];

    type FlagsCards = "MASTERCARD" | "VISA CREDITO" | "CABAL CREDITO BNDES" | "CABAL CREDITO";

    const cardsFlags: {
        [key in FlagsCards]: {
            icon: JSX.Element;
        };
    } = {
        MASTERCARD: {
            icon: <IconMasterCardSVG width={35} />,
        },
        "VISA CREDITO": {
            icon: <IconVisaCardSVG height={13} />,
        },
        "CABAL CREDITO BNDES": {
            icon: <IconBndesCardSVG width={45} />,
        },
        "CABAL CREDITO": {
            icon: <img src={IconCabalCardPNG} alt='cabal' style={{ width: 25, height: 25 }} />,
        },
    };

    const mapValueToEmoji = (value: number | null | undefined): string => {
        switch (value) {
            case 0:
                return "❌ ";
            case 1:
                return "✅ ";
            case 2:
                return "🅿️ ";
            default:
                return "";
        }
    };

    const getStatusEmoji = (status: string): string => {
        if (status.startsWith("OPERATIVO")) return "🟢";
        if (status.startsWith("BLOQUEIO")) return "🔴";
        if (status.startsWith("ANULADA")) return "❌";
        return "";
    };

    const copyToClipboard = async (text: string) => {
        const message = await copyText(text);
        toast.info(message);
    };

    const StyledBadge = styled(Badge)<StyledBadgeProps>(({ theme, badgeColor }) => ({
        "& .MuiBadge-badge": {
            backgroundColor: badgeColor,
            color: badgeColor,
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            "&::after": {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                animation: "ripple 1.2s infinite ease-in-out",
                border: "1px solid currentColor",
                content: '""',
            },
        },
        "@keyframes ripple": {
            "0%": {
                transform: "scale(.8)",
                opacity: 1,
            },
            "100%": {
                transform: "scale(2.4)",
                opacity: 0,
            },
        },
    }));

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Box sx={{ p: 1, display: "flex", justifyContent: "start" }}>
                        <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
                    </Box>
                </Box>
            </GridToolbarContainer>
        );
    };

    const closeContent = () => {
        setTimeout(() => {
            toggleDrawer?.();
            clearContent();
        }, 200);

        toggleDrawer?.();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeContent();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const columnsAccount: GridColDef[] = [
        {
            field: "numconta",
            headerName: "Número",
            minWidth: 100,
            flex: 1,
        },
        {
            field: "conta_modalidade",
            headerName: "Modalidade",
            minWidth: 140,
            flex: 1,
        },
        {
            field: "conta_tipo",
            headerName: "Tipo",
            minWidth: 135,
        },
        {
            field: "conta_situacao",
            headerName: "Situação",
            minWidth: 115,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14} title={statusCurrentAccountMap[value] || value}>
                        {statusCurrentAccountMap[value] || value}
                    </Typography>
                );
            },
        },
        {
            field: "pacote_nome",
            headerName: "Nome do Pacote",
            minWidth: 160,
        },
        {
            field: "pacote_valor",
            headerName: "Valor do Pacote",
            align: "center",
            width: 120,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "tem_limite",
            headerName: "Limite",
            width: 65,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }: any) => {
                return (
                    <Typography title={value ? "Possui" : "Não Possui"} sx={{ cursor: "default" }}>
                        {value ? "✅" : "❌"}
                    </Typography>
                );
            },
        },
        {
            field: "tem_chequeplus",
            headerName: "Cheque Plus",
            width: 110,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }: any) => {
                return (
                    <Typography title={value ? "Possui" : "Não Possui"} sx={{ cursor: "default" }}>
                        {value ? "✅" : "❌"}
                    </Typography>
                );
            },
        },
        {
            field: "tem_segprestamista",
            headerName: "Seguro Prestamista",
            width: 145,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }: any) => {
                return (
                    <Typography title={value ? "Possui" : "Não Possui"} sx={{ cursor: "default" }}>
                        {value ? "✅" : "❌"}
                    </Typography>
                );
            },
        },
        {
            field: "dt_abertura",
            headerName: "Data Abertura",
            minWidth: 108,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "dt_ultmovimento",
            headerName: "Data Último Movimento",
            minWidth: 168,
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "dt_inativacao",
            headerName: "Data Inativação",
            minWidth: 120,
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "dt_encerramento",
            headerName: "Data Encerramento",
            minWidth: 140,
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
    ];

    const columnsCards: GridColDef[] = [
        {
            field: "nome_cartao",
            headerName: "Nome do Cartão",
            headerAlign: "center",
            minWidth: 185,
        },
        {
            field: "titularidade",
            headerName: "Titularidade",
            headerAlign: "center",
            align: "center",
            width: 95,
        },
        {
            field: "conta_cartao",
            headerName: "Conta Cartão",
            headerAlign: "center",
            align: "center",
            minWidth: 130,
        },
        {
            field: "sit_conta_cartao",
            headerName: "Situação Conta Cartão",
            headerAlign: "center",
            minWidth: 170,
            renderCell: (params) => {
                const text = params.value as string;
                const emoji = getStatusEmoji(text);
                return (
                    <Typography fontSize={14} title={text}>
                        {emoji && <span style={{ marginRight: 4 }}>{emoji}</span>}
                        {text}
                    </Typography>
                );
            },
        },
        {
            field: "numero_cartao",
            headerName: "Número Cartao",
            headerAlign: "center",
            align: "center",
            minWidth: 140,
        },
        {
            field: "produto_cartao",
            headerName: "Produto Cartao",
            headerAlign: "center",
            align: "center",
            minWidth: 290,
        },
        {
            field: "bandeira",
            headerName: "Bandeira",
            headerAlign: "center",
            align: "center",
            width: 75,
            renderCell: (params: GridRenderCellParams) => {
                const value = params.value as FlagsCards | undefined;

                const flagsInfo =
                    value && cardsFlags[value] ? cardsFlags[value] : { icon: null, label: value || "Indefinido" };

                return (
                    <Typography mt={1} title={params.value}>
                        {flagsInfo.icon}
                    </Typography>
                );
            },
        },
        {
            field: "sit_cartao",
            headerName: "Situação Cartão",
            headerAlign: "center",
            minWidth: 160,
        },
        {
            field: "data_sit_conta_cartao",
            headerName: "Data Situação Conta Cartao",
            headerAlign: "center",
            align: "center",
            minWidth: 195,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY") || "-"}</Typography>;
            },
        },
        {
            field: "data_sit_cartao",
            headerName: "Data Situação Cartao",
            headerAlign: "center",
            align: "center",
            minWidth: 155,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY") || "-"}</Typography>;
            },
        },
        {
            field: "dia_vencimento",
            headerName: "Dia Vencimento",
            headerAlign: "center",
            align: "center",
            minWidth: 120,
        },
        {
            field: "cartao_chip",
            headerName: "Cartão Chip",
            headerAlign: "center",
            align: "center",
            width: 95,
            renderCell: ({ value }: any) => {
                return (
                    <Typography
                        title={value === 1 ? "Possui" : value === 0 ? "Não Possui" : ""}
                        sx={{ cursor: "default" }}>
                        {value === 1 ? "✅" : value === 0 ? "❌" : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "fatura_impressa",
            headerName: "Fatura Impressa",
            headerAlign: "center",
            align: "center",
            minWidth: 125,
            renderCell: ({ value }: any) => {
                return (
                    <Typography
                        title={value === 1 ? "Possui" : value === 0 ? "Não Possui" : ""}
                        sx={{ cursor: "default" }}>
                        {value === 1 ? "✅" : value === 0 ? "❌" : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "deb_auto",
            headerName: "Débito Automático",
            headerAlign: "center",
            align: "center",
            minWidth: 140,
            renderCell: ({ value }: any) => {
                return (
                    <Typography
                        title={value === 1 ? "Possui" : value === 0 ? "Não Possui" : ""}
                        sx={{ cursor: "default" }}>
                        {value === 1 ? "✅" : value === 0 ? "❌" : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "conta_deb_auto",
            headerName: "Conta Débito Automático",
            headerAlign: "center",
            align: "center",
            minWidth: 180,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value || "-"}</Typography>;
            },
        },
        {
            field: "conta_fun_deb",
            headerName: "Conta Função Automático",
            headerAlign: "center",
            align: "center",
            minWidth: 185,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value || "-"}</Typography>;
            },
        },
        {
            field: "servico_add",
            headerName: "Serviço Adicionado",
            headerAlign: "center",
            align: "center",
            minWidth: 140,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value || "-"}</Typography>;
            },
        },
        {
            field: "data_cadastro",
            headerName: "Data Cadastro",
            headerAlign: "center",
            align: "center",
            minWidth: 110,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY") || "-"}</Typography>;
            },
        },
        {
            field: "data_emissao",
            headerName: "Data Emissão",
            headerAlign: "center",
            align: "center",
            minWidth: 110,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY") || "-"}</Typography>;
            },
        },
        {
            field: "data_atv_cred",
            headerName: "Data Ativamento Crédito",
            headerAlign: "center",
            align: "center",
            minWidth: 175,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY") || "-"}</Typography>;
            },
        },
        {
            field: "data_pri_compra_cred",
            headerName: "Data Primeira Compra Crédito",
            headerAlign: "center",
            align: "center",
            minWidth: 208,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY") || "-"}</Typography>;
            },
        },
        {
            field: "data_ult_compra_cred",
            headerName: "Data Última Compra Crédito",
            headerAlign: "center",
            align: "center",
            minWidth: 195,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY") || "-"}</Typography>;
            },
        },
        {
            field: "data_validade_cartao",
            headerName: "Data Validade Cartão",
            headerAlign: "center",
            align: "center",
            minWidth: 155,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY") || "-"}</Typography>;
            },
        },
        {
            field: "data_inad",
            headerName: "Data Inadimplência",
            headerAlign: "center",
            align: "center",
            minWidth: 140,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY") || "-"}</Typography>;
            },
        },
        {
            field: "valor_limite",
            headerName: "Valor Limite",
            headerAlign: "center",
            align: "center",
            minWidth: 140,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "valor_divida_cons",
            headerName: "Valor Dívida Consolidada",
            headerAlign: "center",
            align: "center",
            minWidth: 178,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "valor_prox_fatura",
            headerName: "Valor Próxima Fatura",
            headerAlign: "center",
            align: "center",
            minWidth: 155,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
    ];

    const columnsDisbursement: GridColDef[] = [
        {
            field: "data_apuracao",
            headerName: "Data Apuração",
            headerAlign: "center",
            align: "center",
            minWidth: 168,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "conta_corrente",
            headerName: "Conta Corrente",
            headerAlign: "center",
            align: "center",
            minWidth: 120,
            flex: 1,
        },
        {
            field: "linha",
            headerName: "Linha",
            headerAlign: "center",
            align: "center",
            minWidth: 70,
            flex: 1,
        },
        {
            field: "modalidade",
            headerName: "Modalidade",
            headerAlign: "center",
            align: "center",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "valor",
            headerName: "Valor",
            headerAlign: "center",
            align: "center",
            width: 120,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "usuario",
            headerName: "Usuário que aprovou",
            headerAlign: "center",
            align: "center",
            minWidth: 220,
            flex: 1,
        },
    ];

    return (
        <>
            {cooperatedContent ? (
                <>
                    <Grid
                        sx={{
                            width: "100%",
                            height: "100%",
                            overflow: "auto",
                            "&::-webkit-scrollbar": {
                                width: "6px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: isThemeLight ? "#e0e0e0" : "#405b5f",
                            },
                        }}>
                        <Grid
                            container
                            sx={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}>
                            <IconButton
                                onClick={() => {
                                    closeContent();
                                }}
                                title='Voltar (ESC)'
                                sx={{ ml: 1 }}>
                                <ArrowCircleLeftOutlinedIcon />
                            </IconButton>

                            <Typography fontWeight='bold'>Dados do Cooperado</Typography>

                            <IconButton
                                onClick={() => {
                                    closeDrawer();

                                    setTimeout(() => {
                                        clearContent();
                                    }, 250);
                                }}
                                title='Fechar'
                                sx={{ mr: 1 }}>
                                <HighlightOffIcon />
                            </IconButton>
                        </Grid>
                        <Box
                            margin={2}
                            padding={2}
                            mt={0}
                            sx={{
                                border: `1px solid ${colorBorderSystem}`,
                                borderRadius: 4,
                                backgroundColor: isThemeLight ? "#ffffff61" : "#00161bd5",
                                backdropFilter: "blur(50px)",
                            }}>
                            <Grid container spacing={0}>
                                <Grid item xs={12} sm={12} md={12} mb={0.5} container justifyContent='space-between'>
                                    <Typography fontWeight={"900"} justifyContent='start'>
                                        📋 Informações:
                                    </Typography>
                                    <Typography fontWeight={"100"} fontSize={10} justifyContent='end'>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={10}>
                                            Data Atualização:{" "}
                                        </Typography>
                                        {cooperatedContent?.data_movimento
                                            ? formatDate(cooperatedContent.data_movimento, "DD/MM/YYYY")
                                            : "-"}
                                    </Typography>
                                </Grid>

                                <Divider sx={{ width: "100%", borderStyle: "dashed", mb: 1 }} />

                                <Grid container mb={-0.25}>
                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                            <Typography
                                                component='span'
                                                color='text.primary'
                                                fontWeight='bold'
                                                fontSize={14}
                                                mr={0.5}>
                                                Nome:
                                            </Typography>
                                            {"  "}
                                            {cooperatedContent?.cliente_nome || "-"}
                                            {window.isSecureContext && navigator.clipboard && (
                                                <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                                                    <IconButton
                                                        size='small'
                                                        color='warning'
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                cooperatedContent?.cliente_nome
                                                                    ? cooperatedContent.cliente_nome
                                                                    : "",
                                                            )
                                                        }>
                                                        <ContentCopyOutlinedIcon fontSize='small' />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                            <Typography
                                                component='span'
                                                color='text.primary'
                                                fontWeight='bold'
                                                fontSize={14}
                                                mr={0.5}>
                                                Nome fantasia:
                                            </Typography>{" "}
                                            {cooperatedContent?.cliente_fantasia || "-"}
                                            {cooperatedContent?.cliente_fantasia &&
                                                window.isSecureContext &&
                                                navigator.clipboard && (
                                                    <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                                                        <IconButton
                                                            size='small'
                                                            color='warning'
                                                            onClick={() =>
                                                                copyToClipboard(
                                                                    cooperatedContent?.cliente_fantasia
                                                                        ? cooperatedContent.cliente_fantasia
                                                                        : "",
                                                                )
                                                            }>
                                                            <ContentCopyOutlinedIcon fontSize='small' />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography fontWeight='100' color='text.secondary' mb={-0.5} fontSize={14}>
                                            <Typography
                                                component='span'
                                                color='text.primary'
                                                fontWeight='bold'
                                                fontSize={14}
                                                mr={0.5}>
                                                ID Cliente:
                                            </Typography>{" "}
                                            {cooperatedContent?.cliente_id || "-"}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container mb={-0.25}>
                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                            <Typography
                                                component='span'
                                                color='text.primary'
                                                fontWeight='bold'
                                                fontSize={14}
                                                mr={0.5}>
                                                Documento:
                                            </Typography>{" "}
                                            {cooperatedContent?.cliente_documento
                                                ? `${formatCnpjCpf(cooperatedContent?.cliente_documento)}`
                                                : ""}
                                            {window.isSecureContext && navigator.clipboard && (
                                                <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                                                    <IconButton
                                                        size='small'
                                                        color='warning'
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                cooperatedContent?.cliente_documento
                                                                    ? cooperatedContent?.cliente_documento
                                                                    : "",
                                                            )
                                                        }>
                                                        <ContentCopyOutlinedIcon fontSize='small' />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4} mt={0.25}>
                                        <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                            <Typography
                                                component='span'
                                                color='text.primary'
                                                fontWeight='bold'
                                                fontSize={14}
                                                mr={0.5}>
                                                Tipo:
                                            </Typography>{" "}
                                            {cooperatedContent?.cliente_tipo || "-"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                            <Typography
                                                component='span'
                                                color='text.primary'
                                                fontWeight='bold'
                                                fontSize={14}
                                                mr={0.5}>
                                                Sexo:
                                            </Typography>{" "}
                                            {cooperatedContent?.cliente_sexo || "-"}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Estado civil:
                                        </Typography>{" "}
                                        {cooperatedContent?.cliente_estadocivl || "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Data nascimento:
                                        </Typography>{" "}
                                        {cooperatedContent?.cliente_nascimento ? (
                                            moment(cooperatedContent.cliente_nascimento).format("DD/MM") ===
                                            moment().format("DD/MM") ? (
                                                <>🎂 {formatDate(cooperatedContent.cliente_nascimento, "DD/MM/YYYY")}</>
                                            ) : (
                                                formatDate(cooperatedContent.cliente_nascimento, "DD/MM/YYYY")
                                            )
                                        ) : (
                                            "-"
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Perfil:
                                        </Typography>{" "}
                                        {cooperatedContent?.cliente_perfil || "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            É rural:
                                        </Typography>{" "}
                                        {cooperatedContent?.e_rural ? "Sim 🌱" : "Não"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            É cooperado:
                                        </Typography>
                                        <StyledBadge
                                            variant='dot'
                                            badgeColor={cooperatedContent?.e_cooperado ? "#44ad07" : "#c90505"}
                                            sx={{ ml: 1.5, mr: 1.5, mb: "3px" }}
                                        />
                                        {cooperatedContent?.e_cooperado ? "Sim" : "Não"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            É funcionário:
                                        </Typography>{" "}
                                        {cooperatedContent?.e_funcionario ? "Não" : "Sim"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Agência:
                                        </Typography>{" "}
                                        {cooperatedContent?.cliente_agencia_nome || "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography
                                        fontWeight='100'
                                        color='text.secondary'
                                        fontSize={14}
                                        title={`Carteira Real: ${cooperatedContent?.carteira_real_nome}` || ""}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Carteira:
                                        </Typography>{" "}
                                        {cooperatedContent?.carteira_nome || "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Data início relacionamento:
                                        </Typography>{" "}
                                        {cooperatedContent?.cliente_relacionamento
                                            ? formatDate(cooperatedContent.cliente_relacionamento, "DD/MM/YYYY")
                                            : "-"}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Grid
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                mt={1}
                                mb={-0.5}
                                container
                                justifyContent='space-between'>
                                <Typography component={"span"} justifyContent='start'>
                                    <Typography component={"span"} fontSize={12}>
                                        Em processo de migração de carteira?{" "}
                                        {cooperatedContent?.is_in_portfolio_migration ? "🔄 Sim" : "❎ Não"}
                                    </Typography>
                                </Typography>

                                <Typography component={"span"} justifyContent='end'>
                                    <Box display='flex' alignItems='center' gap={0.5}>
                                        <Typography component={"span"} fontSize={12}>
                                            Situação Conta Corrente:
                                        </Typography>
                                        <Typography component={"span"} fontSize={12}>
                                            {mapValueCurrentAccount(cooperatedContent?.cc_sitconta)}
                                        </Typography>
                                    </Box>
                                </Typography>
                            </Grid>
                        </Box>

                        <Box
                            margin={2}
                            padding={2}
                            mt={0}
                            sx={{
                                border: `1px solid ${colorBorderSystem}`,
                                borderRadius: 4,
                                backgroundColor: isThemeLight ? "#ffffff61" : "#00161bd5",
                                backdropFilter: "blur(50px)",
                            }}>
                            <Grid container spacing={0}>
                                <Grid item xs={12} sm={12} md={12} mb={0.5} container justifyContent='space-between'>
                                    <Typography fontWeight={"900"} justifyContent='start'>
                                        📞 Contatos:
                                    </Typography>
                                    <Typography fontWeight={"100"} fontSize={10} justifyContent='end'>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={10}>
                                            Data Atualização:{" "}
                                        </Typography>
                                        {cooperatedContent?.cc_data_movimento
                                            ? formatDate(cooperatedContent.cc_data_movimento, "DD/MM/YYYY")
                                            : "-"}
                                    </Typography>
                                </Grid>

                                <Divider sx={{ width: "100%", borderStyle: "dashed", mb: 1 }} />

                                <Grid item xs={12} sm={12} md={4} mb={-1}>
                                    <Box display='flex' alignItems='center' gap={0.5}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={cooperatedContent?.melhor_contato ? 0 : 0.5}>
                                            Melhor contato:
                                        </Typography>
                                        {cooperatedContent?.melhor_contato ? (
                                            <Box display='flex' alignItems='center' gap={0.5}>
                                                <WhatsAppButton
                                                    phoneNumber={cooperatedContent.melhor_contato}
                                                    message='Olá, estamos entrando em contato para compartilhar novidades!'
                                                    colorText='text.secondary'
                                                />
                                                {window.isSecureContext && navigator.clipboard && (
                                                    <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                                                        <IconButton
                                                            size='small'
                                                            color='warning'
                                                            onClick={() =>
                                                                copyToClipboard(cooperatedContent.melhor_contato || "")
                                                            }>
                                                            <ContentCopyOutlinedIcon fontSize='small' />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        ) : (
                                            "-"
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4} mb={-1}>
                                    <Box display='flex' alignItems='center' gap={0.5}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={cooperatedContent?.comercial ? 0 : 0.5}>
                                            Comercial:
                                        </Typography>
                                        {cooperatedContent?.comercial ? (
                                            <Box display='flex' alignItems='center' gap={0.5}>
                                                <WhatsAppButton
                                                    phoneNumber={cooperatedContent.comercial}
                                                    message='Olá, estamos entrando em contato para compartilhar novidades!'
                                                    colorText='text.secondary'
                                                />
                                                {window.isSecureContext && navigator.clipboard && (
                                                    <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                                                        <IconButton
                                                            size='small'
                                                            color='warning'
                                                            onClick={() =>
                                                                copyToClipboard(cooperatedContent.comercial || "")
                                                            }>
                                                            <ContentCopyOutlinedIcon fontSize='small' />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        ) : (
                                            "-"
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4} mb={-1}>
                                    <Box display='flex' alignItems='center' gap={0.5}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={cooperatedContent?.celular ? 0 : 0.5}>
                                            Celular:
                                        </Typography>
                                        {cooperatedContent?.celular ? (
                                            <Box display='flex' alignItems='center' gap={0.5}>
                                                <WhatsAppButton
                                                    phoneNumber={cooperatedContent.celular}
                                                    message='Olá, estamos entrando em contato para compartilhar novidades!'
                                                    colorText='text.secondary'
                                                />
                                                {window.isSecureContext && navigator.clipboard && (
                                                    <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                                                        <IconButton
                                                            size='small'
                                                            color='warning'
                                                            onClick={() =>
                                                                copyToClipboard(cooperatedContent.celular || "")
                                                            }>
                                                            <ContentCopyOutlinedIcon fontSize='small' />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        ) : (
                                            "-"
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4} mb={-0.75}>
                                    <Box display='flex' alignItems='center' gap={0.5}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={cooperatedContent?.residencial ? 0 : 0.5}>
                                            Residencial:
                                        </Typography>
                                        {cooperatedContent?.residencial ? (
                                            <Box display='flex' alignItems='center' gap={0.5}>
                                                <WhatsAppButton
                                                    phoneNumber={cooperatedContent.residencial}
                                                    message='Olá, estamos entrando em contato para compartilhar novidades!'
                                                    colorText='text.secondary'
                                                />
                                                {window.isSecureContext && navigator.clipboard && (
                                                    <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                                                        <IconButton
                                                            size='small'
                                                            color='warning'
                                                            onClick={() =>
                                                                copyToClipboard(cooperatedContent.residencial || "")
                                                            }>
                                                            <ContentCopyOutlinedIcon fontSize='small' />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        ) : (
                                            "-"
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Fax:
                                        </Typography>{" "}
                                        {cooperatedContent?.fax || "-"}
                                        {cooperatedContent?.fax && window.isSecureContext && navigator.clipboard && (
                                            <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                                                <IconButton
                                                    size='small'
                                                    color='warning'
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            cooperatedContent?.fax ? cooperatedContent.fax : "",
                                                        )
                                                    }>
                                                    <ContentCopyOutlinedIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            E-mail:
                                        </Typography>{" "}
                                        {cooperatedContent?.email?.toLocaleLowerCase() || "-"}
                                        {cooperatedContent?.email && window.isSecureContext && navigator.clipboard && (
                                            <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                                                <IconButton
                                                    size='small'
                                                    color='warning'
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            cooperatedContent?.email
                                                                ? cooperatedContent.email.toLocaleLowerCase()
                                                                : "",
                                                        )
                                                    }>
                                                    <ContentCopyOutlinedIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box
                            margin={2}
                            padding={2}
                            mt={0}
                            sx={{
                                border: `1px solid ${colorBorderSystem}`,
                                borderRadius: 4,
                                backgroundColor: isThemeLight ? "#ffffff61" : "#00161bd5",
                                backdropFilter: "blur(50px)",
                            }}>
                            <Grid container spacing={0}>
                                <Grid item xs={12} sm={12} md={12} mb={0.5} container justifyContent='space-between'>
                                    <Typography fontWeight={"900"} justifyContent='start'>
                                        📍 Endereços:
                                    </Typography>
                                    <Typography fontWeight={"100"} fontSize={10} justifyContent='end'>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={10}>
                                            Data Atualização:{" "}
                                        </Typography>
                                        {cooperatedContent?.ce_data_movimento
                                            ? formatDate(cooperatedContent.ce_data_movimento, "DD/MM/YYYY")
                                            : "-"}
                                    </Typography>
                                </Grid>

                                <Divider sx={{ width: "100%", borderStyle: "dashed", mb: 1 }} />

                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Logradouro:
                                        </Typography>{" "}
                                        {cooperatedContent?.logradouro_tipo
                                            ? cooperatedContent?.logradouro_tipo + " " + cooperatedContent?.logradouro
                                            : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Número:
                                        </Typography>{" "}
                                        {cooperatedContent?.logradouro_numero || "S/N"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Bairro:
                                        </Typography>{" "}
                                        {cooperatedContent?.bairro ? cooperatedContent?.bairro : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Município:
                                        </Typography>{" "}
                                        {cooperatedContent?.municipio ? cooperatedContent?.municipio : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            UF:
                                        </Typography>{" "}
                                        {cooperatedContent?.uf ? cooperatedContent?.uf : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            CEP:
                                        </Typography>{" "}
                                        {cooperatedContent?.cep ? cooperatedContent?.cep : "-"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box
                            margin={2}
                            padding={2}
                            mt={0}
                            sx={{
                                border: `1px solid ${colorBorderSystem}`,
                                borderRadius: 4,
                                backgroundColor: isThemeLight ? "#ffffff61" : "#00161bd5",
                                backdropFilter: "blur(50px)",
                            }}>
                            <Grid container spacing={0}>
                                <Grid item xs={12} sm={12} md={12} mb={0.5} container justifyContent='space-between'>
                                    <Typography fontWeight={"900"} justifyContent='start'>
                                        💰 Financeiro:
                                    </Typography>
                                    <Typography fontWeight={"100"} fontSize={10} justifyContent='end'>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={10}>
                                            Data Atualização:{" "}
                                        </Typography>
                                        {cooperatedContent?.cf_data_movimento
                                            ? formatDate(cooperatedContent.cf_data_movimento, "DD/MM/YYYY")
                                            : "-"}
                                    </Typography>
                                </Grid>

                                <Divider sx={{ width: "100%", borderStyle: "dashed", mb: 1 }} />

                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Renda bruta:
                                        </Typography>{" "}
                                        {cooperatedContent?.renda_bruta
                                            ? formatToBRLCurrency(cooperatedContent.renda_bruta)
                                            : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Conta ativa:
                                        </Typography>{" "}
                                        {cooperatedContent?.cliente_conta_ativa
                                            ? cooperatedContent?.cliente_conta_ativa
                                                ? "Sim"
                                                : "Não"
                                            : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            IAP:
                                        </Typography>{" "}
                                        {cooperatedContent?.iap || "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Margem contribuição:
                                        </Typography>{" "}
                                        {cooperatedContent?.margem_contribuicao
                                            ? formatToBRLCurrency(cooperatedContent.margem_contribuicao)
                                            : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Depósito a vista:
                                        </Typography>{" "}
                                        {cooperatedContent?.deposito_avista
                                            ? formatToBRLCurrency(cooperatedContent.deposito_avista)
                                            : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Depósito a prazo:
                                        </Typography>{" "}
                                        {cooperatedContent?.deposito_aprazo
                                            ? formatToBRLCurrency(cooperatedContent.deposito_aprazo)
                                            : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Risco CRL:
                                        </Typography>{" "}
                                        {cooperatedContent?.risco_crl || "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Crédito saldo:
                                        </Typography>{" "}
                                        {cooperatedContent?.credito_saldo
                                            ? formatToBRLCurrency(cooperatedContent.credito_saldo)
                                            : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Maior atraso crédito:
                                        </Typography>{" "}
                                        {cooperatedContent?.credito_maxdiasatraso
                                            ? cooperatedContent.credito_maxdiasatraso + " Dias"
                                            : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Saldo devedor SFN:
                                        </Typography>{" "}
                                        {cooperatedContent?.saldo_devedor_sfn
                                            ? formatToBRLCurrency(cooperatedContent.saldo_devedor_sfn)
                                            : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <Typography fontWeight='100' color='text.secondary' fontSize={14}>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={14}
                                            mr={0.5}>
                                            Valor vencido SFN:
                                        </Typography>{" "}
                                        {cooperatedContent?.valor_vencido_sfn
                                            ? formatToBRLCurrency(cooperatedContent.valor_vencido_sfn)
                                            : "-"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box
                            margin={2}
                            padding={2}
                            mt={0}
                            sx={{
                                border: `1px solid ${colorBorderSystem}`,
                                borderRadius: 4,
                                backgroundColor: isThemeLight ? "#ffffff61" : "#00161bd5",
                                backdropFilter: "blur(50px)",
                            }}>
                            <Grid container spacing={0}>
                                <Grid item xs={12} sm={12} md={12} mb={1} container justifyContent='space-between'>
                                    <Typography fontWeight={"900"} justifyContent='start'>
                                        📦 Posse de Produtos: ({cooperatedContent?.posse || 0})
                                    </Typography>

                                    <Typography fontWeight={"100"} fontSize={10} justifyContent='end'>
                                        <Typography
                                            component='span'
                                            color='text.primary'
                                            fontWeight='bold'
                                            fontSize={10}>
                                            Data Atualização:{" "}
                                        </Typography>
                                        {cooperatedContent?.refmes
                                            ? moment(cooperatedContent?.refmes, "YYYY-MM").format("MM/YYYY")
                                            : "-"}
                                    </Typography>
                                </Grid>

                                <Divider sx={{ width: "100%", borderStyle: "dashed", mb: 1 }} />

                                {productsIAP.map(({ key, label }) => (
                                    <Grid item xs={12} sm={12} md={3} key={key}>
                                        <Typography fontWeight={"100"} fontSize={14}>
                                            {mapValueToEmoji(Number(cooperatedContent?.[key]))}{" "}
                                            <Typography component={"span"} fontSize={14}>
                                                {label}
                                            </Typography>
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>

                            <Grid item xs={12} sm={12} md={12} mt={1.5} mb={-0.5} container justifyContent='end'>
                                <Typography component={"span"} justifyContent='end'>
                                    <Typography component={"span"} fontSize={12}>
                                        ❌ Não Possui
                                    </Typography>
                                    <Typography component={"span"} fontSize={12} ml={1}>
                                        ✅ Possui
                                    </Typography>
                                    <Typography component={"span"} fontSize={12} ml={1}>
                                        🅿️ Propenso
                                    </Typography>
                                </Typography>
                            </Grid>
                        </Box>

                        <Box
                            margin={2}
                            padding={2}
                            mt={0}
                            sx={{
                                border: `1px solid ${colorBorderSystem}`,
                                borderRadius: 4,
                                backgroundColor: isThemeLight ? "#ffffff61" : "#00161bd5",
                                backdropFilter: "blur(50px)",
                            }}>
                            <Grid item xs={12} sm={12} md={12} mb={1} container justifyContent='space-between'>
                                <Typography fontWeight={"900"} justifyContent='start'>
                                    🧾 Contas:
                                </Typography>
                                <Typography fontWeight={"100"} fontSize={10} justifyContent='end'>
                                    <Typography component='span' color='text.primary' fontWeight='bold' fontSize={10}>
                                        Data Atualização:{" "}
                                    </Typography>
                                    {infoDataAccountClient?.[0]?.data_movimento
                                        ? formatDate(infoDataAccountClient[0].data_movimento, "DD/MM/YYYY")
                                        : "-"}
                                </Typography>
                            </Grid>
                            <DataGrid
                                autoHeight
                                columns={columnsAccount}
                                rows={infoDataAccountClient || []}
                                density='compact'
                                localeText={dataGridLocaleTextTranslateFull}
                                disableColumnMenu
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 10,
                                        },
                                    },
                                }}
                                slots={{
                                    toolbar: CustomToolbar,
                                }}
                                slotProps={{
                                    toolbar: {
                                        quickFilterProps: { debounceMs: 300 },
                                    },
                                }}
                                pageSizeOptions={[10, 20]}
                                sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
                            />
                        </Box>

                        <Box
                            margin={2}
                            padding={2}
                            mt={0}
                            sx={{
                                border: `1px solid ${colorBorderSystem}`,
                                borderRadius: 4,
                                backgroundColor: isThemeLight ? "#ffffff61" : "#00161bd5",
                                backdropFilter: "blur(50px)",
                            }}>
                            <Grid item xs={12} sm={12} md={12} mb={1} container justifyContent='space-between'>
                                <Typography fontWeight={"900"} justifyContent='start'>
                                    💳 Cartões:
                                </Typography>
                                <Typography fontWeight={"100"} fontSize={10} justifyContent='end'>
                                    <Typography component='span' color='text.primary' fontWeight='bold' fontSize={10}>
                                        Data Atualização:{" "}
                                    </Typography>
                                    {infoDataCardsClient?.[0]?.data_movimento
                                        ? formatDate(infoDataCardsClient[0].data_movimento, "DD/MM/YYYY")
                                        : "-"}
                                </Typography>
                            </Grid>
                            <DataGrid
                                autoHeight
                                columns={columnsCards}
                                rows={infoDataCardsClient || []}
                                density='compact'
                                localeText={dataGridLocaleTextTranslateFull}
                                disableColumnMenu
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 10,
                                        },
                                    },
                                }}
                                slots={{
                                    toolbar: CustomToolbar,
                                }}
                                slotProps={{
                                    toolbar: {
                                        quickFilterProps: { debounceMs: 300 },
                                    },
                                }}
                                pageSizeOptions={[10, 20]}
                                sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
                            />
                        </Box>

                        <Box
                            margin={2}
                            padding={2}
                            mt={0}
                            sx={{
                                border: `1px solid ${colorBorderSystem}`,
                                borderRadius: 4,
                                backgroundColor: isThemeLight ? "#ffffff61" : "#00161bd5",
                                backdropFilter: "blur(50px)",
                            }}>
                            <Grid item xs={12} sm={12} md={12} mb={1} container justifyContent='space-between'>
                                <Typography fontWeight={"900"} justifyContent='start'>
                                    💸 Desembolso:
                                </Typography>
                                <Typography fontWeight={"100"} fontSize={10} justifyContent='end'>
                                    <Typography component='span' color='text.primary' fontWeight='bold' fontSize={10}>
                                        Data Atualização:{" "}
                                    </Typography>
                                    {infoDataDisbursementClient && infoDataDisbursementClient[0]?.refmes
                                        ? moment(infoDataDisbursementClient[0]?.refmes, "YYYY-MM").format("MM/YYYY")
                                        : "-"}
                                </Typography>
                            </Grid>
                            <DataGrid
                                autoHeight
                                columns={columnsDisbursement}
                                rows={infoDataDisbursementClient || []}
                                density='compact'
                                localeText={dataGridLocaleTextTranslateFull}
                                disableColumnMenu
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 10,
                                        },
                                    },
                                }}
                                slots={{
                                    toolbar: CustomToolbar,
                                }}
                                slotProps={{
                                    toolbar: {
                                        quickFilterProps: { debounceMs: 300 },
                                    },
                                }}
                                pageSizeOptions={[10, 20]}
                                sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
                            />
                            <Grid item xs={12} sm={12} md={12} mt={1} container justifyContent='flex-start'>
                                <Typography fontWeight='100' fontSize={14}>
                                    <Typography
                                        component={"span"}
                                        color={"text.primary"}
                                        fontWeight='bold'
                                        fontSize={14}>
                                        Total de Desembolso:{" "}
                                    </Typography>
                                    {infoDataDisbursementClient &&
                                        formatToBRLCurrency(
                                            infoDataDisbursementClient.reduce(
                                                (total, item) => total + (item.valor || 0),
                                                0,
                                            ),
                                        )}
                                </Typography>
                            </Grid>
                        </Box>
                    </Grid>
                </>
            ) : (
                <Box margin={2.25} mt={0}>
                    <Skeleton variant='rounded' height={214} sx={{ borderRadius: 4 }} />
                    <Skeleton variant='rounded' height={118} sx={{ mt: 2, borderRadius: 4 }} />
                    <Skeleton variant='rounded' height={110} sx={{ mt: 2, borderRadius: 4 }} />
                    <Skeleton variant='rounded' height={158} sx={{ mt: 2, borderRadius: 4 }} />
                    <Skeleton variant='rounded' height={314} sx={{ mt: 2, borderRadius: 4 }} />
                    <Skeleton variant='rounded' height={258} sx={{ mt: 2, borderRadius: 4 }} />
                    <Skeleton variant='rounded' height={258} sx={{ mt: 2, borderRadius: 4 }} />
                    <Skeleton variant='rounded' height={258} sx={{ mt: 2, borderRadius: 4 }} />
                </Box>
            )}
        </>
    );
}
