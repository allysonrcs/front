export function formatCnpjCpf(value: string | number) {
    const cnpjCpf = typeof value === "string" ? value.replace(/\D/g, "") : String(value);

    if (cnpjCpf.length === 11) {
        return cnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
    }

    return cnpjCpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
}

export function isValidCPF(cpf: string) {
    cpf = cpf.replace(/[\s.-]*/gim, "");

    if (cpf.length !== 11 || cpf.split("").every((c) => c === cpf[0])) {
        return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

export function isValidCNPJ(cnpj: string) {
    cnpj = cnpj.replace(/[^\d]+/g, "");

    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
        return false;
    }

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho++;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
}

export function formatCpfHidden(document: string, position: "start-end" | "middle"): string {
    if (!document) return "";

    const cleanCpf = document.replace(/\D/g, "");

    if (cleanCpf.length === 11) {
        if (position === "start-end") return `${document.slice(0, 3)}.***.***-${document.slice(-2)}`;
        if (position === "middle") return `***.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6, 9)}-**`;
    }

    return document;
}

export function isValidPhone(phone: string) {
    phone = phone.replace(/\D/g, "");

    var regex = new RegExp("^((1[1-9])|([2-9][0-9]))((3[0-9]{3}[0-9]{4})|(9[0-9]{3}[0-9]{5}))$");
    return regex.test(phone);
}

export function currencyFormat(num: number) {
    if (num < 1000) {
        return (
            "R$ " +
            num
                .toFixed(2)
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                .replace(".", ",")
        );
    } else {
        return "R$ " + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }
}

export function formatPhone(value: string | number) {
    var r = String(value).replace(/\D/g, "");

    r = r.replace(/^0/, "");

    if (r.length > 10) {
        r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (r.length > 5) {
        r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (r.length > 2) {
        r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    } else {
        r = r.replace(/^(\d*)/, "($1");
    }

    return r;
}

export function formatBytes(bytes: number, decimals: number = 2) {
    if (!+bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatToBRLCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPercentage(value: number, toFixed: number, round: boolean = true, multiple: boolean = false) {
    let percentageValue;

    if (multiple) {
        percentageValue = value * 100;
    } else {
        percentageValue = value;
    }

    if (round) {
        return `${percentageValue.toFixed(toFixed)}%`;
    } else {
        const percentageStr = percentageValue.toString();
        const decimalIndex = percentageStr.indexOf(".");

        if (toFixed === 0) {
            return `${Math.floor(percentageValue)}%`;
        }

        if (decimalIndex === -1) {
            return `${percentageStr}%`;
        }

        return `${percentageStr.slice(0, decimalIndex + toFixed + 1)}%`;
    }
}

export function formatNumberWithThousandsSeparator(number: number, thousandsSeparator: string = "."): string {
    if (number == null || isNaN(number)) return "0";

    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
}

export function formatNumberWithThousandsSeparatorComma(number: number): string {
    if (number == null || isNaN(number)) return "0";

    return number
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatNumberWithThousandsSeparatorCommaFixedOne(number: number): string {
    if (number == null || isNaN(number)) return "0";

    return number
        .toFixed(1)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseNumber(value: number | string) {
    if (typeof value === "number") {
        return value;
    }

    return parseFloat(value.replace(/\./g, "").replace(",", "."));
}

export function formatVariationPeriodicTithe(value: number | string): string {
    const strValue = String(value);

    if (strValue.includes(".")) {
        const [integerPart, decimalPart] = strValue.split(".");

        if (decimalPart.length > 2) {
            return `${integerPart}.${decimalPart.slice(0, 2)}`;
        }
    }

    return strValue;
}
