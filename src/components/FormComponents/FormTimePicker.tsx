import { FC } from "react";
import { get, Controller } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

type FormInputProps = {
    control: any;
    errors: any;
    name: string;
    format?: string;
} & TextFieldProps;

const FormTimePicker: FC<FormInputProps> = ({ control, errors, name, format = "HH:mm", ...props }) => {
    const error = get(errors, name);

    return (
        <Controller
            control={control}
            name={name as any}
            defaultValue={null}
            render={({ field: { onChange, value } }) => (
                <TimePicker
                    value={value}
                    inputFormat={format}
                    onChange={onChange}
                    ampm={true}
                    disableIgnoringDatePartForTimeValidation={true}
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

export default FormTimePicker;
