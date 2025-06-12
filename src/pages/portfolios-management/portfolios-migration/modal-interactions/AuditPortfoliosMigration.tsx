import { useEffect, useState } from "react";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { Box, BoxProps, Grid, Icon, IconButton, Modal, Skeleton, Tooltip, Typography, useTheme } from "@mui/material";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
    changeStatusPortfoliosMigrationFinished,
    searchPortfoliosMigrationByID,
} from "@/services/portfolios-management";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobal } from "@/contexts/GlobalContext";
import { useConfirm } from "material-ui-confirm";
import { toast } from "react-toastify";
import moment from "moment";
import FormInput from "@/components/FormComponents/FormInput";
import { formatDate } from "@/functions/date";
import { formatCnpjCpf } from "@/functions/number";
import { LoadingButton } from "@mui/lab";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { ExtClientInfo } from "@/components/ExtClientInfo/ExtClientInfo";
import { statusMap } from "@/constants/map-status";
import { copyText } from "@/functions/text";
import { TimelineHistoryPortfoliosMigration } from "./HistoryPortfoliosMigration";

export type EditAuditPortfoliosMigrationProps = {
    id?: number;
    // status_validation_origin?: string;
    status_validation_destiny?: string;
    status_finished?: string;
    manager_destiny_by_name?: string;
    audited_by_name?: string;
    date_finished?: string;
    date_validation_destiny?: string;
    updated_at?: string;
};

export interface IInfoPortfoliosMigration {
    id: number;
    status_finished: string;
    // status_validation_origin: string;
    status_validation_destiny: string;
    migration_type: string;
    is_client: boolean;
    client_date_movement: string;
    client_sisbr_id: number;
    client_name: string;
    client_document: string;
    client_agency_name: string;
    client_id_agency: number;
    client_id_portfolio: number;
    client_portfolio_name: string;
    client_profile: string;
    client_is_rural: boolean;
    origin_portfolio_manager_name: string | null;
    new_client_id_agency: number;
    new_client_agency_name: string;
    new_client_id_portfolio: number;
    new_client_portfolio_name: string;
    destiny_portfolio_manager_name: string | null;
    origin_real_portfolio_name: string;
    // manager_origin_by_id: number;
    // manager_origin_by_name: string;
    // date_validation_origin: string;
    reason: string;
    observation: string | null;
    created_by_id: number;
    created_by_name: string;
    manager_destiny_by_id: number;
    manager_destiny_by_name: string;
    date_validation_destiny: string;
    audited_by_id: number;
    audited_by_name: string;
    date_finished: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

type AuditProps = {
    observation?: string | null;
    content_manual?: string | null;
};

export type ModalAuditPortfoliosMigrationProps = {
    idPortfoliosMigration?: number;
    permissionPortfoliosMigration?: boolean;
    handleClose?: () => void;
    updateColumn?: (params: EditAuditPortfoliosMigrationProps) => void;
} & BoxProps;

const validationSchemaPortfoliosMigration = Yup.object().shape({
    observation: Yup.string().nullable(),
    content_manual: Yup.string().nullable(),
});

export function AuditPortfoliosMigration({
    idPortfoliosMigration,
    permissionPortfoliosMigration,
    handleClose,
    updateColumn,
    ...props
}: ModalAuditPortfoliosMigrationProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [infoPortfoliosMigration, setInfoPortfoliosMigration] = useState<IInfoPortfoliosMigration>();
    const [copied, setCopied] = useState(false);
    const [openModalClient, setOpenModalClient] = useState(false);
    const [openModalHistoryPortfoliosMigration, setOpenModalHistoryPortfoliosMigration] = useState(false);
    const [idExtClient, setIdExtClient] = useState<number>();
    const { user } = useAuth();
    const {
        getInfoError,
        colorBorderSystem,
        colorBackgroundSystem,
        redBlur,
        cyanBlur,
        theme: themeContext,
    } = useGlobal();
    const confirm = useConfirm();
    const theme = useTheme();
    const { device } = useMediaQuery();

    const {
        handleSubmit,
        setValue,
        resetField,
        control,
        formState: { errors },
    } = useForm<AuditProps>({
        resolver: yupResolver(validationSchemaPortfoliosMigration),
    });

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleHistoryPortfoliosMigration = () => {
        setOpenModalHistoryPortfoliosMigration((oldValue) => !oldValue);
    };

    const onSubmitAuditPortfoliosMigrationFinished = async (
        params: AuditProps,
        status_finished: string,
        status_validation?: string,
    ) => {
        try {
            setLoading(true);

            if (idPortfoliosMigration) {
                const payload: any = { status_finished };

                if (status_finished === "REPROVADO" || status_finished === "CORREÇÃO") {
                    payload["content_manual"] = params.content_manual;
                }

                const dateNow: string = moment().format("YYYY-MM-DD HH:mm:ss");

                await changeStatusPortfoliosMigrationFinished(idPortfoliosMigration, payload);

                updateColumn?.({
                    status_finished: status_finished,
                    audited_by_name: status_finished !== "CORREÇÃO" ? user?.name : "",
                    date_finished: status_finished !== "CORREÇÃO" ? dateNow : "",
                    updated_at: status_finished !== "CORREÇÃO" ? dateNow : "",
                });

                toast.success(
                    `Registro de Produtividade Diária ${
                        status_finished === "APROVADO"
                            ? "👍 Aprovado"
                            : status_finished === "REPROVADO"
                              ? "👎 Reprovado"
                              : status_finished === "CORREÇÃO"
                                ? "alterado para: ✏️ Correção"
                                : "Atualizado"
                    } com sucesso!`,
                );
                handleClose?.();
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        const message = await copyText(text);
        toast.info(message);
    };

    const setValuesPortfoliosMigrationByID = async (id_portfolios_migration: number) => {
        try {
            setLoading(true);

            if (id_portfolios_migration) {
                const dataProductivityDaily = await searchPortfoliosMigrationByID(id_portfolios_migration);

                setInfoPortfoliosMigration(dataProductivityDaily);

                setValue("observation", dataProductivityDaily.observation);
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function execute() {
            if (idPortfoliosMigration) {
                await setValuesPortfoliosMigrationByID(idPortfoliosMigration);
            }
        }

        execute();
    }, [idPortfoliosMigration]);

    const RegisterPortfoliosMigration = (props: IInfoPortfoliosMigration) => {
        return (
            <>
                <Typography fontWeight={"900"}>Informações do Cooperado:</Typography>
                <Typography fontWeight={"100"} mb={-1}>
                    <Typography component={"span"} color={"primary"}>
                        ID:
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
                <Typography fontWeight={"100"} mb={-0.5}>
                    <Typography component={"span"} color={"primary"}>
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
                <Typography fontWeight={"100"} mb={-0.5}>
                    <Typography component={"span"} color={"primary"}>
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
                    <Typography component={"span"} color={"primary"}>
                        Perfil:
                    </Typography>{" "}
                    {props.client_profile}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        É rural:
                    </Typography>{" "}
                    {props.client_is_rural ? "Sim 🌱" : "Não"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        É cooperado:
                    </Typography>{" "}
                    {props.is_client ? "Sim" : "Não"}
                </Typography>

                <Typography fontWeight={"900"} mb={1} mt={1}>
                    PA/Carteira de Origem:
                </Typography>

                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        PA origem:
                    </Typography>{" "}
                    {props.client_agency_name}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Carteira origem:
                    </Typography>{" "}
                    {props.client_portfolio_name}
                </Typography>

                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Carteira real:
                    </Typography>{" "}
                    {props.origin_real_portfolio_name}
                </Typography>

                {props?.origin_portfolio_manager_name && (
                    <Typography fontWeight={"100"}>
                        <Typography component={"span"} color={"primary"}>
                            Gerente carteira:
                        </Typography>{" "}
                        {props.origin_portfolio_manager_name}
                    </Typography>
                )}

                <Grid container ml={7}>
                    <ArrowDownwardOutlinedIcon color='warning' sx={{ width: "2rem", height: "2rem" }} />
                </Grid>

                <Typography fontWeight={"900"} mb={1}>
                    PA/Carteira de Destino:
                </Typography>

                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        PA destino:
                    </Typography>{" "}
                    {props.new_client_agency_name}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Carteira destino:
                    </Typography>{" "}
                    {props.new_client_portfolio_name}
                </Typography>

                {props?.destiny_portfolio_manager_name && (
                    <Typography fontWeight={"100"}>
                        <Typography component={"span"} color={"primary"}>
                            Gerente carteira:
                        </Typography>{" "}
                        {props.destiny_portfolio_manager_name}
                    </Typography>
                )}
            </>
        );
    };

    const ResponsiblePortfoliosMigration = (props: IInfoPortfoliosMigration) => {
        return (
            <>
                <Typography fontWeight={"900"}>Informações Adicionais:</Typography>
                <Typography fontWeight={"100"} mt={1} mb={-1}>
                    <Typography component={"span"} color={"primary"}>
                        Status finalização:
                    </Typography>{" "}
                    {statusMap[props.status_finished] || props.status_finished}
                </Typography>
                <Typography fontWeight={"100"} mt={1}>
                    <Typography component={"span"} color={"primary"}>
                        Status validação:
                    </Typography>{" "}
                    {statusMap[props.status_validation_destiny] || props.status_validation_destiny}
                </Typography>

                <Typography fontWeight={"100"} mb={-1}>
                    <Typography component={"span"} color={"primary"}>
                        Tipo migração:
                    </Typography>{" "}
                    {props.migration_type === "ENVIANDO" ? "Enviando" : "Solicitando"}
                </Typography>

                <Typography fontWeight={"100"} mt={1}>
                    <Typography component={"span"} color={"primary"}>
                        Criado por:
                    </Typography>{" "}
                    {props.created_by_name}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Inserido em:
                    </Typography>{" "}
                    {props.created_at ? formatDate(props.created_at, "DD/MM/YYYY HH:mm:ss") : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Validado por:
                    </Typography>{" "}
                    {props.manager_destiny_by_name ? props.manager_destiny_by_name : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Data validação:
                    </Typography>{" "}
                    {props.date_validation_destiny
                        ? formatDate(props.date_validation_destiny, "DD/MM/YYYY HH:mm:ss")
                        : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Auditado por:
                    </Typography>{" "}
                    {props.audited_by_name ? props.audited_by_name : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Data finalização:
                    </Typography>{" "}
                    {props.date_finished ? formatDate(props.date_finished, "DD/MM/YYYY HH:mm:ss") : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Atualizado em:
                    </Typography>{" "}
                    {props.updated_at ? formatDate(props.updated_at, "DD/MM/YYYY HH:mm:ss") : "-"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Situação:
                    </Typography>{" "}
                    {props.is_active ? "🟢 Ativo" : "🔴 Inativo"}
                </Typography>
                <Typography fontWeight={"100"}>
                    <Typography component={"span"} color={"primary"}>
                        Motivo:
                    </Typography>{" "}
                    {props.reason ? props.reason : "-"}
                </Typography>
                <Typography fontWeight={"900"} mt={1} mb={1}>
                    Observação:
                </Typography>
                <Grid item xs={12} md={12} mt={1}>
                    <FormInput
                        fullWidth
                        multiline
                        rows={3}
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
            title={`${infoPortfoliosMigration?.status_finished ? statusMap[infoPortfoliosMigration?.status_finished] + " | " + infoPortfoliosMigration?.client_name : "Não encontrado"}`}
            handleClose={handleClose}
            width='70%'
            maxHeight='95%'
            overflow={"auto"}
            {...props}>
            <Box component={"form"} mt={-2}>
                <Grid container gap={2}>
                    <Grid
                        container
                        sx={{
                            border: `1px dashed ${theme.palette.divider}`,
                            borderRadius: 4,
                            boxShadow: "0px 0px 2px 0px rgba(145, 158, 171, 0.16) ",
                        }}>
                        {loading ? (
                            <>
                                <Grid item xs={12} md={6} padding={2}>
                                    <Skeleton
                                        variant='rounded'
                                        animation='wave'
                                        height={450}
                                        width={"100%"}
                                        sx={{ borderRadius: 3.5 }}
                                    />
                                </Grid>

                                <Grid item xs={12} md padding={2}>
                                    <Skeleton
                                        variant='rounded'
                                        animation='wave'
                                        height={450}
                                        width={"100%"}
                                        sx={{ borderRadius: 3.5 }}
                                    />
                                </Grid>
                            </>
                        ) : infoPortfoliosMigration ? (
                            <>
                                <Grid item xs={12} md={6} padding={2.5}>
                                    {infoPortfoliosMigration && (
                                        <RegisterPortfoliosMigration {...infoPortfoliosMigration} />
                                    )}
                                </Grid>

                                <Grid item xs={12} md padding={2.5}>
                                    {infoPortfoliosMigration && (
                                        <ResponsiblePortfoliosMigration {...infoPortfoliosMigration} />
                                    )}
                                </Grid>
                            </>
                        ) : (
                            <Grid container alignItems='center' justifyContent='center' xs={12} md={12} padding={2.5}>
                                <Typography fontSize={16} color='warning'>
                                    Nenhuma informação da migração encontrado!
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                    {permissionPortfoliosMigration &&
                        permissionPortfoliosMigration === true &&
                        !!infoPortfoliosMigration && (
                            <>
                                <Grid container justifyContent='center' alignItems='center' gap={2} mt={0} mb={-2}>
                                    <Grid container alignItems='center' justifyContent='center' gap={1}>
                                        <Grid container justifyContent={"center"}>
                                            <Typography fontSize={12} fontWeight={"600"}>
                                                Finalização:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <LoadingButton
                                                size='large'
                                                color='success'
                                                variant='contained'
                                                title='Aprovar Migração de Carteira'
                                                startIcon={<Icon>thumb_up_outlined_icon</Icon>}
                                                loading={loading}
                                                disabled={
                                                    !!(
                                                        (infoPortfoliosMigration?.status_finished &&
                                                            [
                                                                "FINALIZADO",
                                                                "CORREÇÃO",
                                                                "CANCELADO",
                                                                "APROVADO",
                                                            ].includes(infoPortfoliosMigration.status_finished)) ||
                                                        (infoPortfoliosMigration?.status_validation_destiny &&
                                                            ["REJEITADO", "AGUARDANDO", "CANCELADO"].includes(
                                                                infoPortfoliosMigration?.status_validation_destiny,
                                                            ))
                                                    )
                                                }
                                                onClick={async () => {
                                                    await confirm({
                                                        title: "Confirmação de Aprovação",
                                                        description: "Tem certeza de que deseja aprovar esta migração?",
                                                        dialogProps: {
                                                            sx: { zIndex: 100000 },
                                                        },
                                                    })
                                                        .then(() =>
                                                            handleSubmit((params) =>
                                                                onSubmitAuditPortfoliosMigrationFinished(
                                                                    params,
                                                                    "APROVADO",
                                                                ),
                                                            )(),
                                                        )
                                                        .catch(() => {});
                                                }}>
                                                Aprovar
                                            </LoadingButton>
                                        </Grid>

                                        <Grid item>
                                            <LoadingButton
                                                size='large'
                                                color='error'
                                                variant='contained'
                                                title='Reprovar Migração de Carteira'
                                                startIcon={<Icon>thumb_down_outlined_icon</Icon>}
                                                loading={loading}
                                                disabled={
                                                    !!(
                                                        (infoPortfoliosMigration?.status_finished &&
                                                            [
                                                                "FINALIZADO",
                                                                "CORREÇÃO",
                                                                "REPROVADO",
                                                                "CANCELADO",
                                                            ].includes(infoPortfoliosMigration.status_finished)) ||
                                                        (infoPortfoliosMigration?.status_validation_destiny &&
                                                            ["AGUARDANDO", "CANCELADO"].includes(
                                                                infoPortfoliosMigration?.status_validation_destiny,
                                                            ))
                                                    )
                                                }
                                                onClick={async () => {
                                                    await confirm({
                                                        title: "Confirmação de Reprovação",
                                                        description: (
                                                            <>
                                                                <Typography>
                                                                    Tem certeza de que deseja reprovar esta migração?
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
                                                            sx: { zIndex: 100000 },
                                                        },
                                                    })
                                                        .then(() =>
                                                            handleSubmit((params) =>
                                                                onSubmitAuditPortfoliosMigrationFinished(
                                                                    params,
                                                                    "REPROVADO",
                                                                ),
                                                            )(),
                                                        )
                                                        .catch(() => {
                                                            resetField("content_manual");
                                                        });
                                                }}>
                                                Reprovar
                                            </LoadingButton>
                                        </Grid>

                                        {idPortfoliosMigration && (
                                            <Grid>
                                                <LoadingButton
                                                    size='large'
                                                    color='info'
                                                    variant='contained'
                                                    title='Histórico da Migração'
                                                    startIcon={<Icon>history_outlined_icon</Icon>}
                                                    loading={loading}
                                                    onClick={handleHistoryPortfoliosMigration}>
                                                    Histórico
                                                </LoadingButton>
                                            </Grid>
                                        )}

                                        {/* <Grid item>
                                            <LoadingButton
                                                size='large'
                                                color='primary'
                                                variant='contained'
                                                title='Solicitar Correção da Migração de Carteira'
                                                startIcon={<Icon>edit_note_outlined_icon</Icon>}
                                                loading={loading}
                                                disabled={
                                                    !!(
                                                        (infoPortfoliosMigration?.status_finished &&
                                                            ["FINALIZADO", "CORREÇÃO", "CANCELADO"].includes(
                                                                infoPortfoliosMigration.status_finished,
                                                            )) ||
                                                        (infoPortfoliosMigration?.status_validation_destiny &&
                                                            ["REJEITADO", "AGUARDANDO", "CANCELADO"].includes(
                                                                infoPortfoliosMigration?.status_validation_destiny,
                                                            ))
                                                    )
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
                                                            sx: { zIndex: 100000 },
                                                        },
                                                    })
                                                        .then(() =>
                                                            handleSubmit((params) =>
                                                                onSubmitAuditPortfoliosMigrationFinished(
                                                                    params,
                                                                    "CORREÇÃO",
                                                                ),
                                                            )(),
                                                        )
                                                        .catch(() => {
                                                            resetField("content_manual");
                                                        });
                                                }}>
                                                Correção
                                            </LoadingButton>
                                        </Grid> */}

                                        {/* <Grid item>
                                            <LoadingButton
                                                size='large'
                                                sx={{
                                                    boxShadow: "none",
                                                    backgroundColor: "#f1c02e",
                                                    "&:hover": {
                                                        backgroundColor: "#d3a51c",
                                                    },
                                                }}
                                                variant='contained'
                                                title='Voltar status de Finalização e Validação Migração de Carteira'
                                                startIcon={<Icon>history_outlined_icon</Icon>}
                                                loading={loading}
                                                disabled={
                                                    !!(
                                                        (infoPortfoliosMigration?.status_finished &&
                                                            [
                                                                "FINALIZADO",
                                                                "APROVADO",
                                                                "PENDENTE",
                                                                "CANCELADO",
                                                            ].includes(infoPortfoliosMigration.status_finished)) ||
                                                        (infoPortfoliosMigration?.status_validation_destiny &&
                                                            ["CANCELADO"].includes(
                                                                infoPortfoliosMigration?.status_validation_destiny,
                                                            ))
                                                    )
                                                }
                                                onClick={async () => {
                                                    await confirm({
                                                        title: "Confirmação de Resete de Status",
                                                        description:
                                                            "Tem certeza de que deseja voltar essa migração para o status de 🟡 Pendente e 🟠 Aguardando?",
                                                        dialogProps: {
                                                            sx: { zIndex: 100000 },
                                                        },
                                                    })
                                                        .then(() =>
                                                            handleSubmit((params) =>
                                                                onSubmitAuditPortfoliosMigrationFinished(
                                                                    params,
                                                                    "PENDENTE",
                                                                    "AGUARDANDO",
                                                                ),
                                                            )(),
                                                        )
                                                        .catch(() => {});
                                                }}>
                                                Resetar
                                            </LoadingButton>
                                        </Grid> */}
                                    </Grid>
                                </Grid>
                            </>
                        )}
                </Grid>
            </Box>
            <TemporaryDrawer
                title='Dados do Cooperado'
                closeButton={handleOpenModalClient}
                onClose={handleOpenModalClient}
                disableEscapeKeyDown={false}
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

            <Modal open={openModalHistoryPortfoliosMigration}>
                <TimelineHistoryPortfoliosMigration
                    idPortfoliosMigration={idPortfoliosMigration}
                    handleClose={handleHistoryPortfoliosMigration}
                />
            </Modal>
        </BoxModal>
    );
}
