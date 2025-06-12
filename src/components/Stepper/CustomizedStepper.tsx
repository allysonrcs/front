import * as React from "react";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { StepIconProps } from "@mui/material/StepIcon";
import { toast } from "react-toastify";
import { useGlobal } from "../../contexts/GlobalContext";

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: "linear-gradient(90deg, rgba(46,125,50,1)20%,rgba(54,119,122,1) 100%)",
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: "linear-gradient(90deg, rgba(46,125,50,1)20%,rgba(54,119,122,1) 100%)",
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
        borderRadius: 1,
    },
}));

const ColorlibStepIconRoot = styled("div")<{
    ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 50,
    height: 50,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    ...(ownerState.active && {
        backgroundImage: "linear-gradient(90deg, rgba(46,125,50,1)20%,rgba(54,119,122,1) 100%)",
        boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
    }),
    ...(ownerState.completed && {
        backgroundImage: "linear-gradient(90deg, rgba(46,125,50,1)20%,rgba(54,119,122,1) 100%)",
    }),
}));

function ColorlibStepIcon(props: StepIconProps & { icons: { [index: string]: React.ReactElement } }) {
    const { active, completed, className } = props;

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {props.icons[String(props.icon)]}
        </ColorlibStepIconRoot>
    );
}

export type StepperChildrenProps = {
    completed?: () => void;
    goBack?: () => void;
    saveData: (data: any) => void;
    onClose?: () => void;
    finalize: CallableFunction;
    dataSaved: any;
};

export default function CustomizedSteppers({
    children,
    steps,
    icons,
    onClose,
    onFinish,
}: {
    children: (props: StepperChildrenProps) => JSX.Element[];
    steps: string[];
    icons: { [index: string]: React.ReactElement };
    onClose?: () => void;
    onFinish?: () => void;
}) {
    const { getInfoError, toggleStatusBackdrop } = useGlobal();
    const [activeStep, setActiveStep] = React.useState(0);
    const [dataSaved, setDataSaved] = React.useState();

    const completed = () => setActiveStep((prev) => (prev += 1));

    function saveData(data: any): void {
        setDataSaved(data);
    }

    const goBack = () => {
        setActiveStep((prev) => (prev > 0 ? (prev -= 1) : 0));
    };

    const finalize = async (callback: CallableFunction) => {
        try {
            toggleStatusBackdrop();
            await callback();
            onFinish?.();
            onClose?.();
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const element = children({ completed, goBack, saveData, dataSaved, finalize }).find(
        (_, index) => index === activeStep,
    );

    return (
        <Stack sx={{ width: "100%" }} spacing={4}>
            <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel StepIconComponent={(props) => <ColorlibStepIcon {...props} icons={icons} />}>
                            {label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
            {element}
        </Stack>
    );
}
