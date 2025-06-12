import "@/styles/global.scss";

import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers";

import { AuthContextProvider } from "@/contexts/AuthContext";
import { GlobalContextProvider } from "@/contexts/GlobalContext";

import Route from "@/routers/route";
import { MediaQueryContextProvider } from "@/contexts/MediaQueryContext";

function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <AuthContextProvider>
                <GlobalContextProvider>
                    <MediaQueryContextProvider>
                        <Route />
                    </MediaQueryContextProvider>
                </GlobalContextProvider>
            </AuthContextProvider>
        </LocalizationProvider>
    );
}

export default App;
