import { BoxMain } from "../../components/Box/BoxMain";
import { AccessActionsFields } from "./AccessActionsFields";

export function AccessActions() {
    return (
        <BoxMain title='Cadastro Rotas de Acessos do Sistema' goBack>
            <AccessActionsFields />
        </BoxMain>
    );
}
