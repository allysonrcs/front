const TYPE_OPERATOR_PRODUCT_APPROVED = "APROVADO";
const TYPE_OPERATOR_PRODUCT_FAILED = "REPROVADO";
const TYPE_OPERATOR_PRODUCT_PENDING = "PENDENTE";
const TYPE_OPERATOR_PRODUCT_CORRECTION = "CORREÇÃO";
const TYPE_OPERATOR_PRODUCT_SKETCH = "RASCUNHO";
const TYPE_OPERATOR_PRODUCT_CANCELED = "CANCELADO";

export const ArrayTypeStatusProductivityDaily = [
    {
        id: TYPE_OPERATOR_PRODUCT_APPROVED,
        label: "🟢 Aprovado",
    },
    {
        id: TYPE_OPERATOR_PRODUCT_FAILED,
        label: "🔴 Reprovado",
    },
    {
        id: TYPE_OPERATOR_PRODUCT_PENDING,
        label: "🟡 Pendente",
    },
    {
        id: TYPE_OPERATOR_PRODUCT_CORRECTION,
        label: "🔵 Correção",
    },
    {
        id: TYPE_OPERATOR_PRODUCT_SKETCH,
        label: "🟣 Rascunho",
    },
    {
        id: TYPE_OPERATOR_PRODUCT_CANCELED,
        label: "⚫ Cancelado",
    },
];
