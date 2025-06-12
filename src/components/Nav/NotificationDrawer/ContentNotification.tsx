import { Avatar, Badge, Box, Button, Chip, Divider, Grid, Icon, IconButton, Stack, Typography } from "@mui/material";
import { Fragment, useEffect } from "react";
import { toast } from "react-toastify";
import { useGlobal } from "../../../contexts/GlobalContext";
import { useNotification } from "../../../contexts/NotificationContext";
import { CardNotification } from "./CardNotification";
import { Attachment } from "../../Attachment/Attachment";
import { downloadNotificationFile, INotificationContent } from "@/services/notifications";
import { LikeUnlike } from "../../LikeUnlike/LikeUnlike";
import { useNavigate } from "react-router-dom";
import { getBaseURL } from "@/functions/getBaseURL";
import moment from "moment";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import BadgeAvatars from "@/components/AvatarWithBadge/AvatarWithBadge";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import OpenInBrowserOutlinedIcon from "@mui/icons-material/OpenInBrowserOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import NotificationImportantOutlinedIcon from "@mui/icons-material/NotificationImportantOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import favIconSingColor from "@/assets/images/sing-icone-colorido.ico";
import favIconSingWhite from "@/assets/images/sing-icone-branco.ico";

export function ContentNotification() {
    const { notificationContent, clearContent, toggleDrawer, closeDrawer } = useNotification();

    const { getInfoError, theme, colorBorderSystem } = useGlobal();

    const navigate = useNavigate();
    const isThemeLight = theme === "light";

    const existsImage = (type: string) => {
        let image = type.split("/");
        return image[0] === "image";
    };

    const handleDownloadAttachament = async (id: number) => {
        try {
            const res = await downloadNotificationFile(id);
            const decodedFileName = decodeURIComponent(res.headers["content-disposition"].split("filename=")[1]);
            const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", decodedFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Download do arquivo realizado com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const handleClick = (link: INotificationContent) => {
        if (!link.link_url) return;

        if (link.is_external_link) {
            window.open(link.link_url, "_blank", "noopener,noreferrer");
        } else {
            navigate(link.link_url);
        }
    };

    const closeContent = () => {
        setTimeout(() => {
            toggleDrawer?.();
            clearContent();
        }, 200);

        toggleDrawer?.();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeContent();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            {notificationContent && (
                <>
                    <Grid
                        sx={{
                            width: "100%",
                            height: "100%",
                            overflow: "auto",
                            "&::-webkit-scrollbar": {
                                width: "6px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: isThemeLight ? "#e0e0e0" : "#405b5f",
                            },
                        }}>
                        <Grid
                            container
                            sx={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}>
                            <IconButton
                                onClick={() => {
                                    closeContent();
                                }}
                                title='Voltar (ESC)'>
                                <ArrowCircleLeftOutlinedIcon />
                            </IconButton>

                            <IconButton
                                onClick={() => {
                                    closeDrawer();
                                    clearContent();
                                }}
                                title='Fechar'>
                                <HighlightOffIcon />
                            </IconButton>
                        </Grid>
                        <Grid
                            sx={{
                                padding: "0rem 1.8rem 1.8rem 1.8rem",
                            }}>
                            <Stack direction='row' spacing={1.5} alignItems='center'>
                                <Box display='flex' alignItems='center' minWidth={43} height={55}>
                                    {notificationContent.source === "usuario" ? (
                                        <BadgeAvatars
                                            title={notificationContent?.people_name}
                                            type='default'
                                            user={{
                                                name: notificationContent.people_name || "",
                                                url_image_profile: getBaseURL() + notificationContent.url_image_profile,
                                            }}
                                            badgeContent={
                                                notificationContent.priority_level === "Alta" ? (
                                                    <NewReleasesOutlinedIcon
                                                        sx={{
                                                            fontSize: 18,
                                                            color: isThemeLight ? "#e00e0e" : "#FB8382",
                                                            borderRadius: 50,
                                                            background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                            boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                        }}
                                                    />
                                                ) : notificationContent.priority_level === "Média" ? (
                                                    <NotificationImportantOutlinedIcon
                                                        sx={{
                                                            fontSize: 18,
                                                            borderRadius: 50,
                                                            color: isThemeLight ? "#f5ce33" : "#FDE68C",
                                                            background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                            boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                        }}
                                                    />
                                                ) : (
                                                    <InfoOutlinedIcon
                                                        sx={{
                                                            fontSize: 18,
                                                            borderRadius: 50,
                                                            color: isThemeLight ? "#13B0EF" : "#66ACD6",
                                                            background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                            boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                        }}
                                                    />
                                                )
                                            }>
                                            <Typography fontSize={"1.5rem"}>
                                                {notificationContent?.people_name
                                                    ? notificationContent.people_name.charAt(0)
                                                    : ""}
                                            </Typography>
                                        </BadgeAvatars>
                                    ) : (
                                        <Badge
                                            title={notificationContent.module || notificationContent.source}
                                            overlap='circular'
                                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                            badgeContent={
                                                notificationContent.priority_level === "Alta" ? (
                                                    <NewReleasesOutlinedIcon
                                                        sx={{
                                                            fontSize: 18,
                                                            color: isThemeLight ? "#e00e0e" : "#FB8382",
                                                            borderRadius: 50,
                                                            background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                            boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                        }}
                                                    />
                                                ) : notificationContent.priority_level === "Média" ? (
                                                    <NotificationImportantOutlinedIcon
                                                        sx={{
                                                            fontSize: 18,
                                                            borderRadius: 50,
                                                            color: isThemeLight ? "#f5ce33" : "#FDE68C",
                                                            background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                            boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                        }}
                                                    />
                                                ) : (
                                                    <InfoOutlinedIcon
                                                        sx={{
                                                            fontSize: 18,
                                                            borderRadius: 50,
                                                            color: isThemeLight ? "#13B0EF" : "#66ACD6",
                                                            background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                            boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                        }}
                                                    />
                                                )
                                            }>
                                            <Avatar
                                                sx={{
                                                    textTransform: "uppercase",
                                                    backgroundColor: notificationContent.moduleIcon
                                                        ? notificationContent.priority_level === "Alta"
                                                            ? isThemeLight
                                                                ? "#e00e0e2f"
                                                                : "#FB83822f"
                                                            : notificationContent.priority_level === "Média"
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
                                                    borderColor: notificationContent.moduleIcon
                                                        ? notificationContent.priority_level === "Alta"
                                                            ? isThemeLight
                                                                ? "#b40808"
                                                                : "#FB8382"
                                                            : notificationContent.priority_level === "Média"
                                                              ? isThemeLight
                                                                  ? "#cea609"
                                                                  : "#FDE68C"
                                                              : isThemeLight
                                                                ? "#0788bb"
                                                                : "#66ACD6"
                                                        : isThemeLight
                                                          ? "#025e7094"
                                                          : "#07d3be5a",
                                                }}>
                                                <Icon
                                                    className='material-icons-outlined'
                                                    sx={{
                                                        color:
                                                            notificationContent.priority_level === "Alta"
                                                                ? isThemeLight
                                                                    ? "#b40808"
                                                                    : "#FB8382"
                                                                : notificationContent.priority_level === "Média"
                                                                  ? isThemeLight
                                                                      ? "#cea609"
                                                                      : "#FDE68C"
                                                                  : isThemeLight
                                                                    ? "#0788bb"
                                                                    : "#66ACD6",
                                                    }}>
                                                    {notificationContent.moduleIcon ? (
                                                        notificationContent.moduleIcon
                                                    ) : (
                                                        <img
                                                            style={{ width: "93%" }}
                                                            src={isThemeLight ? favIconSingColor : favIconSingWhite}
                                                            alt='favIcon SING'
                                                        />
                                                    )}
                                                </Icon>
                                            </Avatar>
                                        </Badge>
                                    )}
                                </Box>

                                <Grid flexGrow={1} sx={{ whiteSpace: "pre-line" }} mb={1}>
                                    <Typography
                                        color='text.primary'
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: "1.45rem",
                                        }}>
                                        {notificationContent.title}
                                    </Typography>

                                    {notificationContent.subtitle && (
                                        <Typography
                                            mt={-0.5}
                                            color='inherit'
                                            sx={{
                                                fontSize: "1rem",
                                                color:
                                                    notificationContent.priority_level === "Alta"
                                                        ? isThemeLight
                                                            ? "#e00e0e"
                                                            : "#FB8382"
                                                        : notificationContent.priority_level === "Média"
                                                          ? isThemeLight
                                                              ? "#cea609"
                                                              : "#FDE68C"
                                                          : isThemeLight
                                                            ? "#13B0EF"
                                                            : "#66ACD6",
                                            }}>
                                            {notificationContent.subtitle}
                                        </Typography>
                                    )}
                                </Grid>
                            </Stack>

                            <Divider sx={{ borderStyle: "dashed", mt: 1 }} />

                            <Grid mt={1} mb={1.5}>
                                <Box display='inline-flex' alignItems='center' gap={0.5}>
                                    <Box
                                        width={8}
                                        height={8}
                                        borderRadius='50%'
                                        bgcolor={
                                            notificationContent.priority_level === "Alta"
                                                ? isThemeLight
                                                    ? "#e00e0e"
                                                    : "#FB8382"
                                                : notificationContent.priority_level === "Média"
                                                  ? isThemeLight
                                                      ? "#f5ce33"
                                                      : "#FDE68C"
                                                  : isThemeLight
                                                    ? "#13B0EF"
                                                    : "#66ACD6"
                                        }
                                    />
                                    <Typography sx={{ fontSize: "14px" }} color={"GrayText"}>
                                        Publicado {moment(notificationContent.created_at).format("LLLL")}
                                    </Typography>
                                </Box>
                            </Grid>

                            {notificationContent.image_cover && (
                                <Grid xs={12}>
                                    <Box
                                        component='img'
                                        src={getBaseURL() + notificationContent.image_cover}
                                        alt='Preview'
                                        sx={{
                                            width: "100%",
                                            objectFit: "cover",
                                            borderRadius: 2,
                                            mb: 0.5,
                                        }}
                                    />
                                </Grid>
                            )}

                            <Grid xs={12} sx={{ mt: 1, mb: 1 }}>
                                <Typography whiteSpace={"pre-line"} textAlign={"justify"}>
                                    {notificationContent.content}
                                </Typography>
                            </Grid>

                            {notificationContent.link_url && (
                                <Grid xs={12} marginBlock={1.5}>
                                    <Button
                                        variant='contained'
                                        size='large'
                                        sx={{
                                            boxShadow: "none",
                                            backgroundColor: isThemeLight ? "#ffffff" : "#142527",
                                            border: `1px solid ${isThemeLight ? colorBorderSystem : "#405b5f"}`,
                                            "&:hover": {
                                                backgroundColor: isThemeLight ? "#f1f1f1" : "#405b5f",
                                                boxShadow: "none",
                                            },
                                        }}
                                        startIcon={
                                            notificationContent.is_external_link ? (
                                                <OpenInNewOutlinedIcon
                                                    sx={{ color: isThemeLight ? "text.secondary" : "#96afb3" }}
                                                />
                                            ) : (
                                                <OpenInBrowserOutlinedIcon
                                                    sx={{ color: isThemeLight ? "text.secondary" : "#96afb3" }}
                                                />
                                            )
                                        }
                                        onClick={() => handleClick(notificationContent)}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight='bold'
                                            color={isThemeLight ? "text.secondary" : "#96afb3"}>
                                            {notificationContent.is_external_link ? "Acessar Página" : "Acessar Módulo"}
                                        </Typography>
                                    </Button>
                                </Grid>
                            )}

                            {/* <Grid xs={12} marginBlock={1.5}>
                                <Grid xs={12} mb={1}>
                                    <Typography>Aceita a migração de carteira?</Typography>
                                </Grid>
                                <Box flex={1} display={"flex"} gap={0.75}>
                                    <Button
                                        variant='contained'
                                        color='success'
                                        size='medium'
                                        sx={{
                                            minWidth: 100,
                                            boxShadow: "none",
                                            backgroundColor: "#18da79",
                                            border: "1px solid #08b35d",
                                            "&:hover": {
                                                backgroundColor: "#08b35d",
                                                boxShadow: "none",
                                            },
                                            fontSize: 14,
                                            fontWeight: "bold",
                                            borderRadius: 1,
                                            textTransform: "inherit",
                                        }}>
                                        Sim
                                    </Button>
                                    <Button
                                        variant='contained'
                                        color='error'
                                        size='medium'
                                        sx={{
                                            minWidth: 100,
                                            boxShadow: "none",
                                            backgroundColor: "#f92f60",
                                            border: "1px solid #d61a49",
                                            "&:hover": {
                                                backgroundColor: "#d61a49",
                                                boxShadow: "none",
                                            },
                                            fontSize: 14,
                                            fontWeight: "bold",
                                            borderRadius: 1,
                                            textTransform: "inherit",
                                        }}>
                                        Não
                                    </Button>
                                </Box>
                            </Grid> */}

                            <LikeUnlike />

                            {notificationContent.notification_attachment &&
                                notificationContent.notification_attachment.length > 0 && (
                                    <>
                                        <Divider sx={{ marginTop: 1 }}>
                                            <Chip label='Anexos' size='small' />
                                        </Divider>
                                        <Grid container gap={2} mt={2.5}>
                                            {notificationContent.notification_attachment.map(
                                                ({ document_file }, index) => {
                                                    return (
                                                        <Fragment key={index}>
                                                            {existsImage(document_file.type) && (
                                                                <Grid item>
                                                                    <CardNotification
                                                                        id_document_file={document_file.id}
                                                                    />
                                                                </Grid>
                                                            )}

                                                            {!existsImage(document_file.type) && (
                                                                <Grid item>
                                                                    <Attachment
                                                                        key={notificationContent.id}
                                                                        downAction={() =>
                                                                            handleDownloadAttachament(document_file.id)
                                                                        }
                                                                        name={document_file.file_name}
                                                                    />
                                                                </Grid>
                                                            )}
                                                        </Fragment>
                                                    );
                                                },
                                            )}
                                        </Grid>
                                    </>
                                )}
                        </Grid>
                    </Grid>
                </>
            )}
        </>
    );
}
