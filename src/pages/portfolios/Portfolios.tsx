import { BoxMain } from "@/components/Box/BoxMain";
import { PortfoliosFields } from "./PortfoliosFields";

export function Portfolios() {
    return (
        <BoxMain title='Cadastro de Carteira' goBack={true}>
            <PortfoliosFields />
        </BoxMain>
    );
}
