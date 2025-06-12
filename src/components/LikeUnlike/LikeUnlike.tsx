import Box from "@mui/material/Box";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Typography, Tooltip } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { useGlobal } from "../../contexts/GlobalContext";
import { useNotification } from "../../contexts/NotificationContext";
import { changeTypeAssessment, createAssessment, searchAssessmentById } from "../../services/notifications";
import { useAuth } from "../../contexts/AuthContext";

export type IPermissionProps = {
    group: string;
};

export function LikeUnlike() {
    const [iconStatus, setIconStatus] = useState<"Curtir" | "Descurtir" | null>(null);
    const [amountLike, setAmountLike] = useState<number>(0);
    const [amountUnlike, setAmountUnlike] = useState<number>(0);
    const { notificationContent } = useNotification();

    const { getInfoError } = useGlobal();
    const { user } = useAuth();

    const handleClickAssessmentLike = async () => {
        let ID_notification = Number(notificationContent?.id);

        try {
            if (iconStatus === "Curtir") {
                return toast.info("Você já avaliou essa notificação como like");
            }

            if (iconStatus === "Descurtir") {
                await changeTypeAssessment(ID_notification, { type: "Curtir" });

                setAmountLike((prev) => prev + 1);
                setIconStatus("Curtir");

                setAmountUnlike((prev) => prev - 1);

                toast.success("Avaliação atualizada com sucesso!");
            } else {
                await createAssessment({
                    id_notification: ID_notification,
                    type: "Curtir",
                });

                setAmountLike((prev) => prev + 1);
                setIconStatus("Curtir");
                toast.success("Avaliação criada com sucesso!");
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const handleClickAssessmentUnlike = async () => {
        let ID_notification = Number(notificationContent?.id);

        try {
            if (iconStatus === "Descurtir") {
                return toast.info("Você já avaliou essa notificação como dislike");
            }

            if (iconStatus === "Curtir") {
                await changeTypeAssessment(ID_notification, { type: "Descurtir" });

                setAmountLike((prev) => prev - 1);
                setIconStatus("Descurtir");

                setAmountUnlike((prev) => prev + 1);
                toast.success("Avaliação atualizada com sucesso!");
            } else {
                await createAssessment({
                    id_notification: ID_notification,
                    type: "Descurtir",
                });

                setAmountUnlike((prev) => prev + 1);
                setIconStatus("Descurtir");

                toast.success("Avaliação criada com sucesso!");
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        (async () => {
            const data = await searchAssessmentById(Number(notificationContent?.id));
            let like = 0;
            let deslike = 0;
            let statusAssessment: "Curtir" | "Descurtir" | null = null;

            data.forEach((element) => {
                if (user?.id_user === element.id_user) {
                    // statusAssessment = element.type;
                }

                if (element.type === "Curtir") {
                    like++;
                } else {
                    deslike++;
                }
            });

            setIconStatus(statusAssessment);
            setAmountLike(like);
            setAmountUnlike(deslike);
        })();
    }, []);

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    opacity: 0.9,
                    margin: "auto",
                    padding: "0.5rem",
                    fontWeight: 600,
                    maxWidth: "max-content",
                    width: "100%",
                    alignContent: "center",
                    alignItems: "center",
                    gap: 2,
                    transition: "0.2s ease all",
                }}>
                <Tooltip title='Curtir' arrow>
                    <Box
                        sx={{
                            display: "flex",
                            alignContent: "center",
                            alignItems: "center",
                            border: "1px solid transparent",
                            borderRadius: "40px",
                            justifyContent: "center",
                            padding: 1,
                            width: "100px",
                            gap: 1,
                            backgroundImage: "linear-gradient(90deg, #009688 35%, #025e70 100%)",
                            backgroundClip: "padding-box",
                        }}>
                        <Box>
                            <Typography sx={{ color: "#fff", fontWeight: "bold" }}>{amountLike ?? 0}</Typography>
                        </Box>

                        {iconStatus === "Curtir" ? (
                            <ThumbUpIcon
                                htmlColor='#fff'
                                onClick={handleClickAssessmentLike}
                                sx={{
                                    cursor: "pointer",
                                    "&:hover": {
                                        animation: "swing-icon-like 0.5s ease-in-out both",
                                    },
                                    "@keyframes swing-icon-like": {
                                        "0%": {
                                            transform: "rotate(0deg)",
                                        },
                                        "25%": {
                                            transform: "rotate(10deg)",
                                        },
                                        "50%": {
                                            transform: "rotate(-10deg)",
                                        },
                                        "75%": {
                                            transform: "rotate(5deg)",
                                        },
                                        "100%": {
                                            transform: "rotate(0deg)",
                                        },
                                    },
                                    transition: "transform 0.3s ease-in-out",
                                }}
                            />
                        ) : (
                            <ThumbUpOffAltIcon
                                htmlColor='#fff'
                                onClick={handleClickAssessmentLike}
                                sx={{
                                    cursor: "pointer",
                                    "&:hover": {
                                        animation: "swing-icon-like 0.5s ease-in-out both",
                                    },
                                    "@keyframes swing-icon-like": {
                                        "0%": {
                                            transform: "rotate(0deg)",
                                        },
                                        "25%": {
                                            transform: "rotate(10deg)",
                                        },
                                        "50%": {
                                            transform: "rotate(-10deg)",
                                        },
                                        "75%": {
                                            transform: "rotate(5deg)",
                                        },
                                        "100%": {
                                            transform: "rotate(0deg)",
                                        },
                                    },
                                    transition: "transform 0.3s ease-in-out",
                                }}
                            />
                        )}
                    </Box>
                </Tooltip>
                <Tooltip title='Descurtir' arrow>
                    <Box
                        sx={{
                            display: "flex",
                            alignContent: "center",
                            alignItems: "center",
                            border: "1px solid none",
                            borderRadius: "40px",
                            justifyContent: "center",
                            padding: 1,
                            width: "100px",
                            gap: 1,
                            backgroundImage: "linear-gradient(90deg, #009688 35%, #025e70 100%)",
                            backgroundClip: "padding-box",
                        }}>
                        <Box>
                            <Typography sx={{ color: "#fff", fontWeight: "bold" }}>{amountUnlike ?? 0}</Typography>
                        </Box>

                        {iconStatus === "Descurtir" ? (
                            <ThumbDownIcon
                                htmlColor='#fff'
                                onClick={handleClickAssessmentUnlike}
                                sx={{
                                    cursor: "pointer",
                                    "&:hover": {
                                        animation: "swing-icon-like 0.5s ease-in-out both",
                                    },
                                    "@keyframes swing-icon-like": {
                                        "0%": {
                                            transform: "rotate(0deg)",
                                        },
                                        "25%": {
                                            transform: "rotate(10deg)",
                                        },
                                        "50%": {
                                            transform: "rotate(-10deg)",
                                        },
                                        "75%": {
                                            transform: "rotate(5deg)",
                                        },
                                        "100%": {
                                            transform: "rotate(0deg)",
                                        },
                                    },
                                    transition: "transform 0.3s ease-in-out",
                                }}
                            />
                        ) : (
                            <ThumbDownOffAltIcon
                                htmlColor='#fff'
                                onClick={handleClickAssessmentUnlike}
                                sx={{
                                    cursor: "pointer",
                                    "&:hover": {
                                        animation: "swing-icon-like 0.5s ease-in-out both",
                                    },
                                    "@keyframes swing-icon-like": {
                                        "0%": {
                                            transform: "rotate(0deg)",
                                        },
                                        "25%": {
                                            transform: "rotate(10deg)",
                                        },
                                        "50%": {
                                            transform: "rotate(-10deg)",
                                        },
                                        "75%": {
                                            transform: "rotate(5deg)",
                                        },
                                        "100%": {
                                            transform: "rotate(0deg)",
                                        },
                                    },
                                    transition: "transform 0.3s ease-in-out",
                                }}
                            />
                        )}
                    </Box>
                </Tooltip>
            </Box>
        </>
    );
}
