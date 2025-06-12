import { useEffect, useRef, useState } from "react";
import {
    Box,
    Grid,
    Icon,
    IconButton,
    ListItemText,
    MenuItem,
    MenuList,
    Modal,
    Skeleton,
    SxProps,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
    changeStatusPortfoliosMigrationValidation,
    ISearchListPortfoliosMigrationValidation,
    searchAllPortfoliosMigrationForValidation,
} from "@/services/portfolios-management";
import { toast } from "react-toastify";
import { formatDate } from "@/functions/date";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { LoadingButton } from "@mui/lab";
import { useConfirm } from "material-ui-confirm";
import FormInput from "@/components/FormComponents/FormInput";
import moment from "moment";
import { useAuth } from "@/contexts/AuthContext";
import { AuditPortfoliosMigration, EditAuditPortfoliosMigrationProps } from "./AuditPortfoliosMigration";
import { NotificationsOffOutlined } from "@mui/icons-material";

type ValidationProps = {
    content_manual?: string | null;
};

type PermissionProps = {
    group: string;
};

const validationSchemaPortfoliosMigration = Yup.object().shape({
    content_manual: Yup.string().nullable(),
});

interface ValidationPortfoliosMigrationProps {
    onHandleModalChange?: () => void;
    updateColumn?: (params: EditAuditPortfoliosMigrationProps) => void;
    accessPermissionGroups: PermissionProps[];
}

export function ValidationPortfoliosMigration({
    onHandleModalChange,
    updateColumn,
    accessPermissionGroups,
}: ValidationPortfoliosMigrationProps) {
    const { getInfoError, theme, toggleStatusBackdrop, colorBorderSystem, redBlur, cyanBlur } = useGlobal();
    const is601pxHeight = useMediaQuery("(max-height:601px)");
    const [listPortfoliosMigrationValidations, setlistPortfoliosMigrationValidations] = useState<
        ISearchListPortfoliosMigrationValidation[]
    >([]);
    const [openModalMigration, setOpenModalMigration] = useState(false);
    const [idPortfolioMigration, setIdPortfolioMigration] = useState<number>();
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingButton, setLoadingButton] = useState<boolean>(false);
    const isFetchingRef = useRef(false);
    const confirm = useConfirm();
    const { user } = useAuth();

    const {
        handleSubmit,
        resetField,
        control,
        formState: { errors },
    } = useForm<ValidationProps>({
        resolver: yupResolver(validationSchemaPortfoliosMigration),
    });

    const sxMenuValidation: SxProps = {
        height: "97vh",
        borderRadius: "16px",
        backgroundColor: theme === "light" ? "#ffff" : "linear-gradient(135deg, #051b1f, #0c2e33)",
        border: theme === "light" ? "1px solid #F0F0F0" : "1px solid #1F3E45",
        backdropFilter: "blur(20px)",
        backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundSize: "50%, 50%",
        backgroundPosition: "right top, left bottom",
    };

    const listItemTextSt: SxProps = {
        width: "inherit",
        "& span": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
    };

    const handleOpenModalMigration = () => {
        setOpenModalMigration((oldValue) => !oldValue);
    };

    const onSubmitAuditPortfoliosMigrationValidation = async (
        id_portfolio_migration: number,
        status_validation: string,
        params: ValidationProps,
    ) => {
        try {
            if (id_portfolio_migration) {
                const payload: any = { status_validation };

                if (status_validation === "REJEITADO") {
                    if (!params?.content_manual || params.content_manual.trim().length === 0) {
                        toast.error("Erro na validação, É necessário preencher um motivo da reprovação!");
                        return;
                    }
                    payload["content_manual"] = params.content_manual;
                }

                resetField("content_manual");

                const dateNow: string = moment().format("YYYY-MM-DD HH:mm:ss");

                await changeStatusPortfoliosMigrationValidation(id_portfolio_migration, {
                    status_validation_destiny: status_validation,
                    content_manual: payload.content_manual || null,
                });

                updateColumn?.({
                    id: id_portfolio_migration,
                    status_validation_destiny: status_validation,
                    manager_destiny_by_name: user?.name || "",
                    date_validation_destiny: dateNow,
                    updated_at: dateNow,
                });

                setlistPortfoliosMigrationValidations((prev) =>
                    prev.filter((role) => role.id !== id_portfolio_migration),
                );

                toast.success(
                    `Registro de Migração de Carteira ${
                        status_validation === "AUTORIZADO" ? "👍 Autorizado" : "👎 Rejeitado"
                    } com sucesso!`,
                );
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const handleRefresh = () => {
        searchListPortfoliosMigrationForValidation(true);
    };

    const searchListPortfoliosMigrationForValidation = async (showBackdrop = false) => {
        if (isFetchingRef.current) return;

        try {
            if (showBackdrop) {
                toggleStatusBackdrop();
                setLoadingButton(true);
            } else {
                setLoading(true);
            }

            isFetchingRef.current = true;

            const listPortfoliosMigrationForValidation = await searchAllPortfoliosMigrationForValidation({
                is_active: true,
                status_finished: "PENDENTE",
                status_validation_destiny: "AGUARDANDO",
            });

            setlistPortfoliosMigrationValidations(listPortfoliosMigrationForValidation);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            isFetchingRef.current = false;
            if (showBackdrop) {
                toggleStatusBackdrop();
                setTimeout(() => {
                    setLoadingButton(false);
                }, 2000);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        searchListPortfoliosMigrationForValidation();
    }, []);

    return (
        <>
            <Grid component={"div"} sx={sxMenuValidation} paddingBlock={2}>
                <Grid container justifyContent='space-between' alignItems='center' xs={12} md={12} ml={2.5} mt={-1.5}>
                    <Typography
                        color='primary'
                        fontSize={14}
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                        }}>
                        <TaskAltIcon color='primary' sx={{ mr: 0.5 }} /> Migrações para validação:
                        <Typography component={"span"} fontSize={14} color='text.primary' ml={1}>
                            {listPortfoliosMigrationValidations?.length || 0}
                        </Typography>
                    </Typography>

                    <IconButton sx={{ mr: 3.5, mb: 1 }} onClick={onHandleModalChange} title='Fechar'>
                        <HighlightOffIcon />
                    </IconButton>
                </Grid>

                {loading ? (
                    <Grid mt={0} sx={{ overflow: "auto", height: "91%", width: "93%" }} container gap={1} margin={2}>
                        {[...Array(5)].map((_, index) => (
                            <Grid item xs={12} key={index}>
                                <Skeleton variant='rounded' height={180} sx={{ borderRadius: 4 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : listPortfoliosMigrationValidations?.length ? (
                    <>
                        <MenuList
                            component={Box}
                            sx={{
                                overflow: "auto",
                                height: "84vh",
                                borderBlock: `1px dashed ${colorBorderSystem}`,
                            }}
                            margin={2}>
                            {listPortfoliosMigrationValidations.map((value, index) => {
                                const {
                                    id,
                                    client_name,
                                    migration_type,
                                    client_agency_name,
                                    client_portfolio_name,
                                    new_client_id_agency,
                                    new_client_agency_name,
                                    new_client_portfolio_name,
                                    created_by_name,
                                    created_at,
                                } = value;

                                return (
                                    <MenuItem
                                        key={index}
                                        sx={{
                                            borderBottom: `1px dashed ${colorBorderSystem}`,
                                            "&:last-child": { borderBottom: "none" },
                                            cursor: "default",
                                        }}>
                                        <Grid container flexDirection='column' margin={1} gap={0.5}>
                                            <ListItemText sx={listItemTextSt}>
                                                <Typography
                                                    component={"span"}
                                                    color={
                                                        accessPermissionGroups.some(
                                                            (value) =>
                                                                value.group === "GROUP_AUDITOR_PORTFOLIOS_MANAGEMENT" ||
                                                                value.group === "GROUP_ADMIN",
                                                        )
                                                            ? migration_type === "ENVIANDO"
                                                                ? "#e24169"
                                                                : "#18da79"
                                                            : new_client_id_agency === user?.agency_sisbr_id
                                                              ? "#18da79"
                                                              : "#e24169"
                                                    }
                                                    fontSize={14}>
                                                    {accessPermissionGroups?.some(
                                                        (value) =>
                                                            value.group === "GROUP_AUDITOR_PORTFOLIOS_MANAGEMENT" ||
                                                            value.group === "GROUP_ADMIN",
                                                    )
                                                        ? migration_type === "ENVIANDO"
                                                            ? "➡️ Enviando"
                                                            : "⬅️ Solicitando"
                                                        : new_client_id_agency === user?.agency_sisbr_id
                                                          ? "⬅️ Recebendo"
                                                          : "➡️ Enviando"}
                                                </Typography>
                                            </ListItemText>
                                            <Typography
                                                variant='body2'
                                                fontSize={13}
                                                color='text.secondary'
                                                width='inherit'
                                                mt={-1}
                                                mb={-1.5}>
                                                <Typography
                                                    component={"span"}
                                                    fontSize={14}
                                                    fontWeight={700}
                                                    color='text.primary'>
                                                    Cooperado:
                                                </Typography>{" "}
                                                {client_name}
                                                <Tooltip title='Visualizar Dados da Migração'>
                                                    <IconButton
                                                        onClick={() => {
                                                            setIdPortfolioMigration(id);
                                                            handleOpenModalMigration();
                                                        }}
                                                        color='success'
                                                        aria-label='Visualizar Cooperado'>
                                                        <RemoveRedEyeOutlinedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Typography>
                                            <Typography
                                                variant='body2'
                                                color='text.secondary'
                                                fontSize={13}
                                                width='inherit'>
                                                <Typography
                                                    component={"span"}
                                                    fontSize={14}
                                                    fontWeight={700}
                                                    color='text.primary'>
                                                    PA Origem:
                                                </Typography>{" "}
                                                {client_agency_name + " | " + client_portfolio_name}
                                                <Typography
                                                    component={"span"}
                                                    fontSize={14}
                                                    fontWeight={700}
                                                    color='#7DB61C'
                                                    ml={1}
                                                    mr={1}>
                                                    ➡
                                                </Typography>
                                                <Typography
                                                    component={"span"}
                                                    fontSize={14}
                                                    fontWeight={700}
                                                    color='text.primary'>
                                                    PA Destino:
                                                </Typography>{" "}
                                                {new_client_agency_name + " | " + new_client_portfolio_name}
                                            </Typography>
                                            <Typography
                                                variant='body2'
                                                color='text.secondary'
                                                fontSize={13}
                                                width='inherit'>
                                                <Typography
                                                    component={"span"}
                                                    fontSize={14}
                                                    fontWeight={700}
                                                    color='text.primary'>
                                                    Solicitante:
                                                </Typography>{" "}
                                                {created_by_name}
                                                <Typography
                                                    component={"span"}
                                                    fontSize={14}
                                                    fontWeight={700}
                                                    color='text.primary'
                                                    ml={1.5}>
                                                    Data Inclusão:
                                                </Typography>{" "}
                                                {formatDate(created_at, "DD/MM/YYYY HH:mm:ss")}
                                            </Typography>

                                            <Typography
                                                mt={0.5}
                                                variant='body2'
                                                color='text.primary'
                                                fontSize={13}
                                                width='inherit'>
                                                <Typography
                                                    component={"span"}
                                                    fontSize={14}
                                                    fontWeight={700}
                                                    color='primary.light'>
                                                    Agência responsável pela aprovação:
                                                </Typography>{" "}
                                                {migration_type === "ENVIANDO"
                                                    ? new_client_agency_name
                                                    : client_agency_name}
                                            </Typography>

                                            <Grid container justifyContent='flex-start' gap={1} mt={1}>
                                                <LoadingButton
                                                    variant='contained'
                                                    color='success'
                                                    size='small'
                                                    startIcon={<Icon>beenhere_outlined_icon</Icon>}
                                                    sx={{
                                                        boxShadow: "none",
                                                        backgroundColor: "#00d26a",
                                                        "&:hover": {
                                                            backgroundColor: "#02ad58",
                                                        },
                                                        zIndex: 9999,
                                                    }}
                                                    onClick={async () => {
                                                        await confirm({
                                                            title: "Confirmação de Autorização",
                                                            description:
                                                                "Tem certeza de que deseja autorizar esta migração de carteira?",
                                                            dialogProps: { sx: { zIndex: 100000 } },
                                                        })
                                                            .then(() =>
                                                                handleSubmit((params) =>
                                                                    onSubmitAuditPortfoliosMigrationValidation(
                                                                        id,
                                                                        "AUTORIZADO",
                                                                        params,
                                                                    ),
                                                                )(),
                                                            )
                                                            .catch(() => resetField("content_manual"));
                                                    }}>
                                                    Autorizar
                                                </LoadingButton>
                                                <LoadingButton
                                                    variant='contained'
                                                    color='error'
                                                    size='small'
                                                    startIcon={<Icon>close_outlined_icon</Icon>}
                                                    sx={{
                                                        boxShadow: "none",
                                                        backgroundColor: "#f92f60",
                                                        "&:hover": {
                                                            backgroundColor: "#d61a49",
                                                        },
                                                        zIndex: 9999,
                                                    }}
                                                    onClick={async () => {
                                                        await confirm({
                                                            title: "Confirmação de Correção",
                                                            description: (
                                                                <>
                                                                    <Typography>
                                                                        Tem certeza de que deseja alterar o status desta
                                                                        migração para Rejeitado?
                                                                    </Typography>
                                                                    <Box mt={2}>
                                                                        <FormInput
                                                                            fullWidth
                                                                            multiline
                                                                            label='Motivo da Rejeição:'
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
                                                            dialogProps: { sx: { zIndex: 100000 } },
                                                        })
                                                            .then(() => {
                                                                handleSubmit((params) =>
                                                                    onSubmitAuditPortfoliosMigrationValidation(
                                                                        id,
                                                                        "REJEITADO",
                                                                        params,
                                                                    ),
                                                                )();
                                                            })
                                                            .catch(() => resetField("content_manual"));
                                                    }}>
                                                    Rejeitar
                                                </LoadingButton>
                                            </Grid>
                                        </Grid>
                                    </MenuItem>
                                );
                            })}
                        </MenuList>
                        <LoadingButton
                            fullWidth
                            variant='text'
                            color='primary'
                            size='small'
                            loading={loadingButton}
                            onClick={handleRefresh}
                            sx={{ height: "5.5vh", borderRadius: "0px 0px 16px 16px" }}
                            startIcon={<Icon>cached_outlined_icon</Icon>}>
                            Atualizar
                        </LoadingButton>
                    </>
                ) : (
                    <Grid container flexDirection='column' justifyContent='space-between' padding={4} height='97vh'>
                        <Grid item>
                            <Typography
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    color: "#fff",
                                    background: "linear-gradient(90deg, #00AE9D 35%, #00796d 100%)",
                                    textAlign: "center",
                                    borderRadius: "30px",
                                    padding: 1,
                                    marginBottom: 2,
                                }}>
                                Nenhuma migração para validar no momento
                            </Typography>
                        </Grid>

                        <Grid
                            item
                            container
                            alignItems='center'
                            justifyContent='center'
                            sx={{
                                flexGrow: 1,
                                ...(is601pxHeight && {
                                    display: "none",
                                }),
                            }}>
                            <NotificationsOffOutlined color='primary' sx={{ fontSize: 150 }} />
                        </Grid>
                        {is601pxHeight && (
                            <Grid
                                item
                                container
                                alignItems='center'
                                justifyContent='center'
                                sx={{
                                    flexGrow: 1,
                                }}>
                                <NotificationsOffOutlined color='primary' sx={{ fontSize: 150 }} />
                            </Grid>
                        )}
                    </Grid>
                )}
            </Grid>

            <Modal sx={{ zIndex: 2000 }} open={openModalMigration}>
                <Box>
                    <AuditPortfoliosMigration
                        idPortfoliosMigration={idPortfolioMigration}
                        handleClose={handleOpenModalMigration}
                    />
                </Box>
            </Modal>
        </>
    );
}
