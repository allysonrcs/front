import { FC } from "react";
import { useFormContext, Controller, get } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";

type FormInputProps = {
    name: string;
} & TextFieldProps;

const FormInput: FC<FormInputProps> = ({ name, ...props }) => {
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
                <TextField
                    {...props}
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    helperText={error ? error.message : ""}
                    sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                />
            )}
        />
    );
};

export default FormInput;
