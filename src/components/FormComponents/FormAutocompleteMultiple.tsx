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
    disableCloseOnSelect?: boolean;
} & TextFieldProps;

const FormAutocompleteMultiple: FC<FormInputProps> = ({
    control,
    errors,
    options,
    name,
    disableCloseOnSelect = false,
    disabledAutocomplete = false,
    disableClearable = false,
    ...props
}) => {
    const error = get(errors, name);

    return (
        <Controller
            control={control}
            name={name as any}
            defaultValue={[]}
            render={({ field: { ref, onChange, ...field } }) => (
                <Autocomplete
                    {...field}
                    multiple
                    options={options}
                    defaultValue={[]}
                    disableCloseOnSelect={disableCloseOnSelect}
                    disabled={disabledAutocomplete}
                    size='small'
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    onChange={(_, data) => onChange(data)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            {...props}
                            fullWidth
                            inputRef={ref}
                            error={!!error}
                            helperText={error ? error.message : ""}
                        />
                    )}
                    sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                />
            )}
        />
    );
};

export default FormAutocompleteMultiple;
