import { BoxMain } from "../../components/Box/BoxMain";
import { AccessPagesFields } from "./AccessPagesFields";

export function AccessPages() {
    return (
        <BoxMain title='Cadastro de Página de Acesso do Sistema' goBack>
            <AccessPagesFields />
        </BoxMain>
    );
}
