import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { Grid, Icon, Box, Alert, Tooltip, Typography } from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { GridProps } from "@mui/material";
import FormInput from "@/components/FormComponents/FormInput";
import FormSwitchGroup from "@/components/FormComponents/FormSwitchGroup";
import FormDateTimePicker from "@/components/FormComponents/FormDateTimePicker";
import { FormImageUploader } from "@/components/FormComponents/FormImageUploader";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { createBannerFormData, updateBannerFormDataByID, searchOneBannerByID } from "@/services/homepage-config";
import { getBaseURL } from "@/functions/getBaseURL";
import { convertURLToFile } from "@/utils/convertURLToFile";
import moment from "moment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import OpenInBrowserOutlinedIcon from "@mui/icons-material/OpenInBrowserOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";

export type FileProps = {
    id?: number;
    type: string;
    size: number;
    name: string;
};

export type BannerFieldsProps = {
    title: string;
    description?: string | null;
    link_url?: string | null;
    is_external_link: boolean;
    is_active: boolean;
    respect_period: boolean;
    start_date?: Date | null;
    end_date?: Date | null;
    id_image_banner?: number;
    file_image_banner: File;
};

export type EditBannerFieldsProps = {
    title?: string;
    description?: string | null;
    link_url?: string | null;
    is_external_link?: boolean;
    is_active?: boolean;
    respect_period?: boolean;
    start_date?: string | Date | null;
    end_date?: string | Date | null;
    file_image_banner?: File;
};

export type BannerProps = {
    idBanner?: number;
    updateListBanner?: () => void;
} & GridProps;

const validationBannerSchema = Yup.object().shape({
    title: Yup.string()
        .min(3, "O Título deve ter pelo menos 3 letras")
        .max(255, "Excedeu 255 caracteres")
        .required("Título do Banner é obrigatório"),
    description: Yup.string().max(4000, "Excedeu 4000 caracteres").nullable(),
    is_external_link: Yup.boolean().required(),
    link_url: Yup.string().nullable(),
    is_active: Yup.boolean().required(),
    respect_period: Yup.boolean().required(),
    start_date: Yup.date().typeError("Digite uma data válida").nullable(),
    end_date: Yup.date().typeError("Digite uma data válida").nullable(),
    file_image_banner: Yup.mixed<File>().required("Obrigatório"),
});

export function BannersFields({ idBanner, updateListBanner, ...props }: BannerProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | undefined>();
    const [originalFileName, setOriginalFileName] = useState<string | null>(null);
    const [idImageBanner, setIdImageBanner] = useState<number>();

    const { getInfoError, toggleStatusBackdrop, colorBorderSystem } = useGlobal();

    const { device } = useMediaQuery();
    const isMobile = device === "Mobile";

    const {
        handleSubmit,
        resetField,
        setValue,
        watch,
        setError,
        control,
        formState: { errors },
    } = useForm<BannerFieldsProps>({
        resolver: yupResolver(validationBannerSchema),
        defaultValues: {
            is_external_link: false,
            respect_period: false,
            is_active: true,
            start_date: null,
            end_date: null,
        },
    });

    const cleanFile = () => {
        resetField("file_image_banner");
        setFile(undefined);
    };

    const bannerFileWatch = watch("file_image_banner");
    const bannerIsExternalLinkWatch = watch("is_external_link");
    const bannerIsActivekWatch = watch("is_active");
    const bannerRespectPeriodWatch = watch("respect_period");
    const bannerLinkURLWatch = watch("link_url");

    const onSubmitBanner = async (params: BannerFieldsProps) => {
        const { is_external_link, link_url, respect_period, start_date, end_date } = params;

        const isLinkExternalValid = is_external_link
            ? !!link_url?.match(/^(https?:\/\/)?([0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]+)?(\/\S*)?$/) ||
              !!link_url?.match(/^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/\S*)?$/)
            : !!link_url?.startsWith("/");

        if (link_url && !isLinkExternalValid) {
            setError("link_url", {
                type: "manual",
                message: is_external_link
                    ? "O link externo deve começar com o prefixo: 'http://' ou 'https://' e conter um domínio válido. Ex: https://site.com"
                    : "O link interno deve começar com o prefixo: '/' exemplo: /relatorios/catalogo",
            });
            return;
        }

        if (respect_period) {
            if (!start_date) {
                setError("start_date", {
                    type: "manual",
                    message: "Data inicial é obrigatória.",
                });
                return;
            }

            if (!end_date) {
                setError("end_date", {
                    type: "manual",
                    message: "Data final é obrigatória.",
                });
                return;
            }

            if (start_date > end_date) {
                setError("end_date", {
                    type: "manual",
                    message: "Data final deve ser maior ou igual à data inicial.",
                });
                return;
            }
        }

        let refactoring: any = {
            title: params.title,
            description: params?.description || null,
            is_external_link: params.is_external_link,
            respect_period: params.respect_period,
            is_active: params.is_active,
            link_url: params?.link_url || null,
            start_date: respect_period ? params?.start_date || null : null,
            end_date: respect_period ? params?.end_date || null : null,
            file_image_banner: params.file_image_banner,
        };

        if (idBanner && idImageBanner && file instanceof File && file.name !== originalFileName) {
            refactoring = { ...refactoring, id_image_banner: idImageBanner };
        }

        try {
            setLoading(true);

            if (idBanner) {
                const result: { id_image_banner: number } = await updateBannerFormDataByID(idBanner, refactoring);

                if (file instanceof File) {
                    setOriginalFileName(file.name);
                }

                if (result?.id_image_banner) {
                    setIdImageBanner(result.id_image_banner);
                }
            } else {
                await createBannerFormData({
                    ...refactoring,
                });

                resetField("title");
                resetField("description");
                setValue("is_external_link", false);
                setValue("respect_period", false);
                setValue("is_active", true);
                resetField("link_url");
                resetField("start_date");
                resetField("end_date");
                cleanFile();
            }

            updateListBanner?.();
            toast.success(`O Banner foi ${idBanner ? "atualizado" : "criado"} com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setValuesBannerFields = async (id: number) => {
        try {
            toggleStatusBackdrop();
            setLoading(true);

            const {
                title,
                description,
                is_external_link,
                link_url,
                image_url,
                image_name,
                id_image_banner,
                respect_period,
                start_date,
                end_date,
                is_active,
            } = await searchOneBannerByID(id);

            const imageBannerURL = getBaseURL() + image_url;

            if (image_name) {
                const fileFromURL = await convertURLToFile(imageBannerURL, image_name);
                setValue("file_image_banner", fileFromURL);
                setIdImageBanner(id_image_banner);
                setOriginalFileName(image_name);
            }

            setValue("title", title);
            setValue("description", description);
            setValue("is_external_link", is_external_link);
            setValue("respect_period", respect_period);
            setValue("is_active", is_active);
            setValue("link_url", link_url);
            start_date && setValue("start_date", start_date);
            end_date && setValue("end_date", end_date);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
            toggleStatusBackdrop();
        }
    };

    useEffect(() => {
        if (!idBanner && bannerRespectPeriodWatch) {
            const now = moment();
            const start = now.startOf("day").toDate();
            const end = now.endOf("month").toDate();

            setValue("start_date", start);
            setValue("end_date", end);
        }

        if (!bannerRespectPeriodWatch) {
            setValue("start_date", null);
            setValue("end_date", null);
        }
    }, [bannerRespectPeriodWatch, idBanner, setValue]);

    useEffect(() => {
        if (idBanner) {
            setValuesBannerFields(idBanner);
        }
    }, [idBanner]);

    useEffect(() => {
        if (bannerFileWatch instanceof FileList && bannerFileWatch.length > 0) {
            setFile(bannerFileWatch[0]);
        } else if (bannerFileWatch instanceof File) {
            setFile(bannerFileWatch);
        } else {
            setFile(undefined);
        }
    }, [bannerFileWatch]);

    const isLinkExternalValid = bannerIsExternalLinkWatch
        ? !!bannerLinkURLWatch?.match(/^(https?:\/\/)?([0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]+)?(\/\S*)?$/) ||
          !!bannerLinkURLWatch?.match(/^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/\S*)?$/)
        : !!bannerLinkURLWatch?.startsWith("/");

    return (
        <Grid {...props}>
            <Box
                marginInline={2}
                padding={2.5}
                flexDirection='column'
                sx={{ border: `1px dashed ${colorBorderSystem}`, borderRadius: 4 }}
                gap={1}
                mb={2}
                mt={-1}>
                <Grid
                    container
                    component={"form"}
                    direction='row'
                    sx={{ paddingBottom: 2 }}
                    onSubmit={handleSubmit(onSubmitBanner)}>
                    <Grid item xs={12}>
                        <FormImageUploader
                            name='file_image_banner'
                            accept='.GIF,.JPEG,.JPG,.PNG,.BMP,.WEBP'
                            file={file}
                            cleanFile={cleanFile}
                            validateFile={true}
                            maxSizeUnit='MB'
                            maxSize={100}
                            allowedTypes={["image/gif", "image/jpeg", "image/png", "image/webp"]}
                            control={control}
                            error={errors.file_image_banner}
                        />
                    </Grid>

                    <Grid item xs={12} mt={0.25}>
                        <Typography fontSize={10} color='text.secondary'>
                            Para melhor qualidade, use banners com 1500px de largura e 300px de altura.
                        </Typography>
                    </Grid>

                    <Grid container spacing={2} mt={0.35}>
                        <Grid item xs={12} md={12}>
                            <FormInput
                                fullWidth
                                label='Título do Banner'
                                placeholder='Digite o título do card'
                                name='title'
                                type='text'
                                variant='outlined'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <FormInput
                                fullWidth
                                multiline
                                rows={3}
                                label='Descrição'
                                name='description'
                                type='text'
                                variant='outlined'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <Box display='flex' alignItems='center' justifyContent='flex-start'>
                                <FormSwitchGroup
                                    row
                                    title='Configurações do Banner'
                                    options={[
                                        {
                                            name: "is_external_link",
                                            label: !isMobile ? "É Link Externo?" : "Externo?",
                                        },
                                        { name: "respect_period", label: !isMobile ? "É Agendado?" : "Agendado?" },
                                        { name: "is_active", label: "Situação" },
                                    ]}
                                    control={control}
                                />

                                <Tooltip
                                    title={
                                        isLinkExternalValid
                                            ? bannerIsExternalLinkWatch
                                                ? "Link Externo Válido e ✅ Ativo"
                                                : "Link Interno Válido e ✅ Ativo"
                                            : "Link ❌ inválido ou ausente"
                                    }>
                                    {bannerIsExternalLinkWatch ? (
                                        <OpenInNewOutlinedIcon
                                            color={isLinkExternalValid ? "success" : "disabled"}
                                            sx={{ mt: 2.5, fontSize: 32 }}
                                        />
                                    ) : (
                                        <OpenInBrowserOutlinedIcon
                                            color={isLinkExternalValid ? "success" : "disabled"}
                                            sx={{ mt: 2.5, fontSize: 32 }}
                                        />
                                    )}
                                </Tooltip>

                                {bannerRespectPeriodWatch ? (
                                    <Tooltip
                                        title={
                                            <Typography fontSize={12}>
                                                <b>Período ✅ Ativo</b>
                                            </Typography>
                                        }>
                                        <EventAvailableOutlinedIcon
                                            color='success'
                                            sx={{ mt: 2.5, ml: 1, fontSize: 32 }}
                                        />
                                    </Tooltip>
                                ) : (
                                    <Tooltip title='Período ❌ Inativo'>
                                        <EventBusyOutlinedIcon color='disabled' sx={{ mt: 2.5, ml: 1, fontSize: 32 }} />
                                    </Tooltip>
                                )}

                                {bannerIsActivekWatch ? (
                                    <Tooltip title='Banner ✅ Ativo'>
                                        <CheckCircleIcon color='success' sx={{ mt: 2.5, ml: 1, fontSize: 32 }} />
                                    </Tooltip>
                                ) : (
                                    <Tooltip title='Banner ❌ Inativo'>
                                        <CancelIcon color='error' sx={{ mt: 2.5, ml: 1, fontSize: 32 }} />
                                    </Tooltip>
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={bannerRespectPeriodWatch ? 6 : 12}>
                            <FormInput
                                fullWidth
                                label={bannerIsExternalLinkWatch ? "Link Externo" : "Link Interno"}
                                name='link_url'
                                type='text'
                                placeholder={
                                    bannerIsExternalLinkWatch
                                        ? "Ex: https://intranet.sicoobaccredi.com.br/"
                                        : "Ex: /controle-produtividades/produtividade-diaria"
                                }
                                variant='outlined'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        {bannerRespectPeriodWatch && (
                            <>
                                <Grid item xs={12} md={3}>
                                    <FormDateTimePicker
                                        fullWidth
                                        name='start_date'
                                        label='Data Inicial'
                                        variant='outlined'
                                        size='medium'
                                        control={control}
                                        errors={errors}
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <FormDateTimePicker
                                        fullWidth
                                        name='end_date'
                                        label='Data Final'
                                        variant='outlined'
                                        size='medium'
                                        control={control}
                                        errors={errors}
                                    />
                                </Grid>

                                <Grid item xs={12} md={12} mb={-1}>
                                    <Alert
                                        severity='warning'
                                        sx={{ mb: 1.5, fontSize: 12, border: `1px dashed #a1a800` }}>
                                        Este banner está agendado para exibição dentro de um período específico. Ele só
                                        será exibido entre as datas configuradas.
                                    </Alert>
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} md={12} mb={-1}>
                            <LoadingButton
                                fullWidth
                                type='submit'
                                size='large'
                                color={"success"}
                                variant='contained'
                                startIcon={<Icon> {!idBanner ? "add_circle" : "edit_note"}</Icon>}
                                loading={loading}
                                onClick={handleSubmit((params) => onSubmitBanner(params))}
                                sx={{ boxShadow: "none" }}>
                                {!idBanner ? "Criar Banner" : "Editar Banner"}
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Grid>
    );
}
