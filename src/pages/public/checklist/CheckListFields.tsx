import { useNavigate, useParams } from "react-router-dom";
import { dataCheckListItems } from "./dataCheckList";
import { Box, Grid, IconButton, Typography } from "@mui/material";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import singLogo from "@/assets/images/sing-logo-branca.png";
import sicoobLogo from "@/assets/images/sicoob-accredi-logo-branco.png";
import logo_mind_branco from "@/assets/images/logo-mind-branco-horizontal.png";
import icon_sicoob from "@/assets/images/sicoob-icon.png";

export function CheckListFields() {
    const navigate = useNavigate();
    const { checklistName, sectorID } = useParams<{ checklistName: string; sectorID: string }>();
    const items = dataCheckListItems[checklistName ?? ""] || [];

    const currentYear = new Date().getFullYear();

    return (
        <>
            <Grid
                container
                component={"main"}
                sx={{
                    height: "100vh",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: "#00232b",
                }}>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0px 40px",
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "750px",
                        }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "column",
                                alignContent: "center",
                                marginBottom: 2,
                            }}>
                            <img style={{ width: "225px" }} src={singLogo} alt='' />
                        </Box>

                        <Typography variant='h5' color='white' mb={3}>
                            {checklistName}
                        </Typography>

                        {items.map((item, index) => (
                            <li key={index} style={{ color: "white", listStyle: "none" }}>
                                <input type='checkbox' />
                                <label style={{ marginLeft: 8 }}>{item}</label>
                            </li>
                        ))}

                        <img style={{ width: "150px", marginTop: 25 }} src={sicoobLogo} alt='' />

                        <Grid container justifyContent='center' marginBlock={3}>
                            <Typography
                                variant='body2'
                                color='white'
                                align='center'
                                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                © {currentYear} {import.meta.env.VITE_APP_NAME.toUpperCase()}{" "}
                                {import.meta.env.VITE_APP_VERSION} -{" "}
                                <img
                                    style={{
                                        height: "1.20em",
                                        verticalAlign: "middle",
                                        display: "inline-block",
                                    }}
                                    src={logo_mind_branco}
                                    alt='Logo MIND'
                                />{" "}
                                |{" "}
                                <img
                                    style={{
                                        height: "1.20em",
                                        verticalAlign: "middle",
                                        display: "inline-block",
                                    }}
                                    src={icon_sicoob}
                                    alt='Icone Sicoob'
                                />{" "}
                                Ac Credi
                            </Typography>
                        </Grid>

                        <IconButton
                            sx={{ padding: 0, color: "white" }}
                            component='span'
                            onClick={() => {
                                navigate(-1);
                            }}>
                            <ArrowCircleLeftOutlinedIcon />
                            <Typography ml={1}>Voltar</Typography>
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>
        </>
    );
}
