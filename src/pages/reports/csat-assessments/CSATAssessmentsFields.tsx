import { useEffect, useState } from "react";
import { Box, Chip, Divider, Grid, GridProps, Rating, Tooltip, Typography, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import FormInput from "@/components/FormComponents/FormInput";
import { useConfirm } from "material-ui-confirm";
import { toast } from "react-toastify";
import { changeStatusCsatAssessmentsByID, ISearchCsatAssessments } from "@/services/csat-assessments";
import { useGlobal } from "@/contexts/GlobalContext";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import BadgeAvatars from "@/components/AvatarWithBadge/AvatarWithBadge";
import { getBaseURL } from "@/functions/getBaseURL";
import { formatDate } from "@/functions/date";

type CSATAssessmentsFieldsProps = {
    dataCSATAssessments: ISearchCsatAssessments;
    isGroupAdmin: boolean;
    updateColumn?: (params: any) => void;
} & GridProps;

type CSATAssessmentsFields = {
    description?: string | null | undefined;
};

export function CSATAssessmentsFields({
    dataCSATAssessments,
    isGroupAdmin,
    updateColumn,
    ...props
}: CSATAssessmentsFieldsProps) {
    const [status, setStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const { getInfoError, colorBorderSystem, theme: themeContext } = useGlobal();

    const theme = useTheme();
    const confirm = useConfirm();

    const isThemeLight = themeContext === "light";

    const {
        setValue,
        control,
        formState: { errors },
    } = useForm<CSATAssessmentsFields>();

    const imageProfileURL = dataCSATAssessments.user_avatar_created
        ? getBaseURL() + dataCSATAssessments.user_avatar_created
        : undefined;

    const tags: string[] = dataCSATAssessments.selected_tags?.split(";").filter((tag: string) => tag.trim()) || [];

    const colorAndSelectRating =
        dataCSATAssessments.rating && dataCSATAssessments.rating <= 3
            ? theme.palette.info.main
            : dataCSATAssessments.rating === 4
              ? theme.palette.warning.main
              : theme.palette.primary.main;

    const handleChangeStatus = async () => {
        if (dataCSATAssessments.id) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} está avaliação?`,
                description: "O registro de avaliação sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        await changeStatusCsatAssessmentsByID(dataCSATAssessments.id, { is_active: !status });

                        setStatus((status) => !status);

                        updateColumn?.({
                            id: dataCSATAssessments.id,
                            is_active: !status,
                        });

                        toast.success(`${status ? "Inativado" : "Ativado"} com sucesso!`);
                    } catch (error) {
                        const info = await getInfoError(error);
                        toast.error(info.message);
                    }
                })
                .catch(() => {});
        }
    };

    useEffect(() => {
        setValue("description", dataCSATAssessments.description || "");
        setStatus(dataCSATAssessments.is_active);
    }, [dataCSATAssessments]);

    return (
        <Grid {...props}>
            <Grid container spacing={2} mt={-4}>
                <Grid item xs={12} textAlign={"center"} mt={-1}>
                    <Typography title='Módulo Avaliado' fontWeight='bold'>
                        {dataCSATAssessments.module}
                    </Typography>
                </Grid>

                <Tooltip title={<Typography fontWeight='bold'>Nota: {dataCSATAssessments.rating}</Typography>}>
                    <Grid item xs={12} textAlign={"center"}>
                        <Rating readOnly value={dataCSATAssessments.rating} />
                    </Grid>
                </Tooltip>

                <Grid item xs={12}>
                    <Box
                        display='flex'
                        flexWrap='wrap'
                        gap={0.5}
                        sx={{
                            py: 0.35,
                            maxWidth: "100%",
                            overflow: "hidden",
                            wordWrap: "break-word",
                        }}>
                        {tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                variant='outlined'
                                size='small'
                                sx={{
                                    maxWidth: "100%",
                                    whiteSpace: "normal",
                                    lineHeight: 1,
                                    fontSize: "0.70rem",
                                    color: isThemeLight ? colorAndSelectRating : "white",
                                    backgroundColor: isThemeLight ? "none" : `${colorAndSelectRating}7d`,
                                    borderColor: colorAndSelectRating,
                                }}
                            />
                        ))}
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <FormInput
                        fullWidth
                        multiline
                        rows={10}
                        label='Elogio / Crítica / Sugestão'
                        name='description'
                        type='text'
                        variant='outlined'
                        disabled
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography title='Usuário que avaliou' component='span' fontWeight='bold'>
                        Contexto:{" "}
                        <Typography component='span' color='text.secondary'>
                            {dataCSATAssessments.context}
                        </Typography>
                    </Typography>
                </Grid>

                <Grid item container>
                    <Divider
                        sx={{
                            borderColor: colorBorderSystem,
                            borderStyle: "dashed",
                            width: "100%",
                            mb: 2,
                        }}
                    />

                    <Tooltip
                        title={
                            <Typography fontWeight='bold'>
                                {`PA: ${dataCSATAssessments.agency_name_created} | Carteira: ${dataCSATAssessments.portfolio_name_created}`}
                            </Typography>
                        }>
                        <Grid item md={2.5}>
                            <BadgeAvatars
                                user={{
                                    name: dataCSATAssessments.user_name_created,
                                    url_image_profile: imageProfileURL,
                                }}
                                type='dot'
                                status={"Online"}
                                sx={{ width: 60, height: 60 }}
                            />
                        </Grid>
                    </Tooltip>

                    <Grid item md={9.5}>
                        <Typography title='Usuário que avaliou'>{dataCSATAssessments.user_name_created}</Typography>
                        <Typography fontSize={12} color={"GrayText"} title='Data de Criação'>
                            {formatDate(dataCSATAssessments.created_at, "DD/MM/YYYY HH:mm:ss")}
                        </Typography>
                        <Typography fontSize={12} color={"GrayText"} title='Data de Atualização'>
                            {dataCSATAssessments.updated_at
                                ? formatDate(dataCSATAssessments.updated_at, "DD/MM/YYYY HH:mm:ss")
                                : ""}
                        </Typography>
                    </Grid>
                </Grid>

                <Grid item container display='flex' justifyContent='center' gap={2} mt={3}>
                    {dataCSATAssessments && isGroupAdmin && (
                        <LoadingButton
                            size='large'
                            color={"info"}
                            variant='contained'
                            onClick={handleChangeStatus}
                            startIcon={<AutorenewOutlinedIcon />}
                            title='Alterar situação'
                            loading={loading}
                            sx={{ boxShadow: "none" }}>
                            {status ? "🔴 Inativar" : "🟢 Ativar"}
                        </LoadingButton>
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
}
