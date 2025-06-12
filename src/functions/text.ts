export const convertToHTML = (text: string) => {
    const pieces = text.split("\n");
    let response = "";
    for (let piece of pieces) {
        if (!piece) {
            response += "<br><br>";
        } else {
            response += `<p>${piece}</p>`;
        }
    }
    return response;
};

export const copyText = async (text: string) => {
    if (window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return "Copiado com sucesso!";
        } catch (error) {
            return "Falha ao copiar.";
        }
    } else {
        return "Desculpe, A cópia de texto não é permitida neste domínio.";
    }
};
