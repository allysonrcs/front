import { createContext, useContext, useEffect, useState } from "react";

type DeviceProps = "Mobile" | "Tablet" | "Desktop";

type ScreenProps = {
    innerWidth: number;
    innerHeight: number;
    event: UIEvent;
};

type BreakpointsPros = {
    mobile: number;
    tablet: number;
    desktop: number;
};

type Props = {
    children: React.ReactNode;
};

type MediaQueryContextType = {
    screen: ScreenProps;
    breakpoints: BreakpointsPros;
    setBreakpoints: React.Dispatch<React.SetStateAction<BreakpointsPros>>;
    device: DeviceProps;
    deviceOS: DeviceProps
};

const MediaQueryContext = createContext<MediaQueryContextType>({} as MediaQueryContextType);

export function MediaQueryContextProvider({ children }: Props) {
    const [screen, setScreen] = useState<ScreenProps>({} as ScreenProps);
    const [deviceOS, setDeviceOS] = useState<DeviceProps>("Mobile");
    const [breakpoints, setBreakpoints] = useState<BreakpointsPros>({
        mobile: 767,
        tablet: 1023,
        desktop: 1023,
    });

    const getDevice = () => {
        if (window.innerWidth < breakpoints.mobile) {
            return "Mobile";
        }

        if (window.innerWidth >= breakpoints.mobile + 1 && window.innerWidth < breakpoints.tablet) {
            return "Tablet";
        }

        return "Desktop";
    };

    const [device, setDevice] = useState<DeviceProps>(getDevice());

    const deviceType = () => {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return "Tablet";
        }
        else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return "Mobile";
        }
        return "Desktop";
    };

    useEffect(() => {
        if (!screen.innerHeight && !screen.innerWidth) {
            setScreen((prev) => ({
                ...prev,
                innerHeight: window.screen.height,
                innerWidth: window.screen.width,
            }));
        }

        setDeviceOS(deviceType())

        window.addEventListener("resize", (event) => {
            const { target }: any = event;
            setScreen((prev) => ({
                ...prev,
                event,
                innerHeight: target.innerHeight,
                innerWidth: target.innerWidth,
            }));

            if (target.innerWidth < breakpoints.mobile) {
                setDevice("Mobile");
            } else if (target.innerWidth >= breakpoints.mobile + 1 && target.innerWidth < breakpoints.tablet) {
                setDevice("Tablet");
            } else if (target.innerWidth > breakpoints.mobile) {
                setDevice("Desktop");
            }
        });
    }, []);

    return (
        <MediaQueryContext.Provider
            value={{
                breakpoints,
                screen,
                setBreakpoints,
                device,
                deviceOS,
            }}>
            {children}
        </MediaQueryContext.Provider>
    );
}

export function useMediaQuery() {
    const context = useContext(MediaQueryContext);
    return context;
}
