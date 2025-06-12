import { Component } from "react";
import { Agencies } from "@/pages/agencies/Agencies";
import { Cooperatives } from "@/pages/cooperatives/Cooperatives";
import { ListRecordsCooperatives } from "@/pages/cooperatives/ListRecordsCooperatives";
import { ListRecordsAgencies } from "@/pages/agencies/ListRecordsAgencies";
import { UpdateMyProfile } from "@/pages/peoples/UpdateMyProfile";
import { AccessMenus } from "@/pages/access-menus/AccessMenus";
import { ListRecordsAccessMenus } from "@/pages/access-menus/ListRecordsAccessMenus";
import { AccessPages } from "@/pages/access-pages/AccessPages";
import { ListRecordsAccessPages } from "@/pages/access-pages/ListRecordsAccessPages";
import { AccessActions } from "@/pages/access-actions/AccessActions";
import { ListRecordsAccessActions } from "@/pages/access-actions/ListRecordsAccessActions";
import { WorkingBreaks } from "@/pages/working-breaks/WorkingBreaks";
import { ListRecordsWorkingBreaks } from "@/pages/working-breaks/ListRecordsWorkingBreaks";
import { Teams } from "@/pages/teams/Teams";
import { ListRecordsTeams } from "@/pages/teams/ListRecordsTeams";
import { Sectors } from "@/pages/sectors/Sectors";
import { ListRecordsSectors } from "@/pages/sectors/ListRecordsSectors";
import { Roles } from "@/pages/roles/Roles";
import { ListRecordsRoles } from "@/pages/roles/ListRecordsRoles";
import { AccessGroups } from "@/pages/access-groups/AccessGroups";
import { ListRecordsAccessGroups } from "@/pages/access-groups/ListRecordsAccessGroups";
import { Users } from "@/pages/users/Users";
import { ListRecordsUsers } from "@/pages/users/ListRecordsUsers";
import { Employees } from "@/pages/employees/Employees";
import { ListRecordsEmployees } from "@/pages/employees/ListRecordsEmployees";
import { Portfolios } from "@/pages/portfolios/Portfolios";
import { ListRecordsPortfolios } from "@/pages/portfolios/ListRecordsPortfolios";
import { Products } from "@/pages/products/Products";
import { ListRecordsProducts } from "@/pages/products/ListRecordsProducts";
import { ProductsModalities } from "@/pages/products/ProductsModalities";
import { ListRecordsProductivityDaily } from "@/pages/productivities-control/productivity-daily/ListRecordsProductivityDaily";
import { ProductivityDaily } from "@/pages/productivities-control/productivity-daily/ProductivityDaily";
import { ListRecordsPortfoliosMigration } from "@/pages/portfolios-management/portfolios-migration/ListRecordsPortfoliosMigration";
import { PortfoliosMigration } from "@/pages/portfolios-management/portfolios-migration/PortfoliosMigration";
import { ListRecordsCatalog } from "@/pages/reports/catalog/ListRecordsCatalog";
import { ListRecordsCSATAssessments } from "@/pages/reports/csat-assessments/ListRecordsCSATAssessments";
import { BusinessPanel } from "@/pages/reports/catalog/business-panel/BusinessPanel";
import { BusinessPanelInadCards } from "@/pages/reports/catalog/business-panel/BusinessPanelInadCards";
import { BusinessPanelInadOperations } from "@/pages/reports/catalog/business-panel/BusinessPanelInadOperations";
import { BusinessPanelDepositAdvance } from "@/pages/reports/catalog/business-panel/BusinessPanelDepositAdvance";
import { BusinessPanelBirthdaysExpiring } from "@/pages/reports/catalog/business-panel/BusinessPanelBirthdaysExpiring";
import { BusinessPanelEventsExpiring } from "@/pages/reports/catalog/business-panel/BusinessPanelEventsExpiring";
import { BusinessPanelDiscountedTitles } from "@/pages/reports/catalog/business-panel/BusinessPanelDiscountedTitles";
import { BusinessPanelCooperated } from "@/pages/reports/catalog/business-panel/BusinessPanelCooperated";
import { BusinessPanelPreApproved } from "@/pages/reports/catalog/business-panel/BusinessPanelPreApproved";
import { BusinessPanelDisbursement } from "@/pages/reports/catalog/business-panel/BusinessPanelDisbursement";
import { BusinessPanelSurveyRH } from "@/pages/reports/catalog/business-panel/BusinessPanelSurveyRH";
import { BusinessPanelQualifiedAccounts } from "@/pages/reports/catalog/business-panel/BusinessPanelQualifiedAccounts";
import { BusinessPanelRelationshipMatrix } from "@/pages/reports/catalog/business-panel/BusinessPanelRelationshipMatrix";
import { DashboardBi } from "@/pages/reports/catalog/dashboard-bi/DashboardBi";
import { ListRecordsHomePageConfig } from "@/pages/administrative-functions/homepage-config/ListRecordsHomePageConfig";
import { Banners } from "@/pages/administrative-functions/homepage-config/banners/Banners";
//
import { ListRecordsNotifications } from "@/pages/notifications/ListRecordsNotifications";
import { Notifications } from "@/pages/notifications/Notifications";
class MyPage extends Component {
    components = {
        Cooperatives: Cooperatives,
        ListRecordsCooperatives: ListRecordsCooperatives,
        Agencies: Agencies,
        ListRecordsAgencies: ListRecordsAgencies,
        UpdateMyProfile: UpdateMyProfile,
        AccessMenus: AccessMenus,
        ListRecordsAccessMenus: ListRecordsAccessMenus,
        AccessPages: AccessPages,
        ListRecordsAccessPages: ListRecordsAccessPages,
        AccessActions: AccessActions,
        ListRecordsAccessActions: ListRecordsAccessActions,
        WorkingBreaks: WorkingBreaks,
        ListRecordsWorkingBreaks: ListRecordsWorkingBreaks,
        Teams: Teams,
        ListRecordsTeams: ListRecordsTeams,
        Sectors: Sectors,
        ListRecordsSectors: ListRecordsSectors,
        Roles: Roles,
        ListRecordsRoles: ListRecordsRoles,
        AccessGroups: AccessGroups,
        ListRecordsAccessGroups: ListRecordsAccessGroups,
        Users: Users,
        ListRecordsUsers: ListRecordsUsers,
        Employees: Employees,
        ListRecordsEmployees: ListRecordsEmployees,
        Portfolios: Portfolios,
        ListRecordsPortfolios: ListRecordsPortfolios,
        Products: Products,
        ListRecordsProducts: ListRecordsProducts,
        ProductsModalities: ProductsModalities,
        ListRecordsProductivityDaily: ListRecordsProductivityDaily,
        ProductivityDaily: ProductivityDaily,
        ListRecordsPortfoliosMigration: ListRecordsPortfoliosMigration,
        PortfoliosMigration: PortfoliosMigration,
        ListRecordsCatalog: ListRecordsCatalog,
        ListRecordsCSATAssessments: ListRecordsCSATAssessments,
        BusinessPanel: BusinessPanel,
        BusinessPanelInadCards: BusinessPanelInadCards,
        BusinessPanelInadOperations: BusinessPanelInadOperations,
        BusinessPanelDepositAdvance: BusinessPanelDepositAdvance,
        BusinessPanelBirthdaysExpiring: BusinessPanelBirthdaysExpiring,
        BusinessPanelEventsExpiring: BusinessPanelEventsExpiring,
        BusinessPanelDiscountedTitles: BusinessPanelDiscountedTitles,
        BusinessPanelCooperated: BusinessPanelCooperated,
        BusinessPanelPreApproved: BusinessPanelPreApproved,
        BusinessPanelDisbursement: BusinessPanelDisbursement,
        BusinessPanelSurveyRH: BusinessPanelSurveyRH,
        BusinessPanelQualifiedAccounts: BusinessPanelQualifiedAccounts,
        BusinessPanelRelationshipMatrix: BusinessPanelRelationshipMatrix,
        DashboardBi: DashboardBi,
        ListRecordsHomePageConfig: ListRecordsHomePageConfig,
        Banners: Banners,
        ListRecordsNotifications: ListRecordsNotifications,
        Notifications: Notifications,
    };

    render() {
        const TagName = this.components[this.props.tag || "UpdateMyProfile"];
        if (!TagName) {
            console.error(`Componente não encontrado para a tag: ${this.props.tag}`);
            return null;
        }
        return <TagName />;
    }
}
export default MyPage;
