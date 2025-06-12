import { BoxMain } from "@/components/Box/BoxMain";
import { CooperativesFields } from "./CooperativesFields";

export function Cooperatives() {
    return (
        <BoxMain title='Cadastro de Cooperativa' goBack={true}>
            <CooperativesFields />
        </BoxMain>
    );
}
