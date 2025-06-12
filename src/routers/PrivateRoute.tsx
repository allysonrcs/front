import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, Modal, Grid, Button } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/system";
import Backdrop from "@mui/material/Backdrop";
import { ConfirmProvider } from "material-ui-confirm";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobal } from "@/contexts/GlobalContext";
import { NotFound } from "@/pages/NotFound";
import MyPage from "./routePage";
import { DarkTheme, LightTheme } from "@/themes";
import { Nav } from "@/components/Nav/Nav";
import { Login } from "@/components/Modal/Login/Login";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { TwoFactor } from "@/components/Modal/Auth/TwoFactor/TwoFactor";
import { Welcome } from "@/pages/home/Welcome";
import { findAllAccessPage } from "@/services/access-pages";
import { getPublicKey } from "@/services/auth";
import { PUBLIC_KEY } from "@/constants/local-storage";
import { UpdateMyProfile } from "@/pages/peoples/UpdateMyProfile";
import MiniSideBar from "@/components/Sidebar/MiniSideBar";
import ChangePassword from "@/components/Modal/Auth/ChangePassword/ChangePassword";
import logoSicoobGIF from "@/assets/images/sicoob-loading.gif";
import { Footer } from "@/components/Footer/Footer";
import { MyNotifications } from "@/pages/notifications/MyNotifications";

const PrivateRoute = () => {
    const { user, routes, saveRoute, toogleTokenAuthorization } = useAuth();
    const [toastId, setToastId] = useState<any>(null);
    const {
        theme,
        isBackdropOpen,
        showModalLogin,
        showModalTowFactor,
        getInfoError,
        toggleStatusBackdrop,
        toggleStatusModalTowFactor,
        toggleStatusModalLogin,
    } = useGlobal();
    const { isSupportedNotification } = useGlobal();

    const themeSelected = useMemo(() => {
        if (theme === "light") {
            return LightTheme;
        } else {
            return DarkTheme;
        }
    }, [theme]);

    const handleCloseModalTowFactor = (clearHeader: boolean = false) => {
        if (clearHeader) {
            toogleTokenAuthorization("");
        } else {
            toggleStatusModalLogin();
        }

        toggleStatusModalTowFactor();
    };

    useEffect(() => {
        async function execute() {
            toggleStatusBackdrop();

            try {
                const data = await findAllAccessPage();
                saveRoute(data);

                const publicKey = await getPublicKey();
                sessionStorage.setItem(window.btoa(PUBLIC_KEY), publicKey);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }

        execute();
    }, []);

    function notifyMe() {
        if (isSupportedNotification()) {
            if (Notification.permission === "default") {
                Notification.requestPermission();
            }
        }
        closeNotifyme();
    }

    function closeNotifyme() {
        toast.dismiss(toastId);
        setToastId(null);
    }

    useEffect(() => {
        if (isSupportedNotification()) {
            if (Notification.permission === "default") {
                const id = toast.info(<ToastContent />, {
                    position: toast.POSITION.BOTTOM_CENTER,
                    autoClose: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: false,
                    closeButton: false,
                    onClose: () => setToastId(null),
                });
                setToastId(id);
            } else if (Notification.permission === "denied") {
                toast.warning(
                    "Suas notificações estão desativadas! Para um melhor uso do sistema, recomendamos ativar as notificações.",
                    {
                        autoClose: 10000,
                    },
                );
            }
        }
    }, []);

    function ToastContent() {
        return (
            <Grid style={{ width: "100%", margin: "0 auto" }}>
                Deseja habilitar as notificações para receber mensagens?
                <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                    <Button
                        sx={{ mt: 0.5 }}
                        color={"success"}
                        onClick={notifyMe}
                        className='notificacao-button'
                        variant='contained'
                        title='Salvar'>
                        Habilitar
                    </Button>

                    <Button
                        sx={{ mt: 0.5 }}
                        color={"error"}
                        onClick={closeNotifyme}
                        className='notificacao-button'
                        variant='contained'
                        title='Salvar'>
                        Agora não
                    </Button>
                </Box>
            </Grid>
        );
    }

    return (
        <ThemeProvider theme={themeSelected}>
            <CssBaseline />
            <ConfirmProvider
                defaultOptions={{
                    dialogProps: { style: { alignContent: "space-around" } },
                    confirmationButtonProps: { autoFocus: true },
                    cancellationButtonProps: { color: "inherit" },
                    cancellationText: "Cancelar",
                    confirmationText: "Confirmar",
                }}>
                <Box width='100vw' height='100%'>
                    <BrowserRouter>
                        <MiniSideBar>
                            <Nav />

                            <Box height='100%' overflow='auto'>
                                {routes && routes.length > 0 && (
                                    <Routes>
                                        {routes
                                            .filter((value) => value.component)
                                            .map((route) => (
                                                <Route
                                                    key={route.route}
                                                    path={route.route}
                                                    element={<MyPage tag={route.component} />}
                                                />
                                            ))}
                                        {routes
                                            .filter((value) => value.routes)
                                            .map((route) =>
                                                route.routes?.map((value) => {
                                                    return (
                                                        <>
                                                            <Route
                                                                key={value.route}
                                                                path={value.route}
                                                                element={<MyPage tag={value.component} />}
                                                            />
                                                            {value.routes &&
                                                                value.routes.map((subroute) => (
                                                                    <Route
                                                                        key={subroute.route}
                                                                        path={subroute.route}
                                                                        element={<MyPage tag={subroute.component} />}
                                                                    />
                                                                ))}
                                                        </>
                                                    );
                                                }),
                                            )}
                                        <Route path='/' element={<Navigate replace to='/bem-vindo' />} />
                                        <Route path='/bem-vindo' element={<Welcome />} />
                                        <Route path='/meu-perfil' element={<UpdateMyProfile />} />
                                        <Route path='/notificacoes' element={<MyNotifications />} />
                                        <Route path='*' element={<NotFound />} />
                                    </Routes>
                                )}

                                <Footer mb={2} />
                            </Box>
                        </MiniSideBar>

                        <Modal open={showModalLogin}>
                            <Box>
                                <Login />
                            </Box>
                        </Modal>

                        <Modal open={showModalTowFactor}>
                            <Box>
                                <BoxModal
                                    title='Autenticação de dois fatores'
                                    width='35%'
                                    handleClose={() => {
                                        handleCloseModalTowFactor(true);
                                    }}>
                                    <TwoFactor
                                        handleClose={handleCloseModalTowFactor}
                                        data={{
                                            name: user?.name,
                                            email: user?.email,
                                        }}
                                    />
                                </BoxModal>
                            </Box>
                        </Modal>

                        {user && (
                            <Modal open={user.is_first_password}>
                                <Box>
                                    <ChangePassword closeButton={false} />
                                </Box>
                            </Modal>
                        )}
                    </BrowserRouter>

                    <Backdrop
                        sx={{
                            color: "#fff",
                            zIndex: (theme) => theme.zIndex.drawer + 99999,
                        }}
                        open={isBackdropOpen}>
                        <img src={logoSicoobGIF} alt='Loading...' style={{ width: "100px", height: "100px" }} />
                    </Backdrop>
                </Box>
            </ConfirmProvider>
        </ThemeProvider>
    );
};

export default PrivateRoute;
