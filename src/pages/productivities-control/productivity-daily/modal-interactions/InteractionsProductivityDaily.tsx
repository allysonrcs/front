import { useEffect, useRef, useState } from "react";
import { Avatar, Box, Chip, Grid, GridProps, Icon, Paper, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import { useGlobal } from "@/contexts/GlobalContext";
import { useConfirm } from "material-ui-confirm";
import { IPortfoliosUpdateColumn } from "@/types/portfolios";
import { toast } from "react-toastify";
import FormInput from "@/components/FormComponents/FormInput";
import {
    createInteractionProductivityDailyByID,
    IProductivityDailyInteraction,
    searchAllInteractionProductivityDailyByID,
    searchProductivityDailyByID,
} from "@/services/productivities-control";
import { useAuth } from "@/contexts/AuthContext";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import bg_chat_light from "@/assets/images/bg-chat-light.png";
import bg_chat_blue from "@/assets/images/bg_chat-blue.png";
import { formatDate } from "@/functions/date";
import { getBaseURL } from "@/functions/getBaseURL";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import "./TableInteractions.scss";
import { statusWithoutLabelMap } from "../ListRecordsProductivityDaily";

type RowsProps = {
    id: number;
    created_by_id: number;
};

type InteractionProps = {
    content_manual: string;
};

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

type Props = {
    idProductivityDaily?: number;
    updateColumn?: (params: IPortfoliosUpdateColumn) => void;
    handleClose?: () => void;
    rowProps?: RowsProps;
} & GridProps;

const validationSchemaInteraction = Yup.object().shape({
    content_manual: Yup.string().max(1000).required("Obrigatório"),
});

export function InteractionsProductivityDaily({
    idProductivityDaily,
    updateColumn,
    handleClose,
    rowProps,
    ...props
}: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingRefresh, setLoadingRefresh] = useState<boolean>(false);
    const [infoProductivityDaily, setInfoProductivityDaily] = useState<IInfoProductivityDaily>();
    const [listInteractionProductivityDaily, setListInteractionProductivityDaily] = useState<
        IProductivityDailyInteraction[]
    >([]);

    const { getInfoError, theme, toggleStatusBackdrop } = useGlobal();
    const { user } = useAuth();
    const confirm = useConfirm();
    const scrollBottomRef = useRef<HTMLDivElement>(null);

    const {
        control,
        formState: { errors },
        handleSubmit,
        resetField,
        watch,
        clearErrors,
    } = useForm<InteractionProps>({ resolver: yupResolver(validationSchemaInteraction) });

    const contentManualWatch = watch("content_manual");

    const avatar = (name_operator: string, src?: string) => {
        let slices = name_operator.split(" ");
        let letters = "";
        if (slices.length > 1) {
            letters = `${slices[0].charAt(0)}${slices[1].charAt(0)}`.toUpperCase();
        } else {
            letters = `${slices[0].charAt(0)}`.toUpperCase();
        }
        return (
            <Avatar sx={{ width: "30px", height: "30px" }} src={src}>
                {letters}
            </Avatar>
        );
    };

    const onSubmitInteractionProductivityDaily = async (params: InteractionProps) => {
        try {
            setLoading(true);

            if (idProductivityDaily) {
                await createInteractionProductivityDailyByID(idProductivityDaily, {
                    content_manual: params.content_manual,
                });

                await setValuesInteractionProductivityDailyByID(idProductivityDaily);

                updateColumn?.({
                    id: idProductivityDaily,
                    interaction_count_manual: 1,
                });

                toast.success("Interação da Produtividade Diária Criada com sucesso!");

                clearErrors();
                resetField("content_manual");
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

            const dataProductivityDaily = await searchProductivityDailyByID(id_productivity_daily);

            setInfoProductivityDaily(dataProductivityDaily);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setValuesInteractionProductivityDailyByID = async (id_productivity_daily: number) => {
        try {
            setLoading(true);
            setLoadingRefresh(true);

            const dataInteractionProductivityDaily = await searchAllInteractionProductivityDailyByID(
                id_productivity_daily,
                {},
            );

            setListInteractionProductivityDaily(dataInteractionProductivityDaily);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);

            setTimeout(() => {
                setLoadingRefresh(false);
            }, 1750);
        }
    };

    useEffect(() => {
        if (scrollBottomRef.current) {
            scrollBottomRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        }
    }, [listInteractionProductivityDaily]);

    useEffect(() => {
        async function execute() {
            toggleStatusBackdrop();
            setLoading(true);

            if (idProductivityDaily) {
                await setValuesProductivityDailyByID(idProductivityDaily);
                await setValuesInteractionProductivityDailyByID(idProductivityDaily);
            }

            setLoading(false);
            toggleStatusBackdrop();
        }

        execute();
    }, [idProductivityDaily]);

    return (
        <BoxModal
            title={`${infoProductivityDaily?.status && statusWithoutLabelMap[infoProductivityDaily?.status]} | ${infoProductivityDaily?.client_name} | (${listInteractionProductivityDaily?.length}) Interações`}
            handleClose={handleClose}
            width='70%'
            maxHeight='95%'
            overflow={"auto"}
            {...props}>
            <Box component={"form"} mt={-1}>
                <Grid container spacing={2} justifyContent={"center"}>
                    <Grid item xs={12} md={12} mt={-1}>
                        <Grid
                            component={Paper}
                            borderRadius={1.5}
                            height={"56vh"}
                            overflow={"auto"}
                            sx={{
                                backgroundImage: theme === "light" ? `url(${bg_chat_light})` : `url(${bg_chat_blue})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                padding: "32px 16px 16px 16px",
                            }}>
                            {listInteractionProductivityDaily && listInteractionProductivityDaily.length > 0 ? (
                                listInteractionProductivityDaily.map((value) => {
                                    const isMyMessage = user?.id_employee === value.id_employee;
                                    const isRobotMessage = value.name_employee === "Robô";

                                    const imageProfileURL = value?.profile_image
                                        ? getBaseURL() + value.profile_image
                                        : undefined;

                                    return (
                                        <Box
                                            key={value.id}
                                            display='flex'
                                            justifyContent={
                                                isRobotMessage ? "center" : isMyMessage ? "flex-end" : "flex-start"
                                            }
                                            mb={2}>
                                            {!isMyMessage && !isRobotMessage && (
                                                <Box sx={{ mr: 1.2, mt: -2 }}>
                                                    {value.name_employee &&
                                                        avatar(value.name_employee, imageProfileURL ?? undefined)}
                                                </Box>
                                            )}

                                            <Box
                                                sx={{
                                                    maxWidth: "60%",
                                                    p: 1.5,
                                                    position: "relative",
                                                    borderRadius: isMyMessage
                                                        ? "20px 0px 20px 20px"
                                                        : isRobotMessage
                                                          ? "20px"
                                                          : "0px 20px 20px 20px",
                                                    backgroundColor: isMyMessage
                                                        ? "success.light"
                                                        : isRobotMessage
                                                          ? "info.light"
                                                          : "primary.light",
                                                    color: "white",
                                                    wordWrap: "break-word",
                                                    whiteSpace: "pre-line",
                                                    textAlign: isMyMessage
                                                        ? "right"
                                                        : isRobotMessage
                                                          ? "center"
                                                          : "left",
                                                }}>
                                                <Typography variant='body2' fontSize={14}>
                                                    {value.content_manual}
                                                </Typography>
                                                <Typography variant='body2' fontSize={12}>
                                                    {value.content_automatic && (
                                                        <>
                                                            <Chip
                                                                icon={<SmartToyOutlinedIcon color='action' />}
                                                                label={
                                                                    <Box
                                                                        width='100%'
                                                                        whiteSpace={"pre-wrap"}
                                                                        component={"p"}
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: value.content_automatic,
                                                                        }}
                                                                    />
                                                                }
                                                                size={"small"}
                                                                sx={{
                                                                    mt: 1,
                                                                    mr: 0.5,
                                                                    color: "white",
                                                                    height: "auto",
                                                                    padding: 1,
                                                                    "& .MuiChip-label": {
                                                                        display: "block",
                                                                        whiteSpace: "pre-line",
                                                                    },
                                                                }}
                                                                title='Mensagem Automática:'
                                                            />
                                                        </>
                                                    )}
                                                </Typography>
                                                <Typography
                                                    mt={1.5}
                                                    fontWeight={700}
                                                    color={isRobotMessage ? "#7DB61C" : "#003038"}
                                                    fontSize={12}>
                                                    {`${value.name_employee} | ${formatDate(value.created_at, "DD/MM/YYYY HH:mm")}`}
                                                </Typography>
                                            </Box>

                                            {isMyMessage && !isRobotMessage && (
                                                <Box sx={{ ml: 1.2, mt: -2 }}>
                                                    {value.name_employee &&
                                                        avatar(
                                                            value.name_employee,
                                                            user?.url_image_profile ?? undefined,
                                                        )}
                                                </Box>
                                            )}
                                        </Box>
                                    );
                                })
                            ) : (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "100%",
                                    }}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: "20px 20px 20px 20px",
                                            backgroundColor: "info.light",
                                            color: "white",
                                            wordWrap: "break-word",
                                            textAlign: "center",
                                        }}>
                                        <Typography variant='body2' fontSize={14}>
                                            Nenhuma interação encontrada
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            <div ref={scrollBottomRef} />
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <FormInput
                            type='text'
                            name='content_manual'
                            label='Escreva aqui sua mensagem:'
                            multiline
                            fullWidth
                            rows={2}
                            control={control}
                            errors={errors}
                        />
                    </Grid>

                    {idProductivityDaily && (
                        <>
                            <Grid item mb={-1} xs={6} sm={6} md={9} lg={10} xl={10}>
                                <LoadingButton
                                    fullWidth
                                    color='success'
                                    size='large'
                                    variant='contained'
                                    title='Enviar Mensagem'
                                    loading={loading}
                                    disabled={!contentManualWatch}
                                    startIcon={<Icon>send</Icon>}
                                    onClick={async () => {
                                        await confirm({
                                            title: "Confirmação de Envio",
                                            description: (
                                                <Typography>
                                                    Tem certeza de que deseja enviar essa mensagem de interação?
                                                </Typography>
                                            ),
                                        })
                                            .then(() =>
                                                handleSubmit((params) =>
                                                    onSubmitInteractionProductivityDaily(params),
                                                )(),
                                            )
                                            .catch(() => {});
                                    }}>
                                    Enviar
                                </LoadingButton>
                            </Grid>

                            <Grid item mb={-1} xs={6} sm={6} md={3} lg={2} xl={2}>
                                <LoadingButton
                                    fullWidth
                                    title='Atualizar listagem de interações'
                                    color='primary'
                                    size='large'
                                    variant='contained'
                                    loading={loadingRefresh}
                                    disabled={loadingRefresh}
                                    startIcon={<Icon>refresh</Icon>}
                                    onClick={async () => {
                                        await setValuesInteractionProductivityDailyByID(idProductivityDaily);
                                    }}>
                                    Atualizar
                                </LoadingButton>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Box>
        </BoxModal>
    );
}
