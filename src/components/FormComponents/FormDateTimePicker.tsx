import { FC } from "react";
import { get, Controller } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";

type FormInputProps = {
    control: any;
    errors: any;
    name: string;
    format?: string;
} & TextFieldProps;

const FormDateTimePicker: FC<FormInputProps> = ({ control, errors, name, format = "DD/MM/YYYY HH:mm", ...props }) => {
    const error = get(errors, name);

    return (
        <Controller
            control={control}
            name={name as any}
            render={({ field: { onChange, value } }) => (
                <DateTimePicker
                    value={value}
                    inputFormat={format}
                    onChange={onChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            {...props}
                            sx={{ button: { margin: 0 }, "& fieldset": { borderRadius: "8px !important" } }}
                            error={!!error}
                            helperText={error ? error.message : ""}
                        />
                    )}
                />
            )}
        />
    );
};

export default FormDateTimePicker;
