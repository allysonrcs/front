import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    BoxProps,
    Button,
    Collapse,
    Grid,
    Icon,
    IconButton,
    Modal,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import { useGlobal } from "@/contexts/GlobalContext";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { useConfirm } from "material-ui-confirm";
import {
    changeStatusProductivityDaily,
    changeStatusProductivityDailyProps,
    searchProductivityDailyByID,
} from "@/services/productivities-control";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { formatCnpjCpf, formatToBRLCurrency } from "@/functions/number";
import { formatDate } from "@/functions/date";
import FormInput from "@/components/FormComponents/FormInput";
import { useAuth } from "@/contexts/AuthContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { copyText } from "@/functions/text";
import { productMap, statusProductivityDailyMap, statusWithoutLabelMap } from "../ListRecordsProductivityDaily";
import { InteractionsProductivityDaily } from "./InteractionsProductivityDaily";
import { ExtClientInfo } from "@/components/ExtClientInfo/ExtClientInfo";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { searchAutoCompletePortfolios } from "@/services/portfolios";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormDatePicker from "@/components/FormComponents/FormDatePicker";
import FormSwitchGroup from "@/components/FormComponents/FormSwitchGroup";
import moment from "moment";

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type ListAgencies = {
    id: number;
    label: string;
    agency_sisbr_id: number;
};

type ListPortfolios = {
    id: number;
    label: string;
    id_ref?: number | null;
    id_agency?: number | null;
};

export type EditAuditProductivityProps = {
    id?: number;
    status?: string;
    audited_by_name?: string;
    date_audit?: string;
    updated_at?: string;
    mob_validation_is_counted?: boolean;
};

export interface IInfoProductivityDaily {
    id: number;
    status: string;
    is_client: boolean;
    client_sisbr_id: number;
    client_name: string;
    client_document: string;
    client_agency_name: string;
    client_id_portfolio: number;
    client_portfolio_name: string;
    is_client_rural: boolean;
    id_product: number;
    product_name: string;
    id_modality: number;
    modality_name: string;
    price: number;
    amount: number;
    detail: string;
    observation: string;
    created_by_name: string;
    creator_agency_name: string;
    created_portfolio_name: string;
    audited_by_name: string;
    date_audit: string;
    mob_validation_agency_name: string;
    mob_validation_portfolio_name: string;
    mob_validation_date: Date | null;
    mob_validation_is_counted: boolean;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

type AuditProps = {
    observation?: string | null;
    content_manual?: string | null;
    mob_validation_agency?: AutoCompleteNumber | null;
    mob_validation_portfolio?: AutoCompleteNumber | null;
    mob_validation_date?: Date | null;
    mob_validation_is_counted?: boolean | null;
};

export type ModalAuditProductivityDailyProps = {
    idProductivityDaily?: number;
    permissionProductivityDaily?: boolean;
    handleClose?: () => void;
    updateColumn?: (params: EditAuditProductivityProps) => void;
} & BoxProps;

const validationSchemaAuditProductivity = Yup.object().shape({
    observation: Yup.string().nullable().optional(),
    content_manual: Yup.string().nullable().optional(),
    mob_validation_agency: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .nullable()
        .notRequired(),
    mob_validation_portfolio: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .nullable()
        .notRequired(),
    mob_validation_date: Yup.date().typeError("Digite uma data válida").nullable().optional(),
    mob_validation_is_counted: Yup.boolean().nullable().optional(),
});

export function AuditProductivityDaily({
    idProductivityDaily,
    permissionProductivityDaily,
    handleClose,
    updateColumn,
    ...props
}: ModalAuditProductivityDailyProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [infoProductivityDaily, setInfoProductivityDaily] = useState<IInfoProductivityDaily>();
    const [listMobValidationAgencies, setListMobValidationAgencies] = useState<ListAgencies[]>([]);
    const [listMobValidationPortfolios, setListMobValidationPortfolios] = useState<ListPortfolios[]>([]);
    const [openModalInteraction, setOpenModalInteraction] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [openModalClient, setOpenModalClient] = useState(false);
    const [copied, setCopied] = useState(false);
    const [idExtClient, setIdExtClient] = useState<number>();

    const { user } = useAuth();
    const { getInfoError, colorBorderSystem, redBlur, cyanBlur, theme: themeContext } = useGlobal();
    const { device } = useMediaQuery();
    const theme = useTheme();
    const confirm = useConfirm();

    const {
        handleSubmit,
        setValue,
        resetField,
        setError,
        watch,
        control,
        formState: { errors },
    } = useForm<AuditProps>({
        resolver: yupResolver(validationSchemaAuditProductivity),
    });

    const mobValidationAgencyWatch = watch("mob_validation_agency");
    const mobValidationPortfolioWatch = watch("mob_validation_portfolio");
    const mobValidationIsCountedPublicWatch = watch("mob_validation_is_counted");
    const mobValidationDateWatch = watch("mob_validation_date");

    const handleModalInteractionProductivityDaily = () => {
        setOpenModalInteraction((oldValue) => !oldValue);
    };

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    function handleOpenApprovalModal() {
        setOpenApprovalModal((oldValue) => !oldValue);
    }

    const copyToClipboard = async (text: string) => {
        const message = await copyText(text);
        toast.info(message);
    };

    const onSubmitAuditProductivityDaily = async (params: AuditProps, status: string) => {
        try {
            setLoading(true);

            if (idProductivityDaily) {
                const mobValidationData: changeStatusProductivityDailyProps = {
                    status,
                    content_manual: status === "REPROVADO" || status === "CORREÇÃO" ? params.content_manual : null,
                    mob_validation_agency_id: status === "APROVADO" ? (params.mob_validation_agency?.id ?? null) : null,
                    mob_validation_portfolio_id:
                        status === "APROVADO" ? (params.mob_validation_portfolio?.id ?? null) : null,
                    mob_validation_date: status === "APROVADO" ? (params.mob_validation_date ?? null) : null,
                    mob_validation_is_counted:
                        status === "APROVADO" ? (params.mob_validation_is_counted ?? false) : false,
                };

                if (status === "APROVADO") {
                    if (!mobValidationPortfolioWatch?.id || mobValidationPortfolioWatch?.label.length === 0) {
                        setError("mob_validation_portfolio", { message: "Obrigatório", type: "required" });

                        toast.error("Carteira de validação é obrigatória!");

                        return;
                    }

                    if (!mobValidationDateWatch) {
                        setError("mob_validation_date", { message: "Obrigatório", type: "required" });

                        toast.error("Data de validação é obrigatória!");

                        return;
                    }
                }

                const dateNow: string = moment().format("YYYY-MM-DD HH:mm:ss");

                await changeStatusProductivityDaily(idProductivityDaily, mobValidationData);

                updateColumn?.({
                    status,
                    audited_by_name: status !== "CORREÇÃO" ? user?.name : "",
                    date_audit: status !== "CORREÇÃO" ? dateNow : "",
                    updated_at: status !== "CORREÇÃO" ? dateNow : "",
                    mob_validation_is_counted: status === "APROVADO" && params.mob_validation_is_counted ? true : false,
                });

                let message = "";

                switch (status) {
                    case "APROVADO":
                        message = "👍 Aprovado";
                        break;
                    case "REPROVADO":
                        message = "👎 Reprovado";
                        break;
                    case "CORREÇÃO":
                        message = "alterado para: ✏️ Correção";
                        break;
                    default:
                        message = "Atualizado";
                }

                toast.success(`Registro de Produtividade Diária ${message} com sucesso!`);
                handleClose?.();
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setValuesProductivityDailyByID = async (id_productivity_daily: number) => {
        try {
            setLoading(true);

            if (id_productivity_daily) {
                const dataProductivityDaily = await searchProductivityDailyByID(id_productivity_daily);

                setInfoProductivityDaily(dataProductivityDaily);
                setValue("observation", dataProductivityDaily.observation);

                permissionProductivityDaily &&
                    setProductivityDailyOptions(
                        dataProductivityDaily.mob_validation_agency_ref_id,
                        dataProductivityDaily.mob_validation_portfolio_ref_id,
                        dataProductivityDaily.mob_validation_date,
                    );
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setProductivityDailyOptions = async (
        mob_validation_agency_ref_id: number,
        mob_validation_portfolio_ref_id: number,
        mob_validation_date: Date | null,
    ) => {
        try {
            const [dataMobValidationAgencies, dataMobValidationPortfolios] = await Promise.all([
                searchAutocompleteAgencies({
                    with_agency_sisbr_id: true,
                    is_active: true,
                    with_restrict_agency: false,
                }),
                searchAutoCompletePortfolios({
                    agency_sisbr_id: mob_validation_agency_ref_id,
                    is_active: true,
                    with_restrict_agency: false,
                    has_id_ref: true,
                    has_id_agency: true,
                }),
            ]);

            const autoCompleteMobValidationAgencies = dataMobValidationAgencies
                .map(({ id, abbreviation, agency_sisbr_id }) => ({
                    id,
                    label: abbreviation,
                    agency_sisbr_id,
                }))
                .filter((value) => value.agency_sisbr_id !== 9999);

            setListMobValidationAgencies(autoCompleteMobValidationAgencies);

            const searchAutoCompleteMobValidationAgencies = dataMobValidationAgencies
                .map(({ id, abbreviation, agency_sisbr_id }) => ({
                    id,
                    label: abbreviation,
                    agency_sisbr_id,
                }))
                .filter((value) => value.agency_sisbr_id === mob_validation_agency_ref_id);

            if (searchAutoCompleteMobValidationAgencies) {
                setValue("mob_validation_agency", {
                    id: searchAutoCompleteMobValidationAgencies[0].id,
                    label: searchAutoCompleteMobValidationAgencies[0].label,
                });
            }

            const selectedMobValidationPortfolio = dataMobValidationPortfolios.find(
                (value) => value.ref_id === mob_validation_portfolio_ref_id,
            );

            if (selectedMobValidationPortfolio) {
                setValue("mob_validation_portfolio", {
                    id: selectedMobValidationPortfolio.id,
                    label: selectedMobValidationPortfolio.name + " - " + selectedMobValidationPortfolio.ref_id,
                });
            }

            mob_validation_date && setValue("mob_validation_date", mob_validation_date);
            setValue("mob_validation_is_counted", true);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        async function execute() {
            setLoading(true);

            if (idProductivityDaily) {
                await setValuesProductivityDailyByID(idProductivityDaily);
            }

            setLoading(false);
        }

        execute();
    }, [idProductivityDaily]);

    const searchPortfoliosOfTheAgency = async (id_agency: number) => {
        try {
            const dataPortfolios = await searchAutoCompletePortfolios({
                id_agency,
                is_active: true,
                with_restrict_agency: false,
                has_id_ref: true,
                has_id_agency: true,
            });

            const autoCompleteMobValidationPortfolios = dataPortfolios.map(({ id, name, ref_id }) => {
                return {
                    id,
                    label: name + " - " + ref_id,
                    id_ref: ref_id,
                };
            });

            setListMobValidationPortfolios(autoCompleteMobValidationPortfolios);

            if (autoCompleteMobValidationPortfolios.length === 1) {
                setValue("mob_validation_portfolio", {
                    id: autoCompleteMobValidationPortfolios[0].id,
                    label: autoCompleteMobValidationPortfolios[0].label,
                });
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        async function execute() {
            if (!Object.keys(listMobValidationAgencies).length || Object.keys(listMobValidationPortfolios).length) {
                setValue("mob_validation_portfolio", null);
                setListMobValidationPortfolios([]);
            }

            if (mobValidationAgencyWatch) {
                await searchPortfoliosOfTheAgency(mobValidationAgencyWatch.id);
            }
        }

        permissionProductivityDaily && execute();
    }, [mobValidationAgencyWatch]);

    const RegisterProductivity = (props: IInfoProductivityDaily) => {
        return (
            <>
                <Typography fontWeight={"900"} color={"text.primary"}>
                    Informações do Cooperado:
                </Typography>
                <Typography fontWeight={"100"} mt={1}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Status:
                    </Typography>{" "}
                    {statusProductivityDailyMap[props.status] || props.status}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Pré Cadastro:
                    </Typography>{" "}
                    {props.is_client ? "Não 💚" : "Sim 🚩"}
                </Typography>

                {props.is_client && (
                    <Typography fontWeight={"100"} mb={-1} mt={-1}>
                        <Typography component={"span"} color='primary' fontWeight={"900"}>
                            ID Cooperado:
                        </Typography>{" "}
                        {props.client_sisbr_id}
                        <Tooltip title='Visualizar Dados do Cooperado'>
                            <IconButton
                                onClick={() => {
                                    handleOpenModalClient();
                                    setIdExtClient(props.client_sisbr_id);
                                }}
                                color='success'
                                aria-label='Visualizar Cooperado'>
                                <AccountCircleOutlinedIcon />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                )}

                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Nome:
                    </Typography>{" "}
                    {props.client_name}
                    {window.isSecureContext && navigator.clipboard && (
                        <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                            <IconButton size='small' color='warning' onClick={() => copyToClipboard(props.client_name)}>
                                <ContentCopyOutlinedIcon fontSize='small' />
                            </IconButton>
                        </Tooltip>
                    )}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Documento:
                    </Typography>{" "}
                    {`${formatCnpjCpf(props.client_document)} | ${props.client_document.length > 11 ? "CNPJ" : "CPF"}`}
                    {window.isSecureContext && navigator.clipboard && (
                        <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                            <IconButton
                                size='small'
                                color='warning'
                                onClick={() => copyToClipboard(props.client_document)}>
                                <ContentCopyOutlinedIcon fontSize='small' />
                            </IconButton>
                        </Tooltip>
                    )}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        É Rural:
                    </Typography>{" "}
                    {props.is_client_rural ? "Sim 🌱" : "Não"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        PA:
                    </Typography>{" "}
                    {props.client_agency_name}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Carteira:
                    </Typography>{" "}
                    {props.client_portfolio_name}
                </Typography>
                <Typography fontWeight={"900"} color='text.primary' mt={1} mb={1}>
                    Informações do Produto:
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Produto:
                    </Typography>{" "}
                    {productMap[props.product_name] || props.product_name}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Modalidade:
                    </Typography>{" "}
                    {props.modality_name}
                </Typography>

                {typeof props.detail === "string" &&
                    (() => {
                        try {
                            const detailObject = JSON.parse(props.detail);
                            return Object.entries(detailObject).map(([key, value]: any) => (
                                <Typography key={key} fontWeight={"100"}>
                                    <Typography component={"span"} color={"success.dark"}>
                                        {"- " + key.replace(/_/g, " ").split(" ").slice(1).join(" ")}:
                                    </Typography>{" "}
                                    {value}
                                </Typography>
                            ));
                        } catch (e) {
                            return <Typography color='error'>- Erro ao analisar detalhes</Typography>;
                        }
                    })()}

                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Valor:
                    </Typography>{" "}
                    {props.price !== null ? formatToBRLCurrency(props.price) : "R$ 0,00"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Quantidade:
                    </Typography>{" "}
                    {props.amount !== null ? props.amount : 0}
                </Typography>
            </>
        );
    };

    const ResponsibleProductivity = (props: IInfoProductivityDaily) => {
        return (
            <>
                <Typography fontWeight={"900"} color={"text.primary"}>
                    Informações Adicionais:
                </Typography>
                <Typography fontWeight={"100"} mt={1}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Criado por:
                    </Typography>{" "}
                    {props.created_by_name}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        PA do criador:
                    </Typography>{" "}
                    {props.creator_agency_name}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Carteira do criador:
                    </Typography>{" "}
                    {props.created_portfolio_name || "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Auditado por:
                    </Typography>{" "}
                    {props.audited_by_name ? props.audited_by_name : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Data Auditoria:
                    </Typography>{" "}
                    {props.date_audit ? formatDate(props.date_audit, "DD/MM/YYYY HH:mm:ss") : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Inserido em:
                    </Typography>{" "}
                    {props.created_at ? formatDate(props.created_at, "DD/MM/YYYY HH:mm:ss") : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Atualizado em:
                    </Typography>{" "}
                    {props.updated_at ? formatDate(props.updated_at, "DD/MM/YYYY HH:mm:ss") : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        Situação:
                    </Typography>{" "}
                    {props.is_active ? "🟢 Ativo" : "🔴 Inativo"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        ✔️ PA de Validação:
                    </Typography>{" "}
                    {props.mob_validation_agency_name ? props.mob_validation_agency_name : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        ✔️ Carteira de Validação:
                    </Typography>{" "}
                    {props.mob_validation_portfolio_name ? props.mob_validation_portfolio_name : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        ✔️ Data Validação:
                    </Typography>{" "}
                    {props.mob_validation_date ? formatDate(props.mob_validation_date, "DD/MM/YYYY") : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color='primary' fontWeight={"900"}>
                        ✔️ Situação Validação:
                    </Typography>{" "}
                    {props.mob_validation_is_counted ? "✅ Ativo" : "⛔ Inativo"}
                </Typography>
                <Typography fontWeight={"900"} color='text.primary' mt={1} mb={1}>
                    Observação:
                </Typography>
                <Grid item xs={12} md={12} mt={1}>
                    <FormInput
                        fullWidth
                        multiline
                        rows={5}
                        name='observation'
                        type='text'
                        variant='standard'
                        disabled={true}
                        control={control}
                        errors={errors}
                    />
                </Grid>
            </>
        );
    };

    return (
        <BoxModal
            title={`${infoProductivityDaily?.status && statusProductivityDailyMap[infoProductivityDaily?.status]} | ${infoProductivityDaily?.client_name}`}
            handleClose={handleClose}
            width='70%'
            maxHeight='95%'
            overflow={"auto"}
            {...props}>
            <Box component={"form"} mt={-1}>
                <Grid container gap={2}>
                    <Grid
                        container
                        sx={{
                            border: `1px dashed ${theme.palette.divider}`,
                            borderRadius: 4,
                            boxShadow: "0px 0px 2px 0px rgba(145, 158, 171, 0.16) ",
                        }}>
                        <Grid item xs={12} md={6} padding={3}>
                            {infoProductivityDaily && <RegisterProductivity {...infoProductivityDaily} />}
                        </Grid>

                        <Grid item xs={12} md padding={3}>
                            {infoProductivityDaily && <ResponsibleProductivity {...infoProductivityDaily} />}
                        </Grid>
                    </Grid>
                    {permissionProductivityDaily && permissionProductivityDaily === true && (
                        <>
                            <Grid container justifyContent='center' gap={1} mt={1}>
                                <>
                                    {infoProductivityDaily?.status &&
                                        ["RASCUNHO", "CORREÇÃO", "CANCELADO"].includes(
                                            infoProductivityDaily?.status,
                                        ) && (
                                            <Grid container justifyContent='center'>
                                                <Typography fontSize={12} fontWeight={"400"}>
                                                    Não é permitido aprovar ou reprovar produtividades com os seguintes
                                                    status: 🟣 Rascunho, 🔵 Correção, ⚫ Cancelado.
                                                </Typography>
                                            </Grid>
                                        )}

                                    <Grid>
                                        <LoadingButton
                                            size='large'
                                            color='success'
                                            variant='contained'
                                            title='Aprovar Produtividade'
                                            startIcon={<Icon>thumb_up_outlined_icon</Icon>}
                                            loading={loading}
                                            disabled={
                                                infoProductivityDaily?.status &&
                                                !["RASCUNHO", "CORREÇÃO", "CANCELADO"].includes(
                                                    infoProductivityDaily?.status,
                                                )
                                                    ? false
                                                    : true
                                            }
                                            onClick={() => handleOpenApprovalModal()}>
                                            Aprovar
                                        </LoadingButton>
                                    </Grid>

                                    <Grid>
                                        <LoadingButton
                                            size='large'
                                            color='error'
                                            variant='contained'
                                            title='Reprovar Produtividade'
                                            startIcon={<Icon>thumb_down_outlined_icon</Icon>}
                                            loading={loading}
                                            disabled={
                                                infoProductivityDaily?.status &&
                                                !["RASCUNHO", "CORREÇÃO", "CANCELADO"].includes(
                                                    infoProductivityDaily?.status,
                                                )
                                                    ? false
                                                    : true
                                            }
                                            onClick={async () => {
                                                await confirm({
                                                    title: "Confirmação de Reprovação",
                                                    description: (
                                                        <>
                                                            <Typography>
                                                                Tem certeza de que deseja reprovar esta produtividade?
                                                            </Typography>
                                                            <Box mt={2}>
                                                                <FormInput
                                                                    fullWidth
                                                                    multiline
                                                                    label='Motivo da Reprovação:'
                                                                    name='content_manual'
                                                                    type='text'
                                                                    variant='outlined'
                                                                    rows={3}
                                                                    control={control}
                                                                    errors={errors}
                                                                />
                                                            </Box>
                                                        </>
                                                    ),
                                                    dialogProps: {
                                                        disableEscapeKeyDown: true,
                                                    },
                                                })
                                                    .then(() =>
                                                        handleSubmit((params) =>
                                                            onSubmitAuditProductivityDaily(params, "REPROVADO"),
                                                        )(),
                                                    )
                                                    .catch(() => {
                                                        resetField("content_manual");
                                                    });
                                            }}>
                                            Reprovar
                                        </LoadingButton>
                                    </Grid>

                                    <Grid>
                                        <LoadingButton
                                            size='large'
                                            color='primary'
                                            variant='contained'
                                            title='Solicitar Correção da Produtividade'
                                            startIcon={<Icon>edit_note_outlined_icon</Icon>}
                                            loading={loading}
                                            disabled={
                                                infoProductivityDaily?.status &&
                                                !["RASCUNHO", "CORREÇÃO", "CANCELADO"].includes(
                                                    infoProductivityDaily?.status,
                                                )
                                                    ? false
                                                    : true
                                            }
                                            onClick={async () => {
                                                await confirm({
                                                    title: "Confirmação de Correção",
                                                    description: (
                                                        <>
                                                            <Typography>
                                                                Tem certeza de que deseja alterar o status desta
                                                                produtividade para Correção?
                                                            </Typography>
                                                            <Box mt={2}>
                                                                <FormInput
                                                                    fullWidth
                                                                    multiline
                                                                    label='Motivo da correção:'
                                                                    name='content_manual'
                                                                    type='text'
                                                                    variant='outlined'
                                                                    rows={3}
                                                                    control={control}
                                                                    errors={errors}
                                                                />
                                                            </Box>
                                                        </>
                                                    ),
                                                    dialogProps: {
                                                        disableEscapeKeyDown: true,
                                                    },
                                                })
                                                    .then(() =>
                                                        handleSubmit((params) =>
                                                            onSubmitAuditProductivityDaily(params, "CORREÇÃO"),
                                                        )(),
                                                    )
                                                    .catch(() => {
                                                        resetField("content_manual");
                                                    });
                                            }}>
                                            Correção
                                        </LoadingButton>
                                    </Grid>

                                    {idProductivityDaily && (
                                        <Grid>
                                            <LoadingButton
                                                size='large'
                                                color='info'
                                                variant='contained'
                                                title='Interações da Produitividade'
                                                startIcon={<Icon>chat_outlined_icon</Icon>}
                                                loading={loading}
                                                onClick={handleModalInteractionProductivityDaily}>
                                                Interações
                                            </LoadingButton>
                                        </Grid>
                                    )}
                                </>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Box>
            <Modal open={openModalInteraction}>
                <Box>
                    <InteractionsProductivityDaily
                        idProductivityDaily={idProductivityDaily}
                        handleClose={handleModalInteractionProductivityDaily}
                        updateColumn={updateColumn}
                    />
                </Box>
            </Modal>

            <Modal open={openApprovalModal}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: device === "Mobile" ? "90%" : "50%",
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}>
                    <>
                        {idProductivityDaily && infoProductivityDaily && (
                            <Typography color='text.primary' mb={2}>
                                {`${statusWithoutLabelMap[infoProductivityDaily?.status]} |
                                    ${infoProductivityDaily.client_name}`}
                            </Typography>
                        )}

                        <Typography>Tem certeza de que deseja aprovar esta produtividade?</Typography>
                        <Grid
                            container
                            justifyContent='start'
                            mt={2}
                            spacing={["Tablet", "Mobile"].includes(device) ? 2 : 1}>
                            <Grid item xs={12} sm={12} md={12} mb={1}>
                                <Typography fontWeight={700}>
                                    PA e Carteira que será contabilizado para o mobilizador:
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={4}>
                                <FormAutocomplete
                                    fullWidth
                                    name='mob_validation_agency'
                                    label='PA'
                                    variant='outlined'
                                    size='medium'
                                    disableClearable
                                    disabled={loading}
                                    disabledAutocomplete={loading}
                                    control={control}
                                    errors={errors}
                                    options={listMobValidationAgencies}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={4}>
                                <FormAutocomplete
                                    fullWidth
                                    name='mob_validation_portfolio'
                                    label='Carteira'
                                    variant='outlined'
                                    size='medium'
                                    disableClearable
                                    disabled={loading}
                                    disabledAutocomplete={loading}
                                    control={control}
                                    errors={errors}
                                    options={listMobValidationPortfolios}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={4}>
                                <FormDatePicker
                                    fullWidth
                                    name='mob_validation_date'
                                    label='Data Validação'
                                    variant='outlined'
                                    size='medium'
                                    maxDate={String(new Date())}
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={12}>
                                <FormSwitchGroup
                                    row
                                    title='Contabilização da Produção'
                                    options={[
                                        {
                                            name: "mob_validation_is_counted",
                                            label: mobValidationIsCountedPublicWatch ? "Ativo" : "Inativo",
                                        },
                                    ]}
                                    control={control}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={12}>
                                <Collapse in={!mobValidationIsCountedPublicWatch}>
                                    <Alert
                                        severity='warning'
                                        sx={{
                                            fontSize: 12,
                                            border: `1px dashed #a1a800`,
                                        }}>
                                        A situação da validação está desativada, o que significa que esta produção não
                                        será contabilizada no painel do mobilizador. Se isso não for o desejado, ative a
                                        opção de contabilização.
                                    </Alert>
                                </Collapse>
                            </Grid>

                            <Grid item xs={12} sm={12} md={12}>
                                <Typography color='text.secondary' textAlign={"justify"} fontSize={12}>
                                    <b>Atenção:</b> Alterar os dados de validação desta produtividade impactará
                                    diretamente a contabilização dessa produção no relatório de mobilizador em tempo
                                    real. Faça alterações apenas se tiver certeza de que o ajuste é necessário!
                                </Typography>
                            </Grid>
                        </Grid>
                    </>

                    <Box display='flex' justifyContent='flex-end' gap={2} mt={2}>
                        <Button onClick={handleOpenApprovalModal} color='inherit'>
                            Cancelar
                        </Button>
                        <Button
                            onClick={() =>
                                handleSubmit((params) => onSubmitAuditProductivityDaily(params, "APROVADO"))()
                            }
                            color='success'
                            variant='contained'>
                            Confirmar
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <TemporaryDrawer
                title='Dados do Cooperado'
                closeButton={handleOpenModalClient}
                open={openModalClient}
                ModalProps={{
                    BackdropProps: { style: { backgroundColor: "transparent" } },
                }}
                sx={{
                    zIndex: 2001,
                    "& .MuiDrawer-paperAnchorRight": {
                        width: device === "Mobile" ? "100%" : "75%",
                    },
                    "& .MuiDrawer-paper": {
                        background:
                            themeContext === "light" ? "#ffffffae" : "linear-gradient(135deg, #051b1f, #0c2e33)",
                        borderLeft: `1px solid ${colorBorderSystem}`,
                        backdropFilter: "blur(30px)",
                        backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                        backgroundRepeat: "no-repeat, no-repeat",
                        backgroundSize: "50%, 50%",
                        backgroundPosition: "right top, left bottom",
                    },
                }}>
                <Box>
                    <ExtClientInfo idExtClient={idExtClient} p={3} />
                </Box>
            </TemporaryDrawer>
        </BoxModal>
    );
}
