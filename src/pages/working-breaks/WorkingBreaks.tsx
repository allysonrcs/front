import { BoxMain } from "@/components/Box/BoxMain";
import { WorkingBreaksFields } from "./WorkingBreaksFields";

export function WorkingBreaks() {
    return (
        <BoxMain title='Cadastro de Intervalo' goBack={true}>
            <WorkingBreaksFields marginTop={1} />
        </BoxMain>
    );
}
