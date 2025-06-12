import { useEffect, useState } from "react";
import { BoxProps, Divider, Grid, Icon, Skeleton, Typography, useMediaQuery, useTheme } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import { useGlobal } from "@/contexts/GlobalContext";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { TimeLineItem, TimelineItemContent } from "@/components/TimeLineItem/TimeLineItem";
import { formatDate } from "@/functions/date";
import { toast } from "react-toastify";
import { searchAllHistoryPortfoliosMigration, searchPortfoliosMigrationByID } from "@/services/portfolios-management";
import { statusMap } from "@/constants/map-status";

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
    new_client_id_agency: number;
    new_client_agency_name: string;
    new_client_id_portfolio: number;
    new_client_portfolio_name: string;
    //
    // manager_origin_by_id: number;
    // manager_origin_by_name: string;
    // date_validation_origin: string;
    //
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

export type ModalTimelineHistoryPortfoliosMigratioProps = {
    idPortfoliosMigration?: number;
    handleClose?: () => void;
} & BoxProps;

export function TimelineHistoryPortfoliosMigration({
    idPortfoliosMigration,
    handleClose,
    ...props
}: ModalTimelineHistoryPortfoliosMigratioProps) {
    const [dataHistoryPortfoliosMigration, setDataHistoryPortfoliosMigration] = useState<any[]>([]);
    const [infoPortfoliosMigration, setInfoPortfoliosMigration] = useState<IInfoPortfoliosMigration>();
    const [loading, setLoading] = useState<boolean>(false);
    const { getInfoError, toggleStatusBackdrop } = useGlobal();
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                if (idPortfoliosMigration) {
                    const dataPortfoliosMigrationHistory =
                        await searchAllHistoryPortfoliosMigration(idPortfoliosMigration);
                    const dataPortfoliosMigration = await searchPortfoliosMigrationByID(idPortfoliosMigration);

                    setInfoPortfoliosMigration(dataPortfoliosMigration);
                    setDataHistoryPortfoliosMigration(dataPortfoliosMigrationHistory);
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                setLoading(false);
                toggleStatusBackdrop();
            }
        }
        execute();
    }, [idPortfoliosMigration]);

    return (
        <BoxModal
            title='Histórico'
            handleClose={handleClose}
            width={isMobile ? "95%" : "50%"}
            height={isMobile ? "95%" : "80%"}
            overflow={"auto"}
            {...props}>
            <Grid container justifyContent='center' mt={-3} mb={1}>
                <Typography fontSize='0.85rem'>
                    {infoPortfoliosMigration?.status_finished
                        ? statusMap[infoPortfoliosMigration.status_finished] +
                          " | " +
                          infoPortfoliosMigration.client_name
                        : "Migração não encontrada"}
                </Typography>
            </Grid>

            <Grid item xs={12} md={12}>
                <Divider sx={{ marginBottom: 1 }} />
            </Grid>

            <Grid component={"div"} padding={2} mt={-1} height={"55vh"} overflow={"auto"}>
                {loading ? (
                    <Grid container gap={1}>
                        {[...Array(4)].map((_, index) => (
                            <Grid item xs={12} key={index}>
                                <Skeleton variant='rectangular' animation='wave' height={80} sx={{ borderRadius: 1 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Timeline>
                        {dataHistoryPortfoliosMigration && dataHistoryPortfoliosMigration.length > 0 ? (
                            dataHistoryPortfoliosMigration.map(
                                (
                                    {
                                        action,
                                        created_at,
                                        status_finished,
                                        status_validation_destiny,
                                        changed_by_name,
                                        created_by_name,
                                        content_manual,
                                        content_automatic,
                                        migration_type,
                                    },
                                    index,
                                ) => {
                                    let actionName;

                                    switch (action) {
                                        case "CRIACAO":
                                            actionName = "Criação";
                                            break;
                                        case "SITUACAO":
                                            actionName = "Situação";
                                            break;
                                        case "VALIDACAO":
                                            actionName = "Validação";
                                            break;
                                        case "FINALIZACAO":
                                            actionName = "Finalização";
                                            break;
                                        case "ATUALIZACAO_MANUAL":
                                            actionName = "Atualização";
                                            break;
                                        case "ATUALIZACAO_SISBR":
                                            actionName = "Atualização";
                                            break;
                                    }

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
                                                    {action === "CRIACAO" && (
                                                        <>
                                                            <Typography variant='h6' fontSize='0.9rem' component='span'>
                                                                <span
                                                                    style={{
                                                                        color: "#d1b725",
                                                                        fontWeight: 700,
                                                                    }}>
                                                                    Criado por:
                                                                </span>{" "}
                                                                {created_by_name}
                                                            </Typography>
                                                            <Typography
                                                                fontSize='0.75rem'
                                                                title='Status de Finalização da Migração'>
                                                                {statusMap[status_finished]}{" "}
                                                                <Typography
                                                                    fontSize='0.75rem'
                                                                    title='Status de validação da Migração'
                                                                    component='span'
                                                                    ml={0.5}>
                                                                    {`| ${statusMap[status_validation_destiny]}`}
                                                                </Typography>
                                                                <Typography
                                                                    fontSize='0.75rem'
                                                                    title='Tipo da Migração'
                                                                    component='span'
                                                                    ml={0.5}>
                                                                    {`| ${migration_type === "ENVIANDO" ? "Enviando ➡️" : "Solicitando ⬅️"}`}
                                                                </Typography>
                                                            </Typography>
                                                        </>
                                                    )}

                                                    {action === "VALIDACAO" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                title={"Validado por"}>
                                                                <span
                                                                    style={{
                                                                        color: "#009688",
                                                                        fontWeight: 700,
                                                                    }}>
                                                                    Validado por:
                                                                </span>{" "}
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography fontSize='0.75rem' title='Mensagem automática'>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='warning'
                                                                    className='material-icons-outlined'
                                                                    sx={{ mb: -0.5, mr: 0.5 }}>
                                                                    auto_fix_high
                                                                </Icon>
                                                                <Typography
                                                                    variant='h6'
                                                                    component='span'
                                                                    sx={{ color: "#c9d200" }}>
                                                                    Automático:{" "}
                                                                </Typography>
                                                                {content_automatic}
                                                            </Typography>
                                                            {content_manual && (
                                                                <Typography fontSize='0.75rem' title='Mensagem manual'>
                                                                    <Icon
                                                                        fontSize='small'
                                                                        color='success'
                                                                        className='material-icons-outlined'
                                                                        sx={{ mb: -0.5, mr: 0.5 }}>
                                                                        edit_outlined
                                                                    </Icon>
                                                                    <Typography
                                                                        variant='h6'
                                                                        component='span'
                                                                        sx={{ color: "#7DB61C" }}>
                                                                        Manual:{" "}
                                                                    </Typography>
                                                                    {content_manual}
                                                                </Typography>
                                                            )}
                                                        </>
                                                    )}

                                                    {action === "FINALIZACAO" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                title={"Finalizado por"}>
                                                                <span
                                                                    style={{
                                                                        color: "#009688",
                                                                        fontWeight: 700,
                                                                    }}>
                                                                    Finalizado por:
                                                                </span>{" "}
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography fontSize='0.75rem' title='Mensagem automática'>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='warning'
                                                                    className='material-icons-outlined'
                                                                    sx={{ mb: -0.5, mr: 0.5 }}>
                                                                    auto_fix_high
                                                                </Icon>
                                                                <Typography
                                                                    variant='h6'
                                                                    component='span'
                                                                    sx={{ color: "#c9d200" }}>
                                                                    Automático:{" "}
                                                                </Typography>
                                                                {content_automatic}
                                                            </Typography>
                                                            {content_manual && (
                                                                <Typography fontSize='0.75rem' title='Mensagem manual'>
                                                                    <Icon
                                                                        fontSize='small'
                                                                        color='success'
                                                                        className='material-icons-outlined'
                                                                        sx={{ mb: -0.5, mr: 0.5 }}>
                                                                        edit_outlined
                                                                    </Icon>
                                                                    <Typography
                                                                        variant='h6'
                                                                        component='span'
                                                                        sx={{ color: "#7DB61C" }}>
                                                                        Manual:{" "}
                                                                    </Typography>
                                                                    {content_manual}
                                                                </Typography>
                                                            )}
                                                        </>
                                                    )}

                                                    {action === "SITUACAO" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                title={"Alterado por"}>
                                                                <span
                                                                    style={{
                                                                        color: "#009688",
                                                                        fontWeight: 700,
                                                                    }}>
                                                                    Alterado por:
                                                                </span>{" "}
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography fontSize='0.75rem' title='Mensagem automática'>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='warning'
                                                                    className='material-icons-outlined'
                                                                    sx={{ mb: -0.5, mr: 0.5 }}>
                                                                    auto_fix_high
                                                                </Icon>
                                                                <Typography
                                                                    variant='h6'
                                                                    component='span'
                                                                    sx={{ color: "#c9d200" }}>
                                                                    Automático:{" "}
                                                                </Typography>
                                                                {content_automatic}
                                                            </Typography>
                                                        </>
                                                    )}

                                                    {action === "ATUALIZACAO_MANUAL" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                title={"Sincronizado manualmente por"}>
                                                                <span
                                                                    style={{
                                                                        color: "#009688",
                                                                        fontWeight: 700,
                                                                    }}>
                                                                    Sincronizado manualmente por:
                                                                </span>{" "}
                                                                {changed_by_name}
                                                            </Typography>
                                                            <Typography fontSize='0.75rem' title='Mensagem automática'>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='warning'
                                                                    className='material-icons-outlined'
                                                                    sx={{ mb: -0.5, mr: 0.5 }}>
                                                                    auto_fix_high
                                                                </Icon>
                                                                <Typography
                                                                    variant='h6'
                                                                    component='span'
                                                                    sx={{ color: "#c9d200" }}>
                                                                    Automático:{" "}
                                                                </Typography>
                                                                {content_automatic}
                                                            </Typography>
                                                        </>
                                                    )}

                                                    {action === "ATUALIZACAO_SISBR" && (
                                                        <>
                                                            <Typography
                                                                variant='h6'
                                                                fontSize='0.9rem'
                                                                component='span'
                                                                title={"Alterado por"}>
                                                                <span
                                                                    style={{
                                                                        color: "#6563d1",
                                                                        fontWeight: 700,
                                                                    }}>
                                                                    Sincronização automática
                                                                </span>{" "}
                                                            </Typography>
                                                            <Typography fontSize='0.75rem' title='Mensagem automática'>
                                                                <Icon
                                                                    fontSize='small'
                                                                    color='warning'
                                                                    className='material-icons-outlined'
                                                                    sx={{ mb: -0.5, mr: 0.5 }}>
                                                                    auto_fix_high
                                                                </Icon>
                                                                <Typography
                                                                    variant='h6'
                                                                    component='span'
                                                                    sx={{ color: "#c9d200" }}>
                                                                    Automático:{" "}
                                                                </Typography>
                                                                {content_automatic}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </TimelineItemContent>
                                            }
                                        />
                                    );
                                },
                            )
                        ) : (
                            <Grid container alignItems='center' justifyContent='center' xs={12} md={12}>
                                <Typography fontSize={16} color='warning'>
                                    Nenhuma informação de histórico da migração encontrada!
                                </Typography>
                            </Grid>
                        )}
                    </Timeline>
                )}
            </Grid>
            <Divider sx={{ marginBottom: 1 }} />
        </BoxModal>
    );
}
