import { Box, Container, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import SVG404Error from "@/assets/images/error-404.svg?react";

export function NotFound() {
    return (
        <Container component='main' maxWidth='md'>
            <Grid
                container
                maxWidth='xs'
                sx={{
                    justifyContent: "center",
                }}>
                <Box
                    sx={{
                        height: "calc(100vh - 126px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                    }}>
                    <SVG404Error height={400} />

                    <Grid
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}>
                        <Typography fontSize={30} sx={{ fontFamily: "Roboto, sans-serif" }}>
                            Página não encontrada
                        </Typography>
                        <Typography sx={{ fontFamily: "Roboto, sans-serif" }}>
                            Voltar para o{" "}
                            <Link to='/' style={{ fontWeight: 900, color: "#00AE9D" }}>
                                início
                            </Link>
                        </Typography>
                    </Grid>
                </Box>
            </Grid>
        </Container>
    );
}
