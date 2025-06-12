import { FC } from "react";
import { Controller, get } from "react-hook-form";
import { InputBase, InputBaseProps, SxProps } from "@mui/material";

type FormInputBaseProps = {
    name: string;
    control: any;
    errors: any;
    defaultValue: string;
} & InputBaseProps;

const SImputColor: SxProps = {
    "& input": {
        width: "20px",
        borderRadius: "5px",
        border: "solid 2px #9e9e9e99",
        padding: "0px 2px",
    },
};

export const FormInputBase: FC<FormInputBaseProps> = ({ name, control, errors, defaultValue, ...props }) => {
    const error = get(errors, name);

    return (
        <Controller
            name={name as any}
            control={control}
            defaultValue={defaultValue}
            render={({ field: { onChange, value } }) => {
                if (props.type === "color") {
                    return <InputBase {...props} sx={SImputColor} value={value} onChange={onChange} error={!!error} />;
                } else {
                    return <InputBase {...props} value={value} onChange={onChange} error={!!error} />;
                }
            }}
        />
    );
};
