import { ReactElement, useEffect, useState } from "react";
import {
    Alert,
    Avatar,
    Badge,
    Box,
    BoxProps,
    Button,
    Collapse,
    Divider,
    Grid,
    Icon,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import * as FileInput from "@/components/FileInput";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import FormInput from "@/components/FormComponents/FormInput";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormCheckbox from "@/components/FormComponents/FormCheckbox";
import FormDateTimePicker from "@/components/FormComponents/FormDateTimePicker";
import BadgeAvatars from "@/components/AvatarWithBadge/AvatarWithBadge";
import { FormImageUploader } from "@/components/FormComponents/FormImageUploader";
import { formatDate } from "@/functions/date";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import NotificationImportantOutlinedIcon from "@mui/icons-material/NotificationImportantOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import OpenInBrowserOutlinedIcon from "@mui/icons-material/OpenInBrowserOutlined";
import FormSwitchGroup from "@/components/FormComponents/FormSwitchGroup";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import TripOriginOutlinedIcon from "@mui/icons-material/TripOriginOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import WorkspacesOutlinedIcon from "@mui/icons-material/WorkspacesOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import NoAccountsOutlinedIcon from "@mui/icons-material/NoAccountsOutlined";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import DoNotDisturbOffOutlinedIcon from "@mui/icons-material/DoNotDisturbOffOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { searchAutoCompletePortfolios } from "@/services/portfolios";
import { searchAutocompleteSector } from "@/services/sectors";
import { searchAutoCompleteEmployees } from "@/services/employees";
import favIconSingColor from "../../assets/images/sing-icone-colorido.ico";
import favIconSingWhite from "../../assets/images/sing-icone-branco.ico";
import { CreateNotificationFieldsProps, createNotificationFormData } from "@/services/notifications";
import { LoadingButton } from "@mui/lab";

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteString = {
    id: string;
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
    id_agency_sisbr?: number | null;
};

type ListSectors = {
    id: number;
    label: string;
    id_agency_sisbr?: number | null;
};

export type NotificationFieldsProps = {
    title: string;
    subtitle?: string | null;
    content?: string | null;
    file_image_cover?: File | null;
    is_active: boolean;
    is_external_link: boolean;
    link_url?: string | null;
    origin: AutoCompleteString;
    module?: string | null;
    module_icon?: string | null;
    id_cover_image?: number;
    is_all?: boolean | null;
    is_agency?: boolean | null;
    is_portfolio?: boolean | null;
    is_sector?: boolean | null;
    is_users?: boolean | null;
    is_scheduled: boolean;
    scheduled_at?: Date | null;
    expires_at?: Date | null;
};

export type NotificationProps = {
    idNotification?: number;
    updateListNotification?: () => void;
} & BoxProps;

type AgencyMap = { [key: number]: string | undefined };

const validationNotificationSchema = Yup.object().shape({
    title: Yup.string()
        .min(3, "O Título deve ter pelo menos 3 letras")
        .max(255, "Excedeu 255 caracteres")
        .required("Título da Notificação é obrigatório"),
    subtitle: Yup.string()
        .min(3, "O Título deve ter pelo menos 3 letras")
        .max(255, "Excedeu 255 caracteres")
        .nullable(),
    content: Yup.string().max(10000, "Excedeu 10000 caracteres").nullable(),
    file_image_cover: Yup.mixed<File>().nullable(),
    is_active: Yup.boolean().required(),
    is_external_link: Yup.boolean().required(),
    link_url: Yup.string().nullable(),
    origin: Yup.object()
        .shape({
            id: Yup.string().required("ID de Origem é obrigatório"),
            label: Yup.string().required("Label de Origem é obrigatório"),
        })
        .required("Origem é obrigatório!"),
    module: Yup.string().nullable(),
    module_icon: Yup.string().nullable(),
    is_all: Yup.boolean().nullable(),
    is_agency: Yup.boolean().nullable(),
    is_portfolio: Yup.boolean().nullable(),
    is_sector: Yup.boolean().nullable(),
    is_users: Yup.boolean().nullable(),
    is_scheduled: Yup.boolean().required(),
    scheduled_at: Yup.date().typeError("Digite uma data válida").nullable(),
    expires_at: Yup.date().typeError("Digite uma data válida").nullable(),
});

export function NotificationsFields({ idNotification, updateListNotification, ...props }: NotificationProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | undefined>();
    const [feedbackText, setFeedbackText] = useState<string>("");
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [autoCompleteAgencies, setAutoCompleteAgencies] = useState<ListAgencies[]>([]);
    const [autoCompletePortfolios, setAutoCompletePortfolios] = useState<ListPortfolios[]>([]);
    const [autoCompleteSectors, setAutoCompleteSectors] = useState<ListSectors[]>([]);
    const [autoCompleteEmployees, setAutoCompleteEmployees] = useState<AutoCompleteNumber[]>([]);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [resetFilesTrigger, setResetFilesTrigger] = useState(0);

    const {
        theme: themeContext,
        isSidebarOpen,
        colorBoxShadowSystem,
        colorBorderSystem,
        colorBackgroundSystem,
        getInfoError,
    } = useGlobal();

    const { user } = useAuth();
    const theme = useTheme();
    const { device } = useMediaQuery();

    const isThemeLight = themeContext === "light";
    const isMobile = device === "Mobile";
    const MAX_CHARS = 2000;

    const {
        handleSubmit,
        resetField,
        setValue,
        setError,
        watch,
        control,
        formState: { errors },
    } = useForm<NotificationFieldsProps>({
        resolver: yupResolver(validationNotificationSchema),
        defaultValues: {
            is_active: true,
            is_external_link: false,
            origin: { id: "sistema", label: "Sistema" },
            is_scheduled: false,
            scheduled_at: null,
            expires_at: null,
            is_all: true,
            is_agency: false,
            is_portfolio: false,
            is_sector: false,
            is_users: false,
        },
    });

    const titleWatch = watch("title");
    const subTitleWatch = watch("subtitle");
    const contentWatch = watch("content");
    const coverFileWatch = watch("file_image_cover");
    const isActiveWatch = watch("is_active");
    const isExternalLinkWatch = watch("is_external_link");
    const LinkURLWatch = watch("link_url");
    const originWatch = watch("origin");
    const moduleWatch = watch("module");
    const moduleIconWatch = watch("module_icon");
    const isScheduledWatch = watch("is_scheduled");
    const dateScheduledAtWatch = watch("scheduled_at");
    const dateExpiresAtWatch = watch("expires_at");
    const switchIsAllWatch = watch("is_all");
    const switchIsAgenciesWatch = watch("is_agency");
    const switchIsPortfoliosWatch = watch("is_portfolio");
    const switchIsSectorsWatch = watch("is_sector");
    const switchIsUsersWatch = watch("is_users");

    const arrayTypePriority: { label: string; icon: ReactElement; color: string }[] = [
        { label: "Alta", icon: <NewReleasesOutlinedIcon />, color: isThemeLight ? "#e00e0e" : "#FB8382" },
        { label: "Média", icon: <NotificationImportantOutlinedIcon />, color: isThemeLight ? "#f5ce33" : "#FDE68C" },
        { label: "Baixa", icon: <InfoOutlinedIcon />, color: isThemeLight ? "#13B0EF" : "#66ACD6" },
    ];

    const isLinkExternalValid = isExternalLinkWatch
        ? !!LinkURLWatch?.match(/^(https?:\/\/)?([0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]+)?(\/\S*)?$/) ||
          !!LinkURLWatch?.match(/^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/\S*)?$/)
        : !!LinkURLWatch?.startsWith("/");

    const originColor =
        originWatch?.id === "sistema" ? "#00AD9C" : originWatch?.id === "usuario" ? "#13B0EF" : "#c5c5c5";

    const handleOptionToggle = (label: string) => {
        const isSelected = selectedOptions.includes(label);
        const nextSelection = isSelected
            ? selectedOptions.filter((item) => item !== label)
            : selectedOptions.length < 3
              ? [...selectedOptions, label]
              : selectedOptions;
        setSelectedOptions(nextSelection);
    };

    const clearFields = () => {
        resetField("title");
        resetField("subtitle");
        resetField("content");
        resetField("is_active");
        resetField("is_external_link");
        resetField("link_url");
        resetField("origin");
        resetField("module");
        resetField("module_icon");
        resetField("is_all");
        resetField("is_agency");
        resetField("is_portfolio");
        resetField("is_sector");
        resetField("is_users");
        resetField("is_scheduled");
        resetField("scheduled_at");
        resetField("expires_at");
        setSelectedOptions(["Baixa"]);
        cleanFile();

        setAttachments([]);
        setResetFilesTrigger((prev) => prev + 1);
    };

    const onSubmit = async (params: NotificationFieldsProps) => {
        const { is_external_link, link_url, is_scheduled, scheduled_at, expires_at } = params;

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

        if (is_scheduled) {
            if (!scheduled_at) {
                setError("scheduled_at", {
                    type: "manual",
                    message: "Data inicial é obrigatória.",
                });
                return;
            }

            if (expires_at) {
                if (scheduled_at > expires_at) {
                    setError("expires_at", {
                        type: "manual",
                        message: "Data final deve ser maior ou igual à data inicial.",
                    });
                    return;
                }
            }
        }

        const payload: CreateNotificationFieldsProps = {
            title: params.title,
            subtitle: params.subtitle ?? null,
            content: params.content ?? null,
            file_image_cover: file ?? null,
            is_active: params.is_active ?? false,
            priority_level: selectedOptions[0],
            is_external_link: params.is_external_link ?? false,
            link_url: params.link_url ?? null,
            origin: params.origin.id,
            module: params.module ?? null,
            module_icon: params.module_icon ?? null,
            is_all: params.is_all ?? false,
            is_agency: params.is_agency ?? false,
            is_portfolio: params.is_portfolio ?? false,
            is_sector: params.is_sector ?? false,
            is_users: params.is_users ?? false,
            is_scheduled: params.is_scheduled ?? false,
            scheduled_at: params.scheduled_at ?? null,
            expires_at: params.expires_at ?? null,
            attachments: attachments ?? null,
        };

        try {
            setLoading(true);

            // if (idNotification) {
            // const result: { id_image_banner: number } = await updateBannerFormDataByID(idBanner, refactoring);
            // if (file instanceof File) {
            //     setOriginalFileName(file.name);
            // }
            // if (result?.id_image_banner) {
            //     setIdImageBanner(result.id_image_banner);
            // }
            // } else {

            // }

            await createNotificationFormData({
                ...payload,
            });

            clearFields();

            toast.success(`A Notificação foi ${idNotification ? "atualizada" : "criada"} com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= MAX_CHARS) {
            setFeedbackText(value);
        }
    };

    const cleanFile = () => {
        resetField("file_image_cover");
        setFile(undefined);
    };

    const searchAutoCompletes = async () => {
        try {
            const [dateAgencies, datePortfolios, dateSectors, dateEmployees] = await Promise.all([
                searchAutocompleteAgencies({
                    is_active: true,
                    with_restrict_agency: false,
                    with_agency_sisbr_id: true,
                }),
                searchAutoCompletePortfolios({
                    is_active: true,
                    with_restrict_agency: false,
                    has_agency_sisbr_id: true,
                }),
                searchAutocompleteSector({ is_active: true, has_agency_sisbr_id: true }),
                searchAutoCompleteEmployees({
                    is_active: true,
                }),
            ]);

            const mapAgencies = dateAgencies.map(({ id, abbreviation, agency_sisbr_id }) => ({
                id,
                label: abbreviation,
                agency_sisbr_id,
            }));

            const mapAgency: AgencyMap = dateAgencies.reduce((acc, { abbreviation, agency_sisbr_id }) => {
                if (agency_sisbr_id != null) {
                    acc[agency_sisbr_id] = abbreviation;
                }
                return acc;
            }, {} as AgencyMap);

            const mapPortfolios = datePortfolios
                .map(({ id, name, ref_id, id_agency_sisbr }) => ({
                    id,
                    label: `${id_agency_sisbr != null && mapAgency[id_agency_sisbr] ? mapAgency[id_agency_sisbr] : id_agency_sisbr} ➖ ${name}`,
                    id_ref: ref_id,
                    id_agency_sisbr,
                }))
                .sort((a, b) => {
                    if (a.id_agency_sisbr == null && b.id_agency_sisbr == null) return 0;
                    if (a.id_agency_sisbr == null) return 1;
                    if (b.id_agency_sisbr == null) return -1;

                    if (a.id_agency_sisbr < b.id_agency_sisbr) return -1;
                    if (a.id_agency_sisbr > b.id_agency_sisbr) return 1;

                    return a.id - b.id;
                });

            const mapSectors = dateSectors
                .map(({ id, name, id_agency_sisbr }) => ({
                    id,
                    label: `${id_agency_sisbr != null && mapAgency[id_agency_sisbr] ? mapAgency[id_agency_sisbr] : id_agency_sisbr} ➖ ${name}`,
                    id_agency_sisbr,
                }))
                .sort((a, b) => {
                    if (a.id_agency_sisbr == null && b.id_agency_sisbr == null) return 0;
                    if (a.id_agency_sisbr == null) return 1;
                    if (b.id_agency_sisbr == null) return -1;

                    if (a.id_agency_sisbr < b.id_agency_sisbr) return -1;
                    if (a.id_agency_sisbr > b.id_agency_sisbr) return 1;

                    return a.id - b.id;
                });

            const mapEmployees = dateEmployees.map(({ id, name }) => {
                return { id: id, label: name };
            });

            setAutoCompleteAgencies(mapAgencies);
            setAutoCompletePortfolios(mapPortfolios);
            setAutoCompleteSectors(mapSectors);
            setAutoCompleteEmployees(mapEmployees);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        if (coverFileWatch instanceof FileList && coverFileWatch.length > 0) {
            setFile(coverFileWatch[0]);
        } else if (coverFileWatch instanceof File) {
            setFile(coverFileWatch);
        } else {
            setFile(undefined);
        }
    }, [coverFileWatch]);

    useEffect(() => {
        if (!idNotification) {
            setSelectedOptions(["Baixa"]);
            searchAutoCompletes();
        }
    }, [idNotification]);

    useEffect(() => {
        if (switchIsAllWatch) {
            setValue("is_all", true);
            setValue("is_agency", false);
            setValue("is_portfolio", false);
            setValue("is_sector", false);
            setValue("is_users", false);
        }
    }, [switchIsAllWatch]);

    const isValidCheckBox =
        !switchIsAllWatch &&
        !switchIsAgenciesWatch &&
        !switchIsPortfoliosWatch &&
        !switchIsSectorsWatch &&
        !switchIsUsersWatch;

    const isValidStatusSend = !titleWatch || titleWatch.length < 3 || isValidCheckBox;

    const isAllChecked = !!switchIsAllWatch;

    const isAnyOtherChecked =
        !!switchIsAgenciesWatch || !!switchIsPortfoliosWatch || !!switchIsSectorsWatch || !!switchIsUsersWatch;

    const sxPropsAllCheckbox = {
        cursor: isAnyOtherChecked ? "not-allowed" : "pointer",
        "& .MuiCheckbox-root": {
            color: isAnyOtherChecked ? (isThemeLight ? "#e7e7e7" : "#444") : "#b0b0b0",
        },
        "& .Mui-checked": {
            color: "#13B0EF",
        },
        "&.Mui-disabled .MuiCheckbox-root": {
            color: "#ccc",
            opacity: 0.5,
        },
        "& .MuiFormControlLabel-label": {
            color: isAnyOtherChecked ? "#b0b0b0" : "inherit",
        },
    };

    const sxPropsOthers = {
        cursor: isAllChecked ? "not-allowed" : "pointer",
        "& .MuiCheckbox-root": {
            color: isAllChecked ? (isThemeLight ? "#e7e7e7" : "#444") : "#b0b0b0",
        },
        "& .Mui-checked": {
            color: "#13B0EF",
        },
        "&.Mui-disabled .MuiCheckbox-root": {
            color: "#ccc",
            opacity: 0.5,
        },
        "& .MuiFormControlLabel-label": {
            color: isAllChecked ? "#b0b0b0" : "inherit",
        },
    };

    return (
        <Grid item marginInline={!isSidebarOpen ? 4 : 2}>
            <Grid container xs={12} md={12} mb={3} mt={2}>
                <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
                    <Typography color='text.secondary' fontWeight='bold' fontSize={20}>
                        Criar Notificação
                    </Typography>

                    <LoadingButton
                        type='submit'
                        size='medium'
                        variant='contained'
                        loading={loading}
                        sx={{
                            boxShadow: "none",
                            backgroundColor: "#13B0EF",
                            "&:hover": {
                                backgroundColor: "#078bbe",
                                boxShadow: "none",
                            },
                        }}
                        startIcon={<SendOutlinedIcon />}
                        onClick={handleSubmit(onSubmit)}>
                        <Typography fontSize={12} fontWeight='bold'>
                            Enviar Agora
                        </Typography>
                    </LoadingButton>
                </Box>
            </Grid>

            <Box component={"form"} onSubmit={handleSubmit(onSubmit)} {...props}>
                <Grid container spacing={!isSidebarOpen ? 3 : 2}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={8}>
                        <Grid
                            item
                            xs={12}
                            p={3}
                            flexDirection='column'
                            sx={{
                                borderRadius: "16px",
                                border: `1px solid ${colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Grid item xs={12} md={12}>
                                <Typography variant='h5' fontWeight='bold'>
                                    Detalhes da Notificação
                                </Typography>
                                <Typography
                                    textAlign='left'
                                    variant='body2'
                                    fontSize={12}
                                    color='text.secondary'
                                    mt={1}>
                                    Preencha os dados principais da notificação. O título e o conteúdo serão exibidos
                                    aos usuários ao receberem a mensagem. Você também pode adicionar um subtítulo e
                                    anexar uma imagem para tornar a notificação mais atrativa.
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={12} mt={3}>
                                <FormInput
                                    fullWidth
                                    label='Título da Notificação'
                                    placeholder='Digite o título do card'
                                    name='title'
                                    type='text'
                                    variant='outlined'
                                    required
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid item xs={12} md={12} mt={3}>
                                <FormInput
                                    fullWidth
                                    label='Subtítulo da Notificação (Opcional)'
                                    placeholder='Digite o subtítulo do card'
                                    name='subtitle'
                                    type='text'
                                    variant='outlined'
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid item xs={12} md={12} mt={3}>
                                <FormInput
                                    fullWidth
                                    multiline
                                    minRows={5}
                                    maxRows={25}
                                    label='Conteúdo da Notificação'
                                    name='content'
                                    type='text'
                                    variant='outlined'
                                    value={feedbackText}
                                    onChange={handleFeedbackChange}
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <Typography textAlign='right' variant='caption' color='text.secondary'>
                                    {MAX_CHARS - feedbackText.length} caracteres restantes
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={12} mt={2}>
                                <FormImageUploader
                                    name='file_image_cover'
                                    accept='.GIF,.JPEG,.JPG,.PNG,.BMP,.WEBP'
                                    file={file}
                                    cleanFile={cleanFile}
                                    validateFile={true}
                                    maxSizeUnit='MB'
                                    maxSize={100}
                                    allowedTypes={["image/gif", "image/jpeg", "image/png", "image/webp"]}
                                    control={control}
                                    error={errors.file_image_cover}
                                />
                            </Grid>

                            <Grid item xs={12} md={12} mt={2}>
                                <FormSwitchGroup
                                    row
                                    title='Situação da Notificação'
                                    options={[
                                        {
                                            name: "is_active",
                                            label: isActiveWatch ? "Ativo" : "Inativo",
                                        },
                                    ]}
                                    control={control}
                                />
                            </Grid>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            p={3}
                            mt={2}
                            sx={{
                                borderRadius: "16px",
                                border: `1px solid ${colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Grid item xs={12} md={12}>
                                <Typography variant='h5' fontWeight='bold'>
                                    Anexos
                                </Typography>
                                <Typography
                                    textAlign='left'
                                    variant='body2'
                                    fontSize={12}
                                    color='text.secondary'
                                    mt={1}>
                                    Anexe aqui os seus arquivos (documentos, imagens, áudios ou vídeos) de até 100 MB
                                    para esta notificação. Você pode clicar para selecionar ou arrastar diretamente para
                                    o campo acima.
                                </Typography>

                                <Grid item xs={12} mt={2}>
                                    <FileInput.Root
                                        allowedTypes={[
                                            "ai",
                                            "eps",
                                            "mp3",
                                            "wav",
                                            "mp4",
                                            "mov",
                                            "jpg",
                                            "jpeg",
                                            "gif",
                                            "png",
                                            "svg",
                                            "pdf",
                                            "doc",
                                            "docx",
                                            "odt",
                                            "rtf",
                                            "txt",
                                            "xls",
                                            "xlsx",
                                            "csv",
                                            "ppt",
                                            "pptx",
                                            "psd",
                                            "zip",
                                            "rar",
                                            "tar",
                                            "gz",
                                        ]}
                                        maxSizeBytes={100 * 1024 * 1024}
                                        onFilesChange={setAttachments}
                                        resetTrigger={resetFilesTrigger}>
                                        <FileInput.Trigger />
                                        <FileInput.FileList />
                                        <FileInput.Control multiple />
                                    </FileInput.Root>
                                </Grid>

                                {attachments.length > 1 && (
                                    <Grid item xs={12} textAlign={"right"} mt={2}>
                                        <Button
                                            title='Remover todos os anexos'
                                            size='medium'
                                            sx={{
                                                boxShadow: "none",
                                                backgroundColor: isThemeLight ? "#ffffff" : "#142527",
                                                border: `1px solid ${isThemeLight ? colorBorderSystem : "#405b5f"}`,
                                                "&:hover": {
                                                    backgroundColor: isThemeLight ? "#f1f1f1" : "#405b5f",
                                                    boxShadow: "none",
                                                },
                                            }}
                                            variant='contained'
                                            startIcon={
                                                <DeleteSweepOutlinedIcon
                                                    sx={{ color: isThemeLight ? "text.secondary" : "#96afb3" }}
                                                />
                                            }
                                            onClick={() => {
                                                setAttachments([]);
                                                setResetFilesTrigger((prev) => prev + 1);
                                            }}>
                                            <Typography
                                                fontSize={12}
                                                fontWeight='bold'
                                                color={isThemeLight ? "text.secondary" : "#96afb3"}>
                                                Remover Anexos
                                            </Typography>
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            p={3}
                            mt={2}
                            sx={{
                                borderRadius: "16px",
                                border: `1px solid ${colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Grid item xs={12} md={12}>
                                <Typography variant='h5' fontWeight='bold'>
                                    Prioridade
                                </Typography>
                                <Typography
                                    textAlign='left'
                                    variant='body2'
                                    fontSize={12}
                                    color='text.secondary'
                                    mt={1}>
                                    Defina o nível de prioridade da notificação. Notificações de alta prioridade ganham
                                    mais destaque visual e podem ter maior relevância para o destinatário.
                                </Typography>

                                <Grid container spacing={2} justifyContent='center' mt={1}>
                                    {arrayTypePriority.map(({ label, icon, color }) => {
                                        const isSelected = selectedOptions.includes(label);
                                        const reachedLimit = selectedOptions.length === 1;
                                        const isDisabled = !isSelected && reachedLimit;

                                        return (
                                            <Grid item xs={4} sm={6} md={4} key={label} overflow='hidden'>
                                                <Box
                                                    onClick={() => !isDisabled && handleOptionToggle(label)}
                                                    sx={{
                                                        width: "100%",
                                                        height: "70px",
                                                        border: `2px solid ${isSelected ? color : theme.palette.divider}`,
                                                        color: `${isSelected ? color : color}`,
                                                        borderRadius: 2,
                                                        padding: 1,
                                                        opacity: isDisabled ? 0.4 : 1,
                                                        transition: "all 0.2s",
                                                        cursor: isDisabled ? "not-allowed" : "pointer",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        textAlign: "center",
                                                        gap: 1,
                                                    }}>
                                                    {icon}
                                                    <Typography fontSize={14} mt={-0.5}>
                                                        {label}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            p={3}
                            mt={2}
                            sx={{
                                borderRadius: "16px",
                                border: `1px solid ${colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Grid item xs={12} md={12}>
                                <Typography variant='h5' fontWeight='bold'>
                                    Links
                                </Typography>
                                <Typography
                                    textAlign='left'
                                    variant='body2'
                                    fontSize={12}
                                    color='text.secondary'
                                    mt={1}>
                                    Caso deseje redirecionar o usuário ao clicar na notificação, informe o link de
                                    destino. Você pode indicar se o link é interno (dentro do sistema) ou externo (ex:
                                    outro site).
                                </Typography>

                                <Grid item xs={12} mt={1}>
                                    <FormSwitchGroup
                                        row
                                        title=''
                                        options={[{ name: "is_external_link", label: "É Link Externo?" }]}
                                        control={control}
                                    />
                                </Grid>

                                <Grid item xs={12} md={12} mt={1.5}>
                                    <FormInput
                                        fullWidth
                                        label={isExternalLinkWatch ? "Link Externo" : "Link Interno"}
                                        name='link_url'
                                        type='text'
                                        placeholder={
                                            isExternalLinkWatch
                                                ? "Ex: https://intranet.sicoobaccredi.com.br/"
                                                : "Ex: /controle-produtividades/produtividade-diaria"
                                        }
                                        variant='outlined'
                                        control={control}
                                        errors={errors}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            p={3}
                            mt={2}
                            sx={{
                                borderRadius: "16px",
                                border: `1px solid ${colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Grid item container xs={12} md={12} spacing={2}>
                                <Grid item xs={12} md={12}>
                                    <Typography variant='h5' fontWeight='bold'>
                                        Origem
                                    </Typography>
                                    <Typography
                                        textAlign='left'
                                        variant='body2'
                                        fontSize={12}
                                        color='text.secondary'
                                        mt={1}
                                        mb={1}>
                                        Defina a origem da notificação. Você pode escolher entre uma mensagem disparada
                                        automaticamente pelo sistema ou manualmente por um usuário autorizado.
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={12}>
                                    <FormAutocomplete
                                        name='origin'
                                        label='Selecione uma Origem'
                                        variant='outlined'
                                        required
                                        disableClearable
                                        control={control}
                                        errors={errors}
                                        options={[
                                            { id: "sistema", label: "Sistema" },
                                            { id: "usuario", label: "Usuário" },
                                        ]}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            p={3}
                            mt={2}
                            sx={{
                                borderRadius: "16px",
                                border: `1px solid ${colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Grid item container xs={12} md={12} spacing={2}>
                                <Grid item xs={12} md={12}>
                                    <Typography variant='h5' fontWeight='bold'>
                                        Módulo
                                    </Typography>
                                    <Typography
                                        textAlign='left'
                                        variant='body2'
                                        fontSize={12}
                                        color='text.secondary'
                                        mt={1}
                                        mb={1}>
                                        Identifique de qual módulo ou funcionalidade do sistema esta notificação está
                                        relacionada. Isso auxilia o usuário a reconhecer a origem e contexto da
                                        mensagem.
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <FormInput
                                        fullWidth
                                        label='Módulo'
                                        name='module'
                                        type='text'
                                        variant='outlined'
                                        control={control}
                                        errors={errors}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <FormInput
                                        fullWidth
                                        label='Icone do Módulo'
                                        name='module_icon'
                                        type='text'
                                        variant='outlined'
                                        control={control}
                                        errors={errors}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            p={3}
                            mt={2}
                            sx={{
                                borderRadius: "16px",
                                border: `1px solid ${isValidCheckBox ? "#b91c1c" : colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Typography
                                variant='h5'
                                fontWeight='bold'
                                color={isValidCheckBox ? "#dc2626" : "text.primary"}>
                                Destinatários
                            </Typography>
                            <Typography textAlign='left' variant='body2' fontSize={12} color='text.secondary' mt={1}>
                                Selecione o público que deve receber esta notificação. É possível segmentar por tipo de
                                destino como agência, carteira, setor ou usuários específicos. A contagem total será
                                calculada automaticamente.
                            </Typography>

                            <Grid container direction='column' mt={1}>
                                <FormCheckbox
                                    name='is_all'
                                    label='Todos'
                                    control={control}
                                    color='primary'
                                    disabled={
                                        !!switchIsAgenciesWatch ||
                                        !!switchIsPortfoliosWatch ||
                                        !!switchIsSectorsWatch ||
                                        !!switchIsUsersWatch
                                    }
                                    sxProps={sxPropsAllCheckbox}
                                />

                                <FormCheckbox
                                    name='is_agency'
                                    label='Agências'
                                    control={control}
                                    color='primary'
                                    disabled={!!switchIsAllWatch}
                                    sxProps={sxPropsOthers}
                                />

                                {switchIsAgenciesWatch && (
                                    <Grid item xs={12} marginBlock={1}>
                                        <FormAutocompleteMultiple
                                            fullWidth
                                            name='agencies'
                                            label='Selecionar Agências'
                                            variant='outlined'
                                            size='medium'
                                            disableCloseOnSelect
                                            control={control}
                                            errors={errors}
                                            options={autoCompleteAgencies}
                                        />
                                    </Grid>
                                )}

                                <FormCheckbox
                                    name='is_portfolio'
                                    label='Carteiras'
                                    color='primary'
                                    control={control}
                                    disabled={!!switchIsAllWatch}
                                    sxProps={sxPropsOthers}
                                />

                                {switchIsPortfoliosWatch && (
                                    <Grid item xs={12} marginBlock={1}>
                                        <FormAutocompleteMultiple
                                            fullWidth
                                            name='portfolios'
                                            label='Selecionar Carteiras'
                                            variant='outlined'
                                            size='medium'
                                            disableCloseOnSelect
                                            control={control}
                                            errors={errors}
                                            options={autoCompletePortfolios}
                                        />
                                    </Grid>
                                )}

                                <FormCheckbox
                                    name='is_sector'
                                    label='Setores'
                                    color='primary'
                                    control={control}
                                    disabled={!!switchIsAllWatch}
                                    sxProps={sxPropsOthers}
                                />

                                {switchIsSectorsWatch && (
                                    <Grid item xs={12} marginBlock={1}>
                                        <FormAutocompleteMultiple
                                            fullWidth
                                            name='sectors'
                                            label='Selecionar Setores'
                                            variant='outlined'
                                            size='medium'
                                            disableCloseOnSelect
                                            control={control}
                                            errors={errors}
                                            options={autoCompleteSectors}
                                        />
                                    </Grid>
                                )}

                                <FormCheckbox
                                    name='is_users'
                                    label='Usuários'
                                    color='primary'
                                    control={control}
                                    disabled={!!switchIsAllWatch}
                                    sxProps={sxPropsOthers}
                                />

                                {switchIsUsersWatch && (
                                    <Grid item xs={12} marginBlock={1}>
                                        <FormAutocompleteMultiple
                                            fullWidth
                                            name='users'
                                            label='Selecionar Usuários'
                                            variant='outlined'
                                            size='medium'
                                            disableCloseOnSelect
                                            control={control}
                                            errors={errors}
                                            options={autoCompleteEmployees}
                                        />
                                    </Grid>
                                )}

                                <Collapse in={isValidCheckBox}>
                                    <Alert
                                        severity='error'
                                        sx={{ mb: 2, fontSize: 12, border: `1px dashed #a81400`, mt: 1 }}>
                                        É necessário selecionar ao menos uma opção de destinatário para enviar a
                                        notificação.
                                    </Alert>
                                </Collapse>
                            </Grid>

                            <Box
                                display='flex'
                                justifyContent='space-between'
                                alignItems='center'
                                mt={!isValidCheckBox ? 2 : 0}>
                                <Typography
                                    fontWeight='medium'
                                    fontSize={14}
                                    sx={{ color: isThemeLight ? "#9e9e9e" : "#cccccc" }}>
                                    Quantidade de destinatários selecionados:
                                </Typography>

                                <Box
                                    px={1.5}
                                    py={0.5}
                                    border={`1px solid ${isThemeLight ? "#ddd" : colorBorderSystem}`}
                                    borderRadius='8px'
                                    sx={{
                                        backgroundColor: isThemeLight ? "#fafafa" : "#051B1F",
                                        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                                    }}>
                                    <Typography
                                        fontWeight='bold'
                                        fontSize={14}
                                        color={isThemeLight ? "text.secondary" : "#769ca5"}>
                                        173 Usuários
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            p={3}
                            mt={2}
                            mb={2}
                            sx={{
                                borderRadius: "16px",
                                border: `1px solid ${colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Grid item xs={12} md={12}>
                                <Typography variant='h5' fontWeight='bold'>
                                    Opções de entrega
                                </Typography>
                                <Typography
                                    textAlign='left'
                                    variant='body2'
                                    fontSize={12}
                                    color='text.secondary'
                                    mt={1}>
                                    Defina quando a notificação deve ser exibida aos destinatários. Você pode enviá-la
                                    imediatamente ou agendar para uma data futura. Também é possível definir uma data de
                                    expiração opcional para limitar sua visibilidade.
                                </Typography>

                                <Stack direction='row' alignItems='center' spacing={1} mt={2}>
                                    <FormSwitchGroup
                                        row
                                        title='Agendar notificação?'
                                        options={[
                                            {
                                                name: "is_scheduled",
                                                label: !isScheduledWatch ? "Não" : "Sim",
                                            },
                                        ]}
                                        control={control}
                                    />
                                </Stack>

                                <Collapse in={isScheduledWatch}>
                                    <Grid item container spacing={1} marginBlock={1}>
                                        <Grid item xs={12} md={6}>
                                            <FormDateTimePicker
                                                fullWidth
                                                name='scheduled_at'
                                                label='Data Inicial'
                                                variant='outlined'
                                                size='medium'
                                                disabled={!isScheduledWatch}
                                                control={control}
                                                errors={errors}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <FormDateTimePicker
                                                fullWidth
                                                name='expires_at'
                                                label='Data Expiração (Opcional)'
                                                variant='outlined'
                                                size='medium'
                                                disabled={!isScheduledWatch}
                                                control={control}
                                                errors={errors}
                                            />
                                        </Grid>
                                    </Grid>
                                </Collapse>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} sm={12} md={12} lg={5} xl={4}>
                        <Grid
                            item
                            xs={12}
                            p={3}
                            sx={{
                                borderRadius: "16px",
                                border: `1px solid ${colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Typography variant='h5' fontWeight='bold' mt={-0.75}>
                                Preview
                            </Typography>

                            <Paper
                                variant='outlined'
                                sx={{
                                    mt: 2,
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    position: "relative",
                                }}>
                                {/* {file && (
                                    <Box
                                        component='img'
                                        src={URL.createObjectURL(file)}
                                        alt='Preview'
                                        sx={{
                                            width: "100%",
                                            height: 70,
                                            objectFit: "cover",
                                            borderRadius: "8px 8px 0px 0px",
                                            mb: 1,
                                        }}
                                    />
                                )} */}

                                <Box
                                    sx={{
                                        padding: "16px 16px 16px 16px",
                                        // padding: !file ? "16px 16px 16px 16px" : "0px 16px 16px 16px",
                                    }}>
                                    <Stack direction='row' spacing={1.5} alignItems='center'>
                                        <Box display='flex' alignItems='center' minWidth={43}>
                                            {originWatch.id === "usuario" ? (
                                                <BadgeAvatars
                                                    type='default'
                                                    user={user}
                                                    badgeContent={
                                                        selectedOptions.includes("Alta") ? (
                                                            <NewReleasesOutlinedIcon
                                                                sx={{
                                                                    fontSize: 18,
                                                                    color: isThemeLight ? "#e00e0e" : "#FB8382",
                                                                    borderRadius: 50,
                                                                    background: isThemeLight ? "#ffffff" : "#00232B",
                                                                }}
                                                            />
                                                        ) : selectedOptions.includes("Média") ? (
                                                            <NotificationImportantOutlinedIcon
                                                                sx={{
                                                                    fontSize: 18,
                                                                    borderRadius: 50,
                                                                    color: isThemeLight ? "#f5ce33" : "#FDE68C",
                                                                    background: isThemeLight ? "#ffffff" : "#00232B",
                                                                }}
                                                            />
                                                        ) : (
                                                            <InfoOutlinedIcon
                                                                sx={{
                                                                    fontSize: 18,
                                                                    borderRadius: 50,
                                                                    color: isThemeLight ? "#13B0EF" : "#66ACD6",
                                                                    background: isThemeLight ? "#ffffff" : "#00232B",
                                                                }}
                                                            />
                                                        )
                                                    }>
                                                    <Typography fontSize={"1.5rem"}>{user?.name.charAt(0)}</Typography>
                                                </BadgeAvatars>
                                            ) : (
                                                <Badge
                                                    overlap='circular'
                                                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                                    badgeContent={
                                                        selectedOptions.includes("Alta") ? (
                                                            <NewReleasesOutlinedIcon
                                                                sx={{
                                                                    fontSize: 18,
                                                                    color: isThemeLight ? "#e00e0e" : "#FB8382",
                                                                    borderRadius: 50,
                                                                    background: isThemeLight ? "#ffffff" : "#00232B",
                                                                }}
                                                            />
                                                        ) : selectedOptions.includes("Média") ? (
                                                            <NotificationImportantOutlinedIcon
                                                                sx={{
                                                                    fontSize: 18,
                                                                    borderRadius: 50,
                                                                    color: isThemeLight ? "#f5ce33" : "#FDE68C",
                                                                    background: isThemeLight ? "#ffffff" : "#00232B",
                                                                }}
                                                            />
                                                        ) : (
                                                            <InfoOutlinedIcon
                                                                sx={{
                                                                    fontSize: 18,
                                                                    borderRadius: 50,
                                                                    color: isThemeLight ? "#13B0EF" : "#66ACD6",
                                                                    background: isThemeLight ? "#ffffff" : "#00232B",
                                                                }}
                                                            />
                                                        )
                                                    }>
                                                    <Avatar
                                                        sx={{
                                                            textTransform: "uppercase",
                                                            backgroundColor: moduleIconWatch
                                                                ? selectedOptions.includes("Alta")
                                                                    ? isThemeLight
                                                                        ? "#e00e0e2f"
                                                                        : "#FB83822f"
                                                                    : selectedOptions.includes("Média")
                                                                      ? isThemeLight
                                                                          ? "#f5ce332f"
                                                                          : "#FDE68C2f"
                                                                      : isThemeLight
                                                                        ? "#13B0EF2f"
                                                                        : "#66abd62f"
                                                                : isThemeLight
                                                                  ? "#00364122"
                                                                  : "#00AF9E22",
                                                            color: "#ffffff",
                                                            border: "1px solid",
                                                            borderColor: moduleIconWatch
                                                                ? selectedOptions.includes("Alta")
                                                                    ? isThemeLight
                                                                        ? "#b40808"
                                                                        : "#FB8382"
                                                                    : selectedOptions.includes("Média")
                                                                      ? isThemeLight
                                                                          ? "#cea609"
                                                                          : "#FDE68C"
                                                                      : isThemeLight
                                                                        ? "#0788bb"
                                                                        : "#66ACD6"
                                                                : isThemeLight
                                                                  ? "#0036413b"
                                                                  : "#00af9d3b",
                                                        }}>
                                                        <Icon
                                                            className='material-icons-outlined'
                                                            sx={{
                                                                color: selectedOptions.includes("Alta")
                                                                    ? isThemeLight
                                                                        ? "#b40808"
                                                                        : "#FB8382"
                                                                    : selectedOptions.includes("Média")
                                                                      ? isThemeLight
                                                                          ? "#cea609"
                                                                          : "#FDE68C"
                                                                      : isThemeLight
                                                                        ? "#0788bb"
                                                                        : "#66ACD6",
                                                            }}>
                                                            {moduleIconWatch ? (
                                                                moduleIconWatch
                                                            ) : (
                                                                <img
                                                                    style={{ width: "93%" }}
                                                                    src={
                                                                        isThemeLight
                                                                            ? favIconSingColor
                                                                            : favIconSingWhite
                                                                    }
                                                                    alt='favIcon SING'
                                                                />
                                                            )}
                                                        </Icon>
                                                    </Avatar>
                                                </Badge>
                                            )}
                                        </Box>

                                        <Box flexGrow={1} minWidth={0}>
                                            <Typography
                                                fontWeight='bold'
                                                fontSize={14}
                                                noWrap
                                                overflow='hidden'
                                                textOverflow='ellipsis'
                                                whiteSpace='nowrap'>
                                                {titleWatch || "Título da notificação..."}
                                            </Typography>
                                            {subTitleWatch ? (
                                                <Typography
                                                    variant='body2'
                                                    color={
                                                        selectedOptions.includes("Alta")
                                                            ? isThemeLight
                                                                ? "#e00e0e"
                                                                : "#FB8382"
                                                            : selectedOptions.includes("Média")
                                                              ? isThemeLight
                                                                  ? "#cea609"
                                                                  : "#FDE68C"
                                                              : isThemeLight
                                                                ? "#13B0EF"
                                                                : "#66ACD6"
                                                    }
                                                    fontSize='0.7rem'
                                                    lineHeight={1.3}
                                                    noWrap
                                                    overflow='hidden'
                                                    textOverflow='ellipsis'
                                                    whiteSpace='nowrap'
                                                    mb={0.5}>
                                                    {subTitleWatch}
                                                </Typography>
                                            ) : null}
                                            <Typography
                                                variant='body2'
                                                color='text.secondary'
                                                fontSize='0.8rem'
                                                noWrap
                                                overflow='hidden'
                                                textOverflow='ellipsis'
                                                whiteSpace='nowrap'>
                                                {contentWatch || "Preview do conteúdo da notificação..."}
                                            </Typography>
                                        </Box>

                                        <Box
                                            textAlign='right'
                                            sx={{
                                                minWidth: "auto",
                                                flexShrink: 0,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "flex-end",
                                            }}>
                                            <Typography variant='caption' fontSize={12} color='text.secondary'>
                                                1 d
                                            </Typography>
                                            <Box
                                                width={10}
                                                height={10}
                                                borderRadius='50%'
                                                bgcolor={
                                                    selectedOptions.includes("Alta")
                                                        ? isThemeLight
                                                            ? "#e00e0e"
                                                            : "#FB8382"
                                                        : selectedOptions.includes("Média")
                                                          ? isThemeLight
                                                              ? "#f5ce33"
                                                              : "#FDE68C"
                                                          : isThemeLight
                                                            ? "#13B0EF"
                                                            : "#66ACD6"
                                                }
                                                mt={0.5}
                                                ml='auto'
                                            />
                                        </Box>
                                    </Stack>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            p={3}
                            mt={2}
                            sx={{
                                borderRadius: "16px",
                                border: `1px solid ${colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Typography variant='h5' fontWeight='bold' gutterBottom>
                                Sumário
                            </Typography>

                            <Box sx={{ mt: 1.5 }}>
                                <Typography variant='subtitle2' color='text.secondary'>
                                    Status
                                </Typography>
                                <Typography variant='body1' mb={1}>
                                    <Box display='inline-flex' alignItems='center' gap={0.5}>
                                        {!isValidStatusSend ? (
                                            <>
                                                <TaskAltOutlinedIcon
                                                    sx={{ fontSize: 18, color: isThemeLight ? "#1ab96a" : "#66E4A6" }}
                                                />
                                                Pronto para enviar
                                            </>
                                        ) : (
                                            <>
                                                <DoNotDisturbOffOutlinedIcon
                                                    sx={{ fontSize: 18, color: isThemeLight ? "#e00e0e" : "#FB8382" }}
                                                />
                                                Não preparado
                                            </>
                                        )}
                                    </Box>
                                </Typography>

                                <Divider />

                                <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                                    Anexos
                                </Typography>
                                <Typography variant='body1' mb={1}>
                                    <Box display='inline-flex' alignItems='center' gap={0.5}>
                                        <AttachFileOutlinedIcon
                                            color={attachments.length > 0 ? "inherit" : "disabled"}
                                            sx={{ fontSize: 18 }}
                                        />
                                        {attachments.length > 0 ? (
                                            <Typography>
                                                {`${
                                                    attachments.length === 1
                                                        ? `1 anexo carregado`
                                                        : `${attachments.length} anexos carregados`
                                                }`}
                                            </Typography>
                                        ) : (
                                            <Typography color='text.secondary'>Nenhum anexo adicionado</Typography>
                                        )}
                                    </Box>
                                </Typography>

                                <Divider />

                                <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                                    Prioridade
                                </Typography>
                                <Typography variant='body1' mb={1}>
                                    <Box display='inline-flex' alignItems='center' gap={0.5}>
                                        {selectedOptions.includes("Alta") ? (
                                            <>
                                                <NewReleasesOutlinedIcon
                                                    sx={{ fontSize: 18, color: isThemeLight ? "#e00e0e" : "#FB8382" }}
                                                />
                                                Alta
                                            </>
                                        ) : selectedOptions.includes("Média") ? (
                                            <>
                                                <NotificationImportantOutlinedIcon
                                                    sx={{ fontSize: 18, color: isThemeLight ? "#f5ce33" : "#FDE68C" }}
                                                />
                                                Média
                                            </>
                                        ) : (
                                            <>
                                                <InfoOutlinedIcon
                                                    sx={{ fontSize: 18, color: isThemeLight ? "#13B0EF" : "#66ACD6" }}
                                                />
                                                Baixa
                                            </>
                                        )}
                                    </Box>
                                </Typography>

                                <Divider />

                                <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                                    Origem
                                </Typography>
                                <Typography variant='body1' mb={1}>
                                    <Box display='inline-flex' alignItems='center' gap={0.5}>
                                        <TripOriginOutlinedIcon sx={{ fontSize: 18, color: originColor }} />
                                        {originWatch?.label || "Origem não definida"}
                                    </Box>
                                </Typography>

                                <Divider />

                                <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                                    Destinatários (173 usuários)
                                </Typography>

                                <Typography variant='body1' mb={1}>
                                    <Box display='flex' alignItems='center' gap={0.5} flexWrap='wrap'>
                                        {switchIsAllWatch ? (
                                            <>
                                                <GroupsOutlinedIcon color='action' sx={{ fontSize: 18 }} />
                                                Todos
                                            </>
                                        ) : isValidCheckBox ? (
                                            <>
                                                <NoAccountsOutlinedIcon color='error' sx={{ fontSize: 18 }} />
                                                Nenhum destinatário selecionado
                                            </>
                                        ) : (
                                            <>
                                                {switchIsAgenciesWatch && (
                                                    <>
                                                        <ApartmentOutlinedIcon color='action' sx={{ fontSize: 18 }} />
                                                        Agências
                                                    </>
                                                )}
                                                {switchIsPortfoliosWatch && (
                                                    <>
                                                        <AccountBalanceWalletOutlinedIcon
                                                            color='action'
                                                            sx={{ fontSize: 18 }}
                                                        />
                                                        Carteiras
                                                    </>
                                                )}
                                                {switchIsSectorsWatch && (
                                                    <>
                                                        <WorkspacesOutlinedIcon color='action' sx={{ fontSize: 18 }} />
                                                        Setores
                                                    </>
                                                )}
                                                {switchIsUsersWatch && (
                                                    <>
                                                        <GroupOutlinedIcon color='action' sx={{ fontSize: 18 }} />
                                                        Usuários
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Box>
                                </Typography>

                                <Divider />

                                <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                                    Link
                                </Typography>
                                <Typography variant='body1' mb={1}>
                                    <Box display='inline-flex' alignItems='center' gap={0.5}>
                                        {!LinkURLWatch ? (
                                            <>
                                                <LinkOffIcon color='action' sx={{ fontSize: 18 }} />
                                                Sem link/redirecionamento configurado
                                            </>
                                        ) : !isLinkExternalValid ? (
                                            <>
                                                <ErrorOutlineOutlinedIcon color='error' sx={{ fontSize: 18 }} />
                                                Link inválido ou mal formatado
                                            </>
                                        ) : isExternalLinkWatch ? (
                                            <>
                                                <OpenInNewOutlinedIcon color='success' sx={{ fontSize: 18 }} />
                                                Link externo válido e ativo
                                            </>
                                        ) : (
                                            <>
                                                <OpenInBrowserOutlinedIcon color='success' sx={{ fontSize: 18 }} />
                                                Link interno válido e ativo
                                            </>
                                        )}
                                    </Box>
                                </Typography>

                                <Divider />

                                <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                                    Agendamento
                                </Typography>
                                <Typography variant='body1' mb={1}>
                                    <Box display='inline-flex' alignItems='center' gap={0.5}>
                                        {isScheduledWatch ? (
                                            <>
                                                <CalendarMonthOutlinedIcon color='info' sx={{ fontSize: 18 }} />
                                                {`Agendado para ${formatDate(dateScheduledAtWatch || "", "DD/MM/YYYY HH:mm:ss") || "--/--/---- --:--:--"} ${dateExpiresAtWatch ? formatDate(dateExpiresAtWatch || "", "[às] DD/MM/YYYY HH:mm:ss") : ""}  `}
                                            </>
                                        ) : (
                                            <>
                                                <SendOutlinedIcon sx={{ fontSize: 18, color: "#13B0EF" }} />
                                                Envio Imediato
                                            </>
                                        )}
                                    </Box>
                                </Typography>

                                <Divider />

                                <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                                    Situação
                                </Typography>

                                <Typography variant='body1'>
                                    <Box display='inline-flex' alignItems='center' gap={0.5}>
                                        {isActiveWatch ? (
                                            <>
                                                <CheckCircleIcon color='success' sx={{ fontSize: 18 }} />
                                                Ativo
                                            </>
                                        ) : (
                                            <>
                                                <CancelIcon color='error' sx={{ fontSize: 18 }} />
                                                Inativo
                                            </>
                                        )}
                                    </Box>
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} textAlign={"right"} mt={2}>
                            <Button
                                size='medium'
                                sx={{
                                    boxShadow: "none",
                                    backgroundColor: isThemeLight ? "#ffffff" : "#142527",
                                    border: `1px solid ${isThemeLight ? colorBorderSystem : "#405b5f"}`,
                                    "&:hover": {
                                        backgroundColor: isThemeLight ? "#f1f1f1" : "#405b5f",
                                        boxShadow: "none",
                                    },
                                }}
                                variant='contained'
                                startIcon={
                                    <RestartAltOutlinedIcon
                                        sx={{ color: isThemeLight ? "text.secondary" : "#96afb3" }}
                                    />
                                }
                                onClick={() => {
                                    clearFields();
                                }}>
                                <Typography
                                    fontSize={12}
                                    fontWeight='bold'
                                    color={isThemeLight ? "text.secondary" : "#96afb3"}>
                                    Resetar Campos
                                </Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Grid>
    );
}
