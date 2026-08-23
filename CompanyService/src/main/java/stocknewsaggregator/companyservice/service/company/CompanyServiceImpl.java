package stocknewsaggregator.companyservice.service.company;

import stocknewsaggregator.companyservice.dto.CompanyAliasDto;
import stocknewsaggregator.companyservice.dto.CompanyDto;
import stocknewsaggregator.companyservice.dto.MatchingCompanyDto;
import stocknewsaggregator.companyservice.entity.Company;
import stocknewsaggregator.companyservice.entity.CompanyAlias;
import stocknewsaggregator.companyservice.mapper.CompanyMapper;
import stocknewsaggregator.companyservice.repository.CompanyAliasRepository;
import stocknewsaggregator.companyservice.repository.CompanyRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CompanyServiceImpl implements CompanyService {
    private final CompanyRepository companyRepository;
    private final CompanyAliasRepository companyAliasRepository;
    @Override
    public CompanyDto CreateCompany(CompanyDto companyDto) {
        Company company = CompanyMapper.CompanyDtoToCompany(companyDto);
        companyRepository.save(company);
        return CompanyMapper.CompanyToCompanyDto(company);
    }

    @Override
    public CompanyDto GetCompany(String isin) {
        Optional<Company> company = companyRepository.findByIsin(isin);
        return CompanyMapper.CompanyToCompanyDto(company.get());
    }

    @Override
    public List<CompanyDto> GetCompanies() {
       List<Company> listOdCompanies =  companyRepository.findAll();
       return listOdCompanies.stream().map(CompanyMapper::CompanyToCompanyDto).toList();

    }

    @Override
    public CompanyDto UpdateCompany(CompanyDto companyDto) {
        Company company = companyRepository.findByIsin(companyDto.getIsin()).get();
        company.setName(companyDto.getName());
        company.setShortName(companyDto.getShortName());
        company.setMarket(companyDto.getMarket());
        company.setSector(companyDto.getSector());
        company.setIndustry(companyDto.getIndustry());
        company.setWebsite(companyDto.getWebsite());
        company.setHeadquarter(companyDto.getHeadquarter());
        company.setIpoDate(companyDto.getIpoDate());
        company.setActive(companyDto.isActive());
        company.setDelistedAt(companyDto.getDelistedAt());
        return CompanyMapper.CompanyToCompanyDto(companyRepository.save(company));
    }

    @Override
    public void DeleteCompany(String isin) {
        Optional<Company> company = companyRepository.findByIsin(isin);
        companyRepository.delete(company.get());
    }

    @Override
    public List<MatchingCompanyDto> GetMatchingCompanies() {
        List<Company> companies = companyRepository.findAll();
        List<MatchingCompanyDto> matchingCompanies = companies.stream().map(CompanyMapper::CompanyToMatchingCompanyDto).toList();
        for (MatchingCompanyDto matchingCompany : matchingCompanies) {
           List<CompanyAlias> companyAliases = companyAliasRepository.findByCompanyId(matchingCompany.getId()).stream().toList();
           List<String> aliases = companyAliases.stream().map(CompanyAlias::getAlias).toList();
           matchingCompany.setAliases(aliases.stream()
                   .filter(alias -> alias != null && alias.length() > 3)
                   .toList());
        }
        return matchingCompanies;
    }

    @Override
    public MatchingCompanyDto GetMatchingCompany(String id) {
        return CompanyMapper.CompanyToMatchingCompanyDto(companyRepository.findById(UUID.fromString(id)).get());
    }

    @Override
    public List<MatchingCompanyDto> GetMatchingCompaniesByIds(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return companyRepository.findAllById(ids).stream()
                .map(CompanyMapper::CompanyToMatchingCompanyDto)
                .toList();
    }
}
