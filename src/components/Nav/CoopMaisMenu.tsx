import { useEffect, useState } from "react";
import coop_mais_colorido from "@/assets/images/coop-mais-colorido.png";
import coop_mais_branco from "@/assets/images/coop-mais-branco.png";
import { useGlobal } from "@/contexts/GlobalContext";
import { ISearchAllReportsCatalog, searchAllReportsCatalogRecords } from "@/services/reports";
import { Box, Grid, IconButton, Skeleton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CoopMaisMenu() {
    const [loading, setLoading] = useState(false);
    const [dashbordCoopMais, setDashbordCoopMais] = useState<ISearchAllReportsCatalog[]>([]);

    const { getInfoError, theme } = useGlobal();
    const navigate = useNavigate();

    useEffect(() => {
        async function execute() {
            try {
                setLoading(true);

                setDashbordCoopMais(
                    await searchAllReportsCatalogRecords({
                        title: "COOP+ 2025",
                        card_type: "DASHBOARD",
                    }),
                );
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                setLoading(false);
            }
        }

        execute();
    }, []);

    return (
        <>
            {loading ? (
                <Grid item ml={1}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                        title='Link Coop+ Carregando...'>
                        <Skeleton
                            variant='circular'
                            animation='wave'
                            sx={{
                                height: "25px",
                                width: "25px",
                            }}
                        />
                    </Box>
                </Grid>
            ) : (
                <Grid item ml={1}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            textAlign: "center",
                        }}>
                        <Tooltip title={dashbordCoopMais[0] ? dashbordCoopMais[0].title : "Coop+"}>
                            <IconButton
                                onClick={() => {
                                    navigate(
                                        dashbordCoopMais[0]
                                            ? `/relatorios/catalogo/dashboard/${dashbordCoopMais[0].id}`
                                            : "/relatorios/catalogo",
                                    );
                                }}
                                size='small'>
                                <img
                                    style={{ height: "25px", maxWidth: "100%", objectFit: "contain" }}
                                    src={theme === "light" ? coop_mais_colorido : coop_mais_branco}
                                    alt='Coop+ 2025'
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Grid>
            )}
        </>
    );
}
