import { useEffect, useState } from "react";
import { useGlobal } from "@/contexts/GlobalContext";
import { Box, Grid, useTheme } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { BirthdayAnimation } from "@/components/BirthdayAnimation/BirthdayAnimation";
import { toast } from "react-toastify";
import { WelcomeMessage } from "./components/WelcomeMessage";
import { InsightsListPanel } from "./components/InsightsListPanel";
import { ProductivityDailyCardsPanel } from "./components/ProductivityDailyCardsPanel";
import { CoopMais } from "@/components/CoopMais/CoopMais";
import { TabHomeOptions } from "./Tabs/TabHomeOptions";
import { CardsFinancialAPI } from "./widgets/CardsFinancialAPI";
import { IListBanners, searchListActiveBanners } from "@/services/homepage-config";
import BannerCarousel from "./components/BannerCarousel";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";

export function Welcome({}) {
    const [loading, setLoading] = useState(false);
    const [listBanner, setListBanner] = useState<IListBanners[]>([]);
    const [visualized, setVisualized] = useState<boolean>(false);

    const { user } = useAuth();
    const { getInfoError, theme: themeContext, colorBorderSystem, isSidebarOpen } = useGlobal();
    const themeUI = useTheme();

    const isThemeLight = themeContext === "light";

    const currentURL = window.location.href;
    const url = new URL(currentURL);

    async function fetchListBanners() {
        try {
            setLoading(true);

            setListBanner(await searchListActiveBanners({ is_active: true }));
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchListBanners();
        };

        fetchData();
    }, []);

    return (
        <>
            {user && user.is_birthday && !visualized && (
                <BirthdayAnimation name={user.name.split(" ")[0]} onFinish={() => setVisualized(true)} />
            )}

            {user && (
                <>
                    <Grid container paddingInline={4} paddingTop={2}>
                        <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
                            <WelcomeMessage
                                user={{
                                    name: user.name,
                                    agency: user.agency_name,
                                    portfolio: user.portfolio_name || "",
                                }}
                            />

                            {url.pathname && (
                                <CSATAverageRating
                                    module={"Home"}
                                    routePath={`${url.pathname}`}
                                    isClickable
                                    formProps={{
                                        module: "Home",
                                        routePath: `${url.pathname}`,
                                    }}
                                />
                            )}
                        </Box>
                    </Grid>

                    <Grid container item xs={12} paddingInline={4} mt={1.5}>
                        <BannerCarousel banners={listBanner} loading={loading} />
                    </Grid>

                    <Grid
                        container
                        mt={1}
                        paddingInline={4}
                        spacing={!isSidebarOpen ? 2 : 1}
                        mb={!isSidebarOpen ? 3 : -1}>
                        <Grid item container xs={12} md={12} mb={1} spacing={2}>
                            <CoopMais userDate={user} />
                        </Grid>

                        <Grid item xs={12} sm={12} md={9} mt={2}>
                            <Grid item xs={12} mb={!isSidebarOpen ? 2 : 1}>
                                <ProductivityDailyCardsPanel
                                    colorBorderSystem={colorBorderSystem}
                                    isThemeLight={isThemeLight}
                                    isSidebarOpen={isSidebarOpen}
                                />
                            </Grid>

                            <TabHomeOptions
                                userDate={user}
                                colorBorderSystem={colorBorderSystem}
                                isThemeLight={isThemeLight}
                                isSidebarOpen={isSidebarOpen}
                                themeUI={themeUI}
                                themeContext={themeContext}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={3} mt={2}>
                            <InsightsListPanel
                                colorBorderSystem={colorBorderSystem}
                                isThemeLight={isThemeLight}
                                isSidebarOpen={isSidebarOpen}
                            />
                        </Grid>
                    </Grid>
                </>
            )}

            <CardsFinancialAPI isSidebarOpen={isSidebarOpen} />
        </>
    );
}
