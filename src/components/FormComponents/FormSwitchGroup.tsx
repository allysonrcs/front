import React from "react";
import { Controller } from "react-hook-form";
import { FormControl, FormLabel, FormGroup, FormControlLabel, Switch, FormHelperText } from "@mui/material";

interface SwitchOption {
    name: string;
    label: string;
}

interface FormSwitchGroupProps {
    control: any;
    row?: boolean;
    options: SwitchOption[];
    title?: string;
    helperText?: string;
}

const FormSwitchGroup: React.FC<FormSwitchGroupProps> = ({
    control,
    options,
    title = "Switches",
    helperText = "",
    row,
}) => {
    return (
        <FormControl component='fieldset' variant='standard'>
            {title && <FormLabel component='legend'>{title}</FormLabel>}
            <FormGroup row={row}>
                {options.map((option) => (
                    <Controller
                        key={option.name}
                        name={option.name}
                        control={control}
                        defaultValue={false}
                        render={({ field: { value, onChange } }) => (
                            <FormControlLabel
                                control={<Switch checked={value} onChange={(e) => onChange(e.target.checked)} />}
                                label={option.label}
                            />
                        )}
                    />
                ))}
            </FormGroup>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
};

export default FormSwitchGroup;
