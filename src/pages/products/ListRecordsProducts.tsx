import { Breadcrumbs, Divider, Grid, Tab, Tabs, Typography } from "@mui/material";
import { TabProducts } from "./tabs/TabProducts";
import { TabProductsModalities } from "./tabs/TabProductsModalities";
import { BoxMain } from "@/components/Box/BoxMain";
import { useLocation, Link } from "react-router-dom";
import { TabContext, TabPanel } from "@mui/lab";
import { useGlobal } from "@/contexts/GlobalContext";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export function ListRecordsProducts({ updateColumnAgent, id_agent, ...props }: any) {
    const { pathname } = useLocation();
    const { theme } = useGlobal();

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12}>
                    <Breadcrumbs aria-label='breadcrumb' separator='›'>
                        <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }} pt={1}>
                            <SettingsOutlinedIcon sx={{ color: theme === "light" ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                            Funções Administrativas
                        </Typography>
                        <Typography color='text.secondary'>Produtos</Typography>
                    </Breadcrumbs>
                </Grid>
            </Grid>

            <BoxMain isDivider={false} pt={0} mt={0}>
                <TabContext value={pathname}>
                    <Tabs
                        orientation='horizontal'
                        value={pathname}
                        variant='fullWidth'
                        scrollButtons
                        aria-label='scrollable force tabs example'
                        allowScrollButtonsMobile>
                        <Tab
                            label='Produtos'
                            component={Link}
                            to='/funcoes-administrativas/produtos'
                            value='/funcoes-administrativas/produtos'
                        />
                        <Tab
                            label='Modalidades'
                            component={Link}
                            to='/funcoes-administrativas/produtos/modalidades'
                            value='/funcoes-administrativas/produtos/modalidades'
                        />
                    </Tabs>

                    <Divider />

                    <TabPanel value='/funcoes-administrativas/produtos' sx={{ padding: 0 }}>
                        {pathname === "/funcoes-administrativas/produtos" && <TabProducts />}
                    </TabPanel>

                    <TabPanel value='/funcoes-administrativas/produtos/modalidades' sx={{ padding: 0 }}>
                        {pathname === "/funcoes-administrativas/produtos/modalidades" && <TabProductsModalities />}
                    </TabPanel>
                </TabContext>
            </BoxMain>
        </>
    );
}
