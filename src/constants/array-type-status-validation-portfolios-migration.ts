const TYPE_STATUS_VALIDATION_WAITING = "AGUARDANDO";
const TYPE_STATUS_VALIDATION_AUTHORIZED = "AUTORIZADO";
const TYPE_STATUS_VALIDATION_REJECTED = "REJEITADO";
const TYPE_STATUS_VALIDATION_CANCELED = "CANCELADO";

export const ArrayTypeStatusValidation = [
    {
        id: TYPE_STATUS_VALIDATION_WAITING,
        label: "🟠 Aguardando",
    },
    {
        id: TYPE_STATUS_VALIDATION_AUTHORIZED,
        label: "✅ Autorizado",
    },
    {
        id: TYPE_STATUS_VALIDATION_REJECTED,
        label: "❌ Rejeitado",
    },
    {
        id: TYPE_STATUS_VALIDATION_CANCELED,
        label: "⚫ Cancelado",
    },
];
