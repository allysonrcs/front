import { FC } from "react";
import { useFormContext, Controller, get } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";
import InputMask from "react-input-mask";

type FormInputProps = {
    name: string;
    mask: string;
    disabledInput?: boolean;
} & TextFieldProps;

const FormInputMask: FC<FormInputProps> = ({ mask, name, disabledInput = false, ...props }) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const error = get(errors, name);

    return (
        <Controller
            name={name as any}
            control={control}
            defaultValue=''
            render={({ field: { onChange, value } }) => (
                <InputMask mask={mask} value={value} disabled={disabledInput || props.disabled} onChange={onChange}>
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
