import { FC } from "react";
import { Controller, get } from "react-hook-form";
import { Autocomplete, TextField, TextFieldProps } from "@mui/material";

type AutocompleteOption = {
    id: number | string | boolean;
    label: string;
};

type FormInputProps = {
    name: string;
    options: AutocompleteOption[];
    control: any;
    errors: any;
    disabledAutocomplete?: boolean;
    disableClearable?: boolean;
} & TextFieldProps;

const FormAutocomplete: FC<FormInputProps> = ({
    control,
    errors,
    options,
    name,
    disabledAutocomplete = false,
    disableClearable = false,
    ...props
}) => {
    const error = get(errors, name);

    return (
        <Controller
            control={control}
            name={name as any}
            defaultValue={null}
            render={({ field }) => (
                <Autocomplete
                    {...field}
                    fullWidth
                    clearOnEscape
                    disabled={disabledAutocomplete}
                    disableClearable={disableClearable}
                    options={options}
                    getOptionLabel={(option) => {
                        if (option && option.label) {
                            return option.label;
                        }
                        return "";
                    }}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => (
                        <TextField {...params} {...props} error={!!error} helperText={error ? error.message : ""} />
                    )}
                    onChange={(_event, data) => {
                        field.onChange(data ?? null);
                    }}
                    sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                />
            )}
        />
    );
};

export default FormAutocomplete;
