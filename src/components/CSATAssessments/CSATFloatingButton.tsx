import { useState } from "react";
import { Box, Button, Modal, useMediaQuery, useTheme } from "@mui/material";
import { BoxModal } from "../BoxModal/BoxModal";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { CSATAssessmentsForm, CSATAssessmentsFormsProps } from "./CSATAssessmentsForm";
import { darken } from "@mui/material/styles";

interface CSATFloatingButtonProps {
    title: string;
    bgColor?: string;
    textColor?: string;
    position?: "right-center" | "bottom";
    zIndex?: number;
    hasAlreadyRated?: boolean;
    formProps?: CSATAssessmentsFormsProps;
}

export function CSATFloatingButton({
    title,
    bgColor = "#c9d200",
    textColor = "#424601",
    position = "right-center",
    zIndex = 1000,
    hasAlreadyRated,
    formProps,
}: CSATFloatingButtonProps) {
    const [openModalCSATAssessments, setOpenModalCSATAssessments] = useState(false);

    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleOpenModalCSATAssessments = () => {
        setOpenModalCSATAssessments((oldValue) => !oldValue);
    };

    const isRight = position === "right-center";
    const isBottom = position === "bottom";

    return (
        <>
            <Box
                sx={{
                    position: "fixed",
                    ...(isRight && {
                        top: "50%",
                        right: 0,
                        transform: "translateY(-50%)",
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                    }),
                    ...(isBottom && {
                        bottom: 0,
                        right: "85px",
                    }),
                    bgcolor: bgColor,
                    color: textColor,
                    borderRadius: isRight ? "8px 0 0 8px" : "8px 8px 0 0",
                    zIndex: zIndex,
                    boxShadow: 3,
                }}>
                {isRight && (
                    <Button
                        title='Módulo de Avaliação'
                        onClick={handleOpenModalCSATAssessments}
                        startIcon={
                            <StarRoundedIcon
                                sx={{
                                    ml: 1.35,
                                    color: hasAlreadyRated ? "orange" : "inherit",
                                }}
                            />
                        }
                        sx={{
                            color: "inherit",
                            fontSize: "14px",
                            textTransform: "none",
                            px: !isMobile ? 0.1 : 0,
                            py: 1.5,
                            minHeight: "auto",
                            minWidth: "auto",
                            writingMode: "sideways-lr",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.75,
                            "&:hover": {
                                bgcolor: darken(bgColor, 0.1),
                            },
                        }}>
                        {!isMobile && title}
                    </Button>
                )}

                {isBottom && (
                    <Button
                        title='Módulo de Avaliação'
                        onClick={handleOpenModalCSATAssessments}
                        startIcon={
                            <StarRoundedIcon
                                sx={{
                                    mr: !isMobile ? -1 : -1.5,
                                    mb: 0.25,
                                    color: hasAlreadyRated ? "orange" : "inherit",
                                }}
                            />
                        }
                        sx={{
                            color: "inherit",
                            fontSize: "14px",
                            textTransform: "none",
                            px: 1.75,
                            py: 0.75,
                            minHeight: "auto",
                            minWidth: "auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.75,
                            "&:hover": {
                                bgcolor: darken(bgColor, 0.1),
                            },
                        }}>
                        {!isMobile && title}
                    </Button>
                )}
            </Box>

            <Modal open={openModalCSATAssessments} onClose={handleOpenModalCSATAssessments}>
                <Box>
                    <BoxModal
                        title={"Avaliação CSAT"}
                        handleClose={handleOpenModalCSATAssessments}
                        width={"550px"}
                        maxHeight='95%'>
                        <Box
                            sx={{
                                maxHeight: "85vh",
                                overflowX: "auto",
                                padding: 1,
                                mt: -4,
                            }}>
                            <CSATAssessmentsForm
                                onCloseModal={handleOpenModalCSATAssessments}
                                context='Botão Flutuante'
                                {...formProps}
                            />
                        </Box>
                    </BoxModal>
                </Box>
            </Modal>
        </>
    );
}
