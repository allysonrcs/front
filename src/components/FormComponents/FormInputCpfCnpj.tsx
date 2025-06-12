import { FC } from "react";
import { Controller, get } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";

const cpfMask = (value: string) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
};

const cnpjMask = (value: string) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{4})/, "$1/$2")
        .replace(/(\d{4})(\d{2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
};

type FormInputCpfCnpjProps = {
    name: string;
    control: any;
    errors: any;
} & TextFieldProps;

const FormInputCpfCnpj: FC<FormInputCpfCnpjProps> = ({ name, control, errors, ...props }) => {
    const error = get(errors, name);

    const applyMask = (value: string) => {
        const onlyDigits = value.replace(/\D/g, "");
        if (onlyDigits.length > 11) {
            return cnpjMask(value);
        }
        return cpfMask(value);
    };

    return (
        <Controller
            name={name as any}
            control={control}
            defaultValue=''
            render={({ field: { onChange, value } }) => (
                <TextField
                    {...props}
                    value={applyMask(value || "")}
                    onChange={(e) => onChange(applyMask(e.target.value))}
                    error={!!error}
                    helperText={error ? error.message : ""}
                    inputProps={{
                        maxLength: 18,
                    }}
                    sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                />
            )}
        />
    );
};

export default FormInputCpfCnpj;
