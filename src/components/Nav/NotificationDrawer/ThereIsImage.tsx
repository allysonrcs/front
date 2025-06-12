import { Grid, Typography, useMediaQuery } from "@mui/material";
import { NotificationsOffOutlined } from "@mui/icons-material";
import NotificationSVG from "@/assets/images/flat-notificacao.svg?react";

export function ThereIsImage() {
    const is601pxHeight = useMediaQuery("(max-height:601px)");

    return (
        <Grid item flexDirection='column' justifyContent='space-between' pt={3}>
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
                    🔔 Nenhuma notificação no momento
                </Typography>

                <Typography
                    color='text.secondary'
                    sx={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        textAlign: "center",
                        ...(is601pxHeight && {
                            display: "none",
                        }),
                    }}>
                    Estamos ansiosos para compartilhar <br /> nossas notícias com você.
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
                <NotificationSVG height={300} />
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
    );
}
