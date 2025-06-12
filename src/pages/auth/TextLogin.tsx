import { Box, Typography } from "@mui/material";
import icon_sicoob from "@/assets/images/sicoob-icon.png";

export function TextLogin() {
    return (
        <>
            <Box
                sx={{
                    position: "absolute",
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "18rem",
                    marginLeft: "4rem",
                    marginRight: "4rem",
                    zIndex: "10",
                }}>
                <Typography sx={{ fontSize: "40px", color: "#ffffff", fontWeight: "bold", mb: 1 }}>
                    👋 Olá, bem-vindo(a) ao SING
                </Typography>
                <Typography sx={{ color: "#fff", mb: 1.5, fontSize: "18px", fontWeight: "400" }}>
                    O portal exclusivo para colaboradores da{" "}
                    <img
                        style={{
                            height: "1.20em",
                            verticalAlign: "middle",
                            display: "inline-block",
                        }}
                        src={icon_sicoob}
                        alt='Icone Sicoob'
                    />{" "}
                    Sicoob Ac Credi.
                </Typography>
                <Typography sx={{ color: "#fff", fontSize: "18px", fontWeight: "400" }} textAlign={"justify"}>
                    Este sistema de informação de negócios e gestão foi desenvolvido para apoiar você, fornecendo
                    relatórios detalhados, dashboards interativos e acesso a módulos específicos de cada departamento.
                    Utilize o SING para acompanhar sua carteira de cooperados e otimizar a experiência administrativa de
                    nossos cooperados e/ou funcionários.
                </Typography>
            </Box>
        </>
    );
}
