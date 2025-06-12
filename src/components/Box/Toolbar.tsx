import { Box, Button, Icon } from "@mui/material";

type ButtonProps = {
    icon: string;
    color?: string;
    label: string;
    onClick: () => void;
};
type ToolbarProps = {
    buttons: ButtonProps[];
};
export function Toolbar({ buttons }: ToolbarProps) {
    return (
        <Box gap={1} paddingX={0} display='flex' alignItems='center'>
            <Box flex={1} display='flex' justifyContent='flex-end'>
                {buttons.map((button, _, array) => (
                    <Button
                        style={array.length > 1 ? { margin: "0 5px" } : {}}
                        disableElevation
                        key={button.label}
                        color={"primary"}
                        variant='contained'
                        onClick={button.onClick}
                        startIcon={<Icon>{button.icon}</Icon>}>
                        {button.label}
                    </Button>
                ))}
            </Box>
        </Box>
    );
}
