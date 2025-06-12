import { Grid, GridProps, Typography } from "@mui/material";

import logo_mind_branco from "@/assets/images/logo-mind-branco-horizontal.png";
import logo_mind_colorido from "@/assets/images/logo-mind-colorido-horizontal.png";
import icon_sicoob from "@/assets/images/sicoob-icon.png";
import { useGlobal } from "@/contexts/GlobalContext";
import { useMediaQuery } from "@/contexts/MediaQueryContext";

type FooterProps = GridProps;

export function Footer({ ...props }: FooterProps) {
    const { theme } = useGlobal();
    const { device } = useMediaQuery();

    const currentYear = new Date().getFullYear();

    return (
        <Grid container justifyContent='center' {...props}>
            <Typography
                variant='body2'
                color='text.secondary'
                align='center'
                fontSize={12}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                © {currentYear} {import.meta.env.VITE_APP_NAME.toUpperCase()} {import.meta.env.VITE_APP_VERSION} -{" "}
                {device === "Mobile" ? null : "Desenvolvido por"}{" "}
                <img
                    style={{
                        height: "1.20em",
                        verticalAlign: "middle",
                        display: "inline-block",
                    }}
                    src={theme === "light" ? logo_mind_colorido : logo_mind_branco}
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
    );
}
