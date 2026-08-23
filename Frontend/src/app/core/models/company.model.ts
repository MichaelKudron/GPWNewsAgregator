export interface Company {
  id: string;
  ticker: string;
  isin: string;
  name: string;
  shortName: string;
  market: string;
  sector: string;
  industry: string;
  website: string;
  headquarter: string;
  ipoDate: string;
  active: boolean;
  delistedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyChartMapping {
  id: string;
  companyId: string;
  provider: string;
  symbol: string;
  default: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyAlias {
  id: string;
  companyId: string;
  alias: string;
  priority: number;
  createdAt: string;
}

export interface CompanyView {
  company: Company;
  companyChartMapping: CompanyChartMapping | null;
  companyAliases: CompanyAlias[];
}
