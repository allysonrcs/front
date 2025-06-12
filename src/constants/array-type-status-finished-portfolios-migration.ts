const TYPE_STATUS_FINISHED_PENDING = "PENDENTE";
const TYPE_STATUS_FINISHED_FINISHED = "FINALIZADO";
const TYPE_STATUS_FINISHED_APPROVED = "APROVADO";
const TYPE_STATUS_FINISHED_FAILED = "REPROVADO";
const TYPE_STATUS_FINISHED_CORRECTION = "CORREÇÃO";
const TYPE_STATUS_FINISHED_CANCELED = "CANCELADO";

export const ArrayTypeStatusFinished = [
    {
        id: TYPE_STATUS_FINISHED_PENDING,
        label: "🟡 Pendente",
    },
    {
        id: TYPE_STATUS_FINISHED_FINISHED,
        label: "❇️ Finalizado",
    },
    {
        id: TYPE_STATUS_FINISHED_APPROVED,
        label: "🟢 Aprovado",
    },
    {
        id: TYPE_STATUS_FINISHED_FAILED,
        label: "🔴 Reprovado",
    },
    {
        id: TYPE_STATUS_FINISHED_CORRECTION,
        label: "🔵 Correção",
    },
    {
        id: TYPE_STATUS_FINISHED_CANCELED,
        label: "⚫ Cancelado",
    },
];
