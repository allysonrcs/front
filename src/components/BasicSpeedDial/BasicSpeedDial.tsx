import SpeedDial, { SpeedDialProps } from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";

type BasicSpeedDialProps = {
    actions: {
        icon: JSX.Element;
        name: string;
        click_event: () => void;
        bgColor?: string;
        textColor?: string;
        borderColor?: string;
        boxShadow?: string;
    }[];
} & SpeedDialProps;

export function BasicSpeedDial({ actions, ...props }: BasicSpeedDialProps) {
    return (
        <SpeedDial icon={<SpeedDialIcon />} {...props}>
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.click_event}
                    sx={{
                        border: action.borderColor ? `1px solid ${action.borderColor}` : "1px solid #009688",
                        backgroundColor: action.bgColor || "none",
                        color: action.textColor || "inherit",
                        boxShadow: action.boxShadow ? `0 0 7px 1px ${action.boxShadow}77` : "0 0 7px 1px #0096876f",
                        "&:hover": {
                            backgroundColor: action.bgColor,
                            opacity: 0.9,
                        },
                    }}
                />
            ))}
        </SpeedDial>
    );
}
