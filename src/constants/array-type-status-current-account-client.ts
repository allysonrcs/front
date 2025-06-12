const TYPE_STATUS_CURRENT_ACCOUNT_ACTIVE = "ATIVA";
const TYPE_STATUS_CURRENT_ACCOUNT_INACTIVE = "INATIVA";
const TYPE_STATUS_CURRENT_ACCOUNT_FINISHED = "ENCERRADA";
const TYPE_STATUS_CURRENT_ACCOUNT_BLOCKED = "BLOQUEADA";
const TYPE_STATUS_CURRENT_ACCOUNT_DOES_NOT_HAVE = "NULL";

export const ArrayTypeStatusCurrentAccountClient = [
    {
        id: TYPE_STATUS_CURRENT_ACCOUNT_ACTIVE,
        label: "🟢 Ativa",
    },
    {
        id: TYPE_STATUS_CURRENT_ACCOUNT_INACTIVE,
        label: "🔴 Inativa",
    },
    {
        id: TYPE_STATUS_CURRENT_ACCOUNT_FINISHED,
        label: "❌ Encerrada",
    },
    {
        id: TYPE_STATUS_CURRENT_ACCOUNT_BLOCKED,
        label: "🚫 Bloqueada",
    },
    {
        id: TYPE_STATUS_CURRENT_ACCOUNT_DOES_NOT_HAVE,
        label: "⚠️ Não Possui",
    },
];
