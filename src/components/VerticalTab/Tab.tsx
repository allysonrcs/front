import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { BoxModal } from "../BoxModal/BoxModal";
import { TabPanel } from "./TabPanel";
import MyComponent from "../component";

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        "aria-controls": `vertical-tabpanel-${index}`,
    };
}

type ITab = {
    label: string;
    nameComponent: string;
};

type Props = {
    title: string;
    arrayTab: ITab[];
    onClose?: () => void;
};

export default function VerticalTabs({ arrayTab, onClose, title }: Props) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <BoxModal title={title} handleClose={onClose}>
            <Box sx={{ flexGrow: 1, display: "flex", width: "90vw", justifyContent: "space-around" }}>
                <Tabs
                    orientation='vertical'
                    variant='scrollable'
                    value={value}
                    onChange={handleChange}
                    aria-label='Vertical tabs example'
                    sx={{ borderRight: 1, borderColor: "divider" }}>
                    {arrayTab.map(({ label, nameComponent }, index) => (
                        <Tab
                            {...a11yProps(index)}
                            sx={{ alignItems: "flex-start" }}
                            label={label}
                            key={nameComponent}
                        />
                    ))}
                </Tabs>

                {arrayTab.map(({ label, nameComponent }, index) => (
                    <TabPanel key={nameComponent} value={value} index={index} title={label}>
                        <MyComponent tag={nameComponent} />
                    </TabPanel>
                ))}
            </Box>
        </BoxModal>
    );
}
