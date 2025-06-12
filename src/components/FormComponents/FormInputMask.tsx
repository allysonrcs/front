import { FC } from "react";
import InputMask from "react-input-mask";
import { Controller, get } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";

type FormInputMaskProps = {
    name: string;
    control: any;
    errors: any;
    mask: string;
    disabledInput?: boolean;
} & TextFieldProps;

const FormInputMask: FC<FormInputMaskProps> = ({ name, control, errors, mask, disabledInput = false, ...props }) => {
    const error = get(errors, name);

    return (
        <Controller
            name={name as any}
            control={control}
            defaultValue=''
            render={({ field: { onChange, value } }) => (
                <InputMask mask={mask} value={value} onChange={onChange} disabled={disabledInput || props.disabled}>
                    {/* @ts-ignore */}
                    <TextField
                        fullWidth
                        error={!!error}
                        helperText={error ? error.message : ""}
                        sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                        {...props}
                    />
                </InputMask>
            )}
        />
    );
};

export default FormInputMask;
