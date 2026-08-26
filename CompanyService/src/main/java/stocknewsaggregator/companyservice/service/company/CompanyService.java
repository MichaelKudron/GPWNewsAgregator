package stocknewsaggregator.companyservice.service.company;

import stocknewsaggregator.companyservice.dto.CompanyDto;
import stocknewsaggregator.companyservice.dto.MatchingCompanyDto;

import java.util.List;
import java.util.UUID;

public interface CompanyService {
    CompanyDto CreateCompany(CompanyDto companyDto);
    CompanyDto GetCompany(String isin);
    List<CompanyDto> GetCompanies();
    CompanyDto UpdateCompany(CompanyDto companyDto);
    void DeleteCompany(String isin);
    List<MatchingCompanyDto> GetMatchingCompanies();
    MatchingCompanyDto GetMatchingCompany(String isin);
    List<MatchingCompanyDto> GetMatchingCompaniesByIds(List<UUID> ids);
}
