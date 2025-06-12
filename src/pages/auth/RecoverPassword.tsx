import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useGlobal } from "@/contexts/GlobalContext";
import { recoverPassword } from "@/services/auth";
import { useState } from "react";
import logoSING from "@/assets/images/sing-logo-colorida.png";
import photoFelipe from "@/assets/images/foto-felipe.jpg";
import iconTeams from "@/assets/images/icon-teams.png";
import logo_mind_colorido from "@/assets/images/logo-mind-colorido-horizontal.png";
import icon_sicoob from "@/assets/images/sicoob-icon.png";

type RecoverPasswordPros = {
    email: string;
};

export function RecoverPassword() {
    const [loading, setLoading] = useState<boolean>(false);

    const { getInfoError } = useGlobal();
    const navigate = useNavigate();

    const currentYear = new Date().getFullYear();

    const validationSchema = Yup.object().shape({
        email: Yup.string().required("E-mail é obrigatório!").email("E-mail inválido"),
    });

    const { handleSubmit } = useForm({ resolver: yupResolver(validationSchema) });

    const onSubmit = async (data: RecoverPasswordPros) => {
        try {
            setLoading(true);

            await recoverPassword(data);

            toast.success("Email enviado com sucesso!", { autoClose: 3000 });
            navigate("/auth/login");
        } catch (error) {
            setLoading(false);
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const mockUser = {
        name: "Felipe Murta de Tassis",
        email: "felipem4071@sicoob.com.br",
        photo: photoFelipe,
    };

    const teamsLink = `https://teams.microsoft.com/l/chat/0/0?users=${mockUser.email}`;

    return (
        <Container component='main' maxWidth='md'>
            <Box
                sx={{
                    width: "100%",
                    my: 20,
                    mx: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 2,
                    }}>
                    <img style={{ width: "250px" }} src={logoSING} alt='' />
                </Box>

                <Box component='form' noValidate onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 400 }}>
                    <Typography textAlign={"center"} sx={{ color: "#707070", mb: 3 }}>
                        Selecione um dos nossos analistas abaixo para iniciar uma conversa no Microsoft Teams e obter
                        suporte.
                    </Typography>

                    <Grid item xs={12} mb={2}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}>
                            <Box
                                sx={{
                                    border: "1px solid #ddd",
                                    padding: "16px",
                                    borderRadius: "8px",
                                    maxWidth: "450px",
                                }}>
                                <img
                                    src={mockUser.photo}
                                    alt={`${mockUser.name}'s profile`}
                                    style={{ width: "80px", height: "80px", borderRadius: "50%", marginBottom: "12px" }}
                                />
                                <Typography fontSize={20} fontWeight={700} style={{ margin: "2px 0" }}>
                                    {mockUser.name}
                                </Typography>
                                <Typography fontSize={12} color='text.secondary' mb={2}>
                                    Analista de Desenvolvimento
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <img style={{ width: "32px" }} src={iconTeams} alt='' />
                                    <a
                                        href={teamsLink}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        style={{
                                            color: "#0078d4",
                                            textDecoration: "none",
                                            fontSize: "16px",
                                        }}>
                                        Conversar com Felipe
                                    </a>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid container justifyContent='center'>
                        <Grid item>
                            <Link to='/auth/login'>
                                <Typography sx={{ mb: 3, color: "#00A494" }}>Retornar para página de login</Typography>
                            </Link>
                        </Grid>
                    </Grid>
                </Box>

                <Grid container justifyContent='center'>
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        align='center'
                        fontSize={12}
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        © {currentYear} {import.meta.env.VITE_APP_NAME.toUpperCase()}{" "}
                        {import.meta.env.VITE_APP_VERSION} -{" "}
                        <img
                            style={{
                                height: "1.20em",
                                verticalAlign: "middle",
                                display: "inline-block",
                            }}
                            title={"Desenvolvido pela equipe MIND"}
                            src={logo_mind_colorido}
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
            </Box>
        </Container>
    );
}
