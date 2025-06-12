import { ReactElement } from "react";
import {
    HelpOutlineOutlined,
    SearchOffOutlined,
    PsychologyAltOutlined,
    HourglassBottomOutlined,
    HighlightOffOutlined,
    ThumbDownOutlined,
    TaskOutlined,
    TravelExploreOutlined,
    CheckCircleOutlineOutlined,
    BoltOutlined,
    DevicesOutlined,
    ThumbUpAltOutlined,
} from "@mui/icons-material";

export const improvementOptions: { label: string; icon: ReactElement }[] = [
    { label: "Informações confusas", icon: <HelpOutlineOutlined /> },
    { label: "Difícil de encontrar", icon: <SearchOffOutlined /> },
    { label: "Difícil de usar", icon: <PsychologyAltOutlined /> },
    { label: "Foi demorado", icon: <HourglassBottomOutlined /> },
    { label: "Site/aplicativo não funcionou bem", icon: <HighlightOffOutlined /> },
    { label: "Não foi útil", icon: <ThumbDownOutlined /> },
];

export const positiveOptions: { label: string; icon: ReactElement }[] = [
    { label: "Informações claras", icon: <TaskOutlined /> },
    { label: "Fácil de encontrar", icon: <TravelExploreOutlined /> },
    { label: "Fácil de usar", icon: <CheckCircleOutlineOutlined /> },
    { label: "Foi rápido", icon: <BoltOutlined /> },
    { label: "Site/aplicativo funcionou bem", icon: <DevicesOutlined /> },
    { label: "Foi útil", icon: <ThumbUpAltOutlined /> },
];
