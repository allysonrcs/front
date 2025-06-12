import { Box, BoxProps } from "@mui/material";
import { chart } from "../config";
import { createRef, useEffect, useState } from "react";
import { useGlobal } from "@/contexts/GlobalContext";
import { ECBasicOption } from "echarts/types/dist/shared";

type ChartProps = {
    options: ECBasicOption;
} & BoxProps;

export const Chart = ({ ...props }: ChartProps) => {
    const ref = createRef<HTMLDivElement>();
    const { theme } = useGlobal();
    const [resize, setResize] = useState<UIEvent>();

    window.addEventListener("resize", setResize);

    useEffect(() => {
        if (ref.current) {
            chart.dispose(ref.current);
            const agentChart = chart.init(ref.current, theme, { renderer: "canvas" });
            agentChart.setOption({
                ...props.options,
                backgroundColor: theme === "light" ? "#ffffff" : "transparent",
            });
            agentChart.resize({
                width: ref.current.clientWidth,
                height: ref.current.clientHeight,
            });
        }
    }, [ref.current, theme, resize, props.options]);

    return <Box component={"div"} ref={ref} {...props} />;
};
