import { Box } from "@mui/material";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    title: string;
}

export function TabPanel(props: TabPanelProps) {
    const { children, value, index, title, ...other } = props;

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}>
            {value === index && <Box sx={{ padding: "16px 24px", height: "65vh", width: "71vw" }}>{children}</Box>}
        </div>
    );
}
