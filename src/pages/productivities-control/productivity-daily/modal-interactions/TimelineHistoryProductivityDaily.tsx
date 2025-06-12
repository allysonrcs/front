import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BoxProps, Divider, Grid, Icon, Typography } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import { useGlobal } from "@/contexts/GlobalContext";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { TimeLineItem, TimelineItemContent } from "@/components/TimeLineItem/TimeLineItem";
import { formatDate } from "@/functions/date";
import {
    IHistoryProductivityDaily,
    searchAllHistoryProductivityDaily,
    searchProductivityDailyByID,
} from "@/services/productivities-control";
import { statusProductivityDailyMap, statusWithoutLabelMap } from "../ListRecordsProductivityDaily";

interface IInfoProductivityDaily {
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
    audited_by_name: string;
    date_audit: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export type ModalTimelineHistoryProps = {
    idProductivityDaily?: number;
    handleClose?: () => void;
} & BoxProps;

export function TimelineHistoryProductivityDaily({
    idProductivityDaily,
    handleClose,
    ...props
}: ModalTimelineHistoryProps) {
    const [dataHistoryProductivityDaily, setDataHistoryProductivityDaily] = useState<IHistoryProductivityDaily[]>([]);
    const [infoProductivityDaily, setInfoProductivityDaily] = useState<IInfoProductivityDaily>();
    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();
                if (idProductivityDaily) {
                    const dataProductivityDaily = await searchProductivityDailyByID(idProductivityDaily);
                    const dataHistoryProductivityDaily = await searchAllHistoryProductivityDaily(idProductivityDaily);

                    setInfoProductivityDaily(dataProductivityDaily);
                    setDataHistoryProductivityDaily(dataHistoryProductivityDaily);
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        execute();
    }, [idProductivityDaily]);

    return (
        <BoxModal
            title='Histórico'
            handleClose={handleClose}
            width='450px'
            maxHeight='80%'
            overflow={"auto"}
            {...props}>
            <Grid container justifyContent='center' mt={-3} mb={1}>
                <Typography fontSize='0.85rem'>
                    {infoProductivityDaily?.status &&
                        statusWithoutLabelMap[infoProductivityDaily.status] + " " + infoProductivityDaily.client_name}
                </Typography>
            </Grid>

            <Grid item xs={12} md={12}>
                <Divider sx={{ marginBottom: 1 }} />
            </Grid>

            <Grid component={"div"} padding={2} mt={-1} height={"55vh"} overflow={"auto"}>
                <Timeline>
                    {dataHistoryProductivityDaily &&
                        dataHistoryProductivityDaily.map(
                            (
                                {
                                    created_at,
                                    status,
                                    action,
                                    is_client,
                                    is_active,
                                    changed_by_name,
                                    created_by_name,
                                    date_audit,
                                    audited_by_name,
                                    productivities_control_type,
                                    mob_validation_agency_name,
                                    mob_validation_portfolio_name,
                                    mob_validation_is_counted,
                                },
                                index,
                            ) => {
                                if (productivities_control_type === null) {
                                    const previousCreatedByName =
                                        index > 0 ? dataHistoryProductivityDaily[index - 1].created_by_name : null;

                                    const isTransferred =
                                        previousCreatedByName && previousCreatedByName !== created_by_name;

                                    const actionName = action === "CRIADO" ? "Inserido" : "Atualizado";

                                    return (
                                        <TimeLineItem
                                            key={index}
                                            timeLineItemRigth={
                                                <TimelineItemContent>
                                                    <Typography
                                                        variant='h6'
                                                        fontSize='0.9rem'
                                                        component='span'
                                                        color='primary'
                                                        title={"Quem alterou"}>
                                                        {`${changed_by_name}`}
                                                    </Typography>

                                                    <Typography fontSize='0.75rem' title='Status da produtividade'>
                                                        {statusProductivityDailyMap[status]}
                                                    </Typography>

                                                    <Typography fontSize='0.75rem' title='Responsável da Produtividade'>
                                                        {isTransferred ? (
                                                            <>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='primary'
                                                                    sx={{ mb: -0.6 }}>
                                                                    swap_horiz
                                                                </Icon>
                                                                Transferido para:
                                                                <Typography fontSize='0.75rem'>
                                                                    {created_by_name}
                                                                </Typography>
                                                            </>
                                                        ) : (
                                                            created_by_name
                                                        )}
                                                    </Typography>

                                                    {!isTransferred && date_audit && (
                                                        <>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                <Icon fontSize='small' color='success' sx={{ mr: 0.5 }}>
                                                                    check_outline
                                                                </Icon>
                                                                Auditado por:
                                                            </Typography>
                                                            <Typography fontSize='0.75rem' sx={{ ml: 0.5 }}>
                                                                {audited_by_name}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </TimelineItemContent>
                                            }
                                            sx={{ m: "auto 0", flex: "none", ml: 1 }}
                                            timeLineItemLeft={
                                                <TimelineItemContent color='text.secondary'>
                                                    <Typography fontSize={"0.6rem"} title='Data da ação'>
                                                        {formatDate(created_at, "DD/MM/YYYY")}
                                                    </Typography>
                                                    <Typography
                                                        title={`Hora da ação: ${formatDate(created_at, "HH:mm:ss")}`}>
                                                        {formatDate(created_at, "HH:mm")}
                                                    </Typography>
                                                    <Typography fontSize={"0.58rem"} title='Status da ação'>
                                                        {actionName}
                                                    </Typography>
                                                </TimelineItemContent>
                                            }
                                        />
                                    );
                                } else {
                                    const actionName = action === "CRIADO" ? "Inserido" : "Atualizado";

                                    const previousCreatedByName =
                                        index > 0 ? dataHistoryProductivityDaily[index - 1].created_by_name : null;

                                    const previousMobValidationAgency =
                                        index > 0
                                            ? dataHistoryProductivityDaily[index - 1].mob_validation_agency_name || "-"
                                            : null;

                                    const previousMobValidationPortfolio =
                                        index > 0
                                            ? dataHistoryProductivityDaily[index - 1].mob_validation_portfolio_name ||
                                              "-"
                                            : null;

                                    const previousMobValidationIsCounted =
                                        index > 0
                                            ? dataHistoryProductivityDaily[index - 1].mob_validation_is_counted
                                            : null;

                                    const previousMobValidationIsClient =
                                        index > 0 ? dataHistoryProductivityDaily[index - 1].is_client : null;

                                    const previousMobValidationIsActive =
                                        index > 0 ? dataHistoryProductivityDaily[index - 1].is_active : null;

                                    return (
                                        <TimeLineItem
                                            key={index}
                                            sx={{ m: "auto 0", flex: "none", ml: 1 }}
                                            timeLineItemLeft={
                                                <TimelineItemContent color='text.secondary'>
                                                    <Typography fontSize={"0.6rem"} title='Data da ação'>
                                                        {formatDate(created_at, "DD/MM/YYYY")}
                                                    </Typography>
                                                    <Typography
                                                        title={`Hora da ação: ${formatDate(created_at, "HH:mm:ss")}`}>
                                                        {formatDate(created_at, "HH:mm")}
                                                    </Typography>
                                                    <Typography fontSize={"0.58rem"} title='Status da ação'>
                                                        {actionName}
                                                    </Typography>
                                                </TimelineItemContent>
                                            }
                                            timeLineItemRigth={
                                                <TimelineItemContent>
                                                    {productivities_control_type === "CADASTRO" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                color='primary'
                                                                title='Quem alterou'>
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Status da produtividade'>
                                                                {statusProductivityDailyMap[status]}
                                                            </Typography>
                                                        </>
                                                    )}

                                                    {productivities_control_type === "ATUALIZACAO_STATUS" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                color='primary'
                                                                title='Quem alterou'>
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Status da produtividade'>
                                                                {statusProductivityDailyMap[status]}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title=''
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                <Icon
                                                                    fontSize='small'
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        ml: 0.1,
                                                                        color: date_audit ? "#48A8F5" : "#c9d200",
                                                                        fontSize: "14px",
                                                                    }}>
                                                                    {date_audit ? "verified_outline" : "edit_outline"}
                                                                </Icon>
                                                                {date_audit ? "Auditado por:" : "Alterado por"}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                <Icon
                                                                    color='action'
                                                                    fontSize='small'
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        ml: 0.1,

                                                                        fontSize: "14px",
                                                                    }}>
                                                                    person_4_outline
                                                                </Icon>
                                                                {date_audit ? audited_by_name : changed_by_name}
                                                            </Typography>
                                                        </>
                                                    )}

                                                    {productivities_control_type === "ATUALIZACAO_CADASTRO" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                color='primary'
                                                                title='Quem alterou'>
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Status da produtividade'>
                                                                {statusProductivityDailyMap[status]}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title=''
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='warning'
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        ml: 0.15,
                                                                        fontSize: "14px",
                                                                    }}>
                                                                    edit_note_outline
                                                                </Icon>
                                                                Editado
                                                            </Typography>
                                                        </>
                                                    )}

                                                    {productivities_control_type === "ATUALIZACAO_SITUACAO" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                color='primary'
                                                                title='Quem alterou'>
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Status da produtividade'>
                                                                {statusProductivityDailyMap[status]}
                                                            </Typography>

                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Produtividade Sincronizada'>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='disabled'
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        ml: 0.15,
                                                                        fontSize: "14px",
                                                                        color: "#db7515",
                                                                    }}>
                                                                    autorenew_outline
                                                                </Icon>
                                                                Situação:
                                                            </Typography>

                                                            <Typography
                                                                fontSize='0.75rem'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                {`${previousMobValidationIsActive ? "🟢 Ativado" : "🔴 Inativado"} ➡ ${is_active ? "🟢 Ativado" : "🔴 Inativado"}`}
                                                            </Typography>
                                                        </>
                                                    )}

                                                    {productivities_control_type === "TRANSFERENCIA" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                color='primary'
                                                                title='Quem alterou'>
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Status da produtividade'>
                                                                {statusProductivityDailyMap[status]}
                                                            </Typography>

                                                            <Typography
                                                                title='Usuário anterior responsável pela a produtividade'
                                                                fontSize='0.75rem'
                                                                color='error'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                <Icon
                                                                    color='error'
                                                                    fontSize='small'
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        ml: 0.1,
                                                                        fontSize: "14px",
                                                                    }}>
                                                                    person_remove
                                                                </Icon>
                                                                {previousCreatedByName}
                                                            </Typography>

                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Transferência de Responsável'>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='primary'
                                                                    sx={{ mr: 0.5, ml: 0.15, fontSize: "14px" }}>
                                                                    swap_horiz
                                                                </Icon>
                                                                Transferido para:
                                                            </Typography>

                                                            <Typography
                                                                title='Novo usuário responsável pela a produtividade'
                                                                fontSize='0.75rem'
                                                                color='#7DB61C'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                <Icon
                                                                    color='success'
                                                                    fontSize='small'
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        ml: 0.1,
                                                                        fontSize: "14px",
                                                                    }}>
                                                                    person_add_alt
                                                                </Icon>
                                                                {created_by_name}
                                                            </Typography>
                                                        </>
                                                    )}

                                                    {productivities_control_type === "VALIDACAO" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                color='primary'
                                                                title='Quem alterou'>
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Status da produtividade'>
                                                                {statusProductivityDailyMap[status]}
                                                            </Typography>

                                                            <Typography
                                                                title='Agência de validação anterior'
                                                                fontSize='0.75rem'
                                                                color='error'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                <Icon
                                                                    color='error'
                                                                    fontSize='small'
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        ml: 0.1,
                                                                        fontSize: "14px",
                                                                    }}>
                                                                    account_balance
                                                                </Icon>
                                                                {previousMobValidationAgency}
                                                            </Typography>
                                                            <Typography
                                                                title='Carteira de validação anterior'
                                                                fontSize='0.75rem'
                                                                color='error'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                <Icon
                                                                    color='error'
                                                                    fontSize='small'
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        ml: 0.1,
                                                                        fontSize: "14px",
                                                                    }}>
                                                                    wallet
                                                                </Icon>
                                                                {previousMobValidationPortfolio}
                                                            </Typography>
                                                            <Typography
                                                                title='Situação da validação anterior'
                                                                fontSize='0.75rem'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                {previousMobValidationIsCounted
                                                                    ? "✅ Ativo"
                                                                    : "⛔ Inativo"}
                                                            </Typography>

                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Validação da produtividade'>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='primary'
                                                                    sx={{ mr: 0.5, ml: 0.15, fontSize: "14px" }}>
                                                                    swap_horiz
                                                                </Icon>
                                                                Validação alterado para:
                                                            </Typography>

                                                            <Typography
                                                                title='Agência de validação Posterior'
                                                                fontSize='0.75rem'
                                                                color='#7DB61C'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                <Icon
                                                                    color='success'
                                                                    fontSize='small'
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        ml: 0.1,
                                                                        fontSize: "14px",
                                                                    }}>
                                                                    account_balance
                                                                </Icon>
                                                                {mob_validation_agency_name}
                                                            </Typography>
                                                            <Typography
                                                                title='Carteira de validação Posterior'
                                                                fontSize='0.75rem'
                                                                color='#7DB61C'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                <Icon
                                                                    color='success'
                                                                    fontSize='small'
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        ml: 0.1,
                                                                        fontSize: "14px",
                                                                    }}>
                                                                    wallet
                                                                </Icon>
                                                                {mob_validation_portfolio_name}
                                                            </Typography>
                                                            <Typography
                                                                title='Situação da validação posterior'
                                                                fontSize='0.75rem'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                {mob_validation_is_counted ? "✅ Ativo" : "⛔ Inativo"}
                                                            </Typography>
                                                        </>
                                                    )}

                                                    {productivities_control_type === "SINCRONIZACAO" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                color='primary'
                                                                title='Quem alterou'>
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Status da produtividade'>
                                                                {statusProductivityDailyMap[status]}
                                                            </Typography>

                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Produtividade Sincronizada'>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='disabled'
                                                                    sx={{ mr: 0.5, ml: 0.15, fontSize: "14px" }}>
                                                                    cloud_sync_outline
                                                                </Icon>
                                                                Sincronizado:
                                                            </Typography>

                                                            <Typography
                                                                fontSize='0.75rem'
                                                                sx={{ display: "flex", alignItems: "center" }}>
                                                                {`${previousMobValidationIsClient ? "💚 Não" : "🚩 Sim"} ➡ ${is_client ? "💚 Não" : "🚩 Sim"}`}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </TimelineItemContent>
                                            }
                                        />
                                    );
                                }
                            },
                        )}
                </Timeline>
            </Grid>
            <Divider sx={{ marginBottom: 1 }} />
        </BoxModal>
    );
}
