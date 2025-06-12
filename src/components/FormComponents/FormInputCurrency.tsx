import { FC, forwardRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Controller, get } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";

type FormInputCurrencyProps = {
    name: string;
    control: any;
    errors: any;
    decimalScale?: number;
} & TextFieldProps;

const NumericFormatCustom = forwardRef<NumericFormatProps, any>(function NumericFormatCustom(props, ref) {
    const { onChange, decimalScale, ...other } = props;
    return (
        <NumericFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.floatValue,
                    },
                });
            }}
            thousandSeparator='.'
            decimalSeparator=','
            prefix='R$ '
            decimalScale={decimalScale}
            valueIsNumericString
            fixedDecimalScale
        />
    );
});

const FormInputCurrency: FC<FormInputCurrencyProps> = ({ name, control, errors, decimalScale = 2, ...props }) => {
    const error = get(errors, name);

    return (
        <Controller
            name={name}
            control={control}
            defaultValue=''
            render={({ field: { onChange, value } }) => (
                <TextField
                    {...props}
                    value={value}
                    onChange={onChange}
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                    InputProps={{
                        inputComponent: NumericFormatCustom as any,
                        inputProps: { decimalScale },
                    }}
                    sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                />
            )}
        />
    );
};

export default FormInputCurrency;
