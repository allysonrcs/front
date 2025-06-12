import { useEffect, useState } from "react";
import { Box, Typography, Grid, Rating, useTheme, TextField, Collapse, Alert } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import FlatFeedbackSVG from "@/assets/images/flat-feedback-ok.svg?react";
import { useGlobal } from "@/contexts/GlobalContext";
import { createCsatAssessments } from "@/services/csat-assessments";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { improvementOptions, positiveOptions } from "@/constants/array-tags-options-csat-assessments";

export interface CSATAssessmentsFormsProps {
    onCloseModal?: () => void;
    module?: string;
    routePath?: string;
    context?: string;
}

export function CSATAssessmentsForm({ onCloseModal, module, routePath, context }: CSATAssessmentsFormsProps) {
    const [loadingButton, setLoadingButton] = useState<boolean>(false);
    const [rating, setRating] = useState<number | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [feedbackText, setFeedbackText] = useState<string>("");
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [secondsToClose, setSecondsToClose] = useState<number>(7);
    const [showAlert, setShowAlert] = useState(false);

    const { colorBorderSystem, getInfoError } = useGlobal();
    const theme = useTheme();

    const MAX_CHARS = 2000;

    const isFormValid = rating !== null && selectedOptions.length >= 1;
    const optionsRemaining = 3 - selectedOptions.length;
    const colorAndSelectRating =
        rating && rating <= 3
            ? theme.palette.info.main
            : rating === 4
              ? theme.palette.warning.main
              : theme.palette.primary.main;

    const handleOptionToggle = (label: string) => {
        const isSelected = selectedOptions.includes(label);
        const nextSelection = isSelected
            ? selectedOptions.filter((item) => item !== label)
            : selectedOptions.length < 3
              ? [...selectedOptions, label]
              : selectedOptions;
        setSelectedOptions(nextSelection);
    };

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= MAX_CHARS) {
            setFeedbackText(value);
        }
    };

    const renderFeedbackTitle = () => {
        if (rating === 5) return "🥰 O que você mais gostou em nosso serviço?";
        if (rating === 4) return "😅 O que faltou para você dar 5 estrelas?";
        return "😔 O que pode melhorar?";
    };

    const getFeedbackOptions = () => {
        if (rating === 5) return positiveOptions;
        return improvementOptions;
    };

    const handleSubmit = async () => {
        const payload = {
            rating: rating!,
            module: module || "Indefinido",
            route_path: routePath || "",
            context: context || "",
            selected_tags: selectedOptions.length > 0 ? selectedOptions.join(";") : undefined,
            description: feedbackText.trim() !== "" ? feedbackText.trim() : undefined,
        };

        try {
            setLoadingButton(true);

            await createCsatAssessments(payload);

            setSubmitted(true);
            setSecondsToClose(7);

            toast.success("Avaliação realizada com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
            setShowAlert(true);
        } finally {
            setTimeout(() => {
                setLoadingButton(false);
            }, 2500);
        }
    };

    useEffect(() => {
        if (!submitted) return;

        if (secondsToClose > 0) {
            const timer = setTimeout(() => setSecondsToClose((s) => s - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            onCloseModal?.();
            setSubmitted(false);
        }
    }, [submitted, secondsToClose]);

    return (
        <Box>
            <Collapse in={submitted} timeout={500} unmountOnExit>
                <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' p={1}>
                    <FlatFeedbackSVG height={"100%"} style={{ marginBottom: 16 }} />
                    <Typography textAlign='center' fontSize={18} fontWeight={600} display='block' mb={0.5}>
                        Obrigado por sua avaliação!
                    </Typography>
                    <Typography variant='h6' textAlign='center' color='text.secondary' display='block' mb={1}>
                        Seu feedback é muito importante para nós.
                    </Typography>
                    <Typography textAlign='center' fontSize={13} color='text.secondary'>
                        Fechando em {secondsToClose} segundos...
                    </Typography>
                </Box>
            </Collapse>

            <Collapse in={!submitted} timeout={500}>
                <Typography variant='h6' fontWeight={600} mb={1.5} textAlign='center'>
                    Como foi a sua experiência com:
                </Typography>
                {module && (
                    <Typography
                        variant='h6'
                        mb={1.5}
                        textAlign='center'
                        border={`1px dashed ${colorBorderSystem}`}
                        borderRadius={1.5}
                        p={0.5}>
                        {module}
                    </Typography>
                )}

                <Box display='flex' justifyContent='center' mb={2}>
                    <Rating
                        name='csat-rating'
                        value={rating}
                        onChange={(event, newValue) => {
                            setRating(newValue);
                            setSelectedOptions([]);
                        }}
                        icon={<StarIcon fontSize='large' htmlColor='#FFA000' />}
                        emptyIcon={<StarIcon fontSize='large' style={{ opacity: 0.3 }} />}
                    />
                </Box>

                <Grid container spacing={1} justifyContent='space-between' mb={2}>
                    {["Péssima", "Ruim", "Mais ou menos", "Boa", "Excelente"].map((label) => (
                        <Grid item xs={2.4} key={label}>
                            <Typography fontSize={12} textAlign='center'>
                                {label}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>

                <Collapse in={!!rating} timeout={500}>
                    <Typography
                        variant='subtitle1'
                        fontWeight={600}
                        mb={1.5}
                        textAlign='center'
                        color='white'
                        bgcolor={colorAndSelectRating}
                        px={2}
                        py={1}
                        borderRadius={1}>
                        {renderFeedbackTitle()}
                    </Typography>
                    <Typography variant='caption' display='block' mb={1} textAlign='center'>
                        Marque até 3 opções -
                        <Typography variant='caption' color='text.secondary'>
                            {selectedOptions.length < 3
                                ? ` Marque mais ${optionsRemaining} ${optionsRemaining > 1 ? "opções" : "opção"}`
                                : " Limite de 3 opções atingido"}
                        </Typography>
                    </Typography>

                    <Grid container spacing={2} justifyContent='center'>
                        {getFeedbackOptions().map(({ label, icon }) => {
                            const isSelected = selectedOptions.includes(label);
                            const reachedLimit = selectedOptions.length === 3;
                            const isDisabled = !isSelected && reachedLimit;

                            return (
                                <Grid item xs={6} sm={6} md={4} key={label} overflow='hidden'>
                                    <Box
                                        onClick={() => !isDisabled && handleOptionToggle(label)}
                                        sx={{
                                            width: "100%",
                                            height: "110px",
                                            border: `2px solid ${
                                                isSelected ? colorAndSelectRating : theme.palette.divider
                                            }`,
                                            color: `${isSelected ? colorAndSelectRating : "text.secondary"}`,
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
                                        <Typography fontSize={14}>{label}</Typography>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Collapse>

                <Box mt={2}>
                    <Typography fontWeight={600} fontSize={14} mb={1} color='text.secondary'>
                        Deixe elogio, sugestão ou crítica (opcional):
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder='Para que possamos melhorar o serviço, conte-nos sobre sua experiência.'
                        value={feedbackText}
                        onChange={handleFeedbackChange}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                    borderColor: colorAndSelectRating,
                                },
                            },
                        }}
                    />
                    <Typography textAlign='right' variant='caption'>
                        {MAX_CHARS - feedbackText.length} caracteres restantes
                    </Typography>
                </Box>

                <Collapse in={showAlert} sx={{ marginBottom: -1, marginTop: 1 }}>
                    <Alert
                        severity='error'
                        sx={{ mb: 2, fontSize: 12, border: `1px dashed #a81400` }}
                        onClose={() => setShowAlert(false)}>
                        Você já avaliou este serviço hoje. Tente novamente amanhã.
                    </Alert>
                </Collapse>

                <Box mt={1} display='flex' justifyContent='flex-end'>
                    <LoadingButton
                        variant='contained'
                        color={rating && rating <= 3 ? "info" : rating === 4 ? "warning" : "primary"}
                        disabled={!isFormValid || loadingButton || showAlert}
                        loading={loadingButton}
                        sx={{ fontWeight: 600, bgcolor: colorAndSelectRating, boxShadow: "none" }}
                        onClick={handleSubmit}>
                        Enviar avaliação
                    </LoadingButton>
                </Box>
            </Collapse>
        </Box>
    );
}
