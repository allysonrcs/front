import { BoxMain } from "@/components/Box/BoxMain";
import { AccessMenusFields } from "./AccessMenusFields";

export function AccessMenus() {
    return (
        <BoxMain title='Cadastro de Menu de Acesso do Sistema' goBack>
            <AccessMenusFields />
        </BoxMain>
    );
}
