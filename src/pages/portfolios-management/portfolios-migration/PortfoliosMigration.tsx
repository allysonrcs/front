import { BoxMain } from "@/components/Box/BoxMain";
import { PortfoliosMigrationFields } from "./PortfoliosMigrationFields";

export function PortfoliosMigration() {
    return (
        <BoxMain title='Cadastro de Migração de Carteira' goBack={true}>
            <PortfoliosMigrationFields />
        </BoxMain>
    );
}
