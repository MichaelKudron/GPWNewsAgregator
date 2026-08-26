package stocknewsaggregator.companyservice.controller;

import stocknewsaggregator.companyservice.dto.CompanyDto;
import stocknewsaggregator.companyservice.dto.MatchingCompanyDto;
import stocknewsaggregator.companyservice.service.company.CompanyService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/company")
public class CompanyController {
    private final CompanyService companyService;
    @PostMapping
    public ResponseEntity<CompanyDto> CreateCompany(@RequestBody CompanyDto companyDto) {
        return ResponseEntity.ok(companyService.CreateCompany(companyDto));
    }
    @GetMapping({"/{isin}"})
    public ResponseEntity<CompanyDto> GetCompany(@PathVariable String isin) {
        return ResponseEntity.ok(companyService.GetCompany(isin));
    }
    @GetMapping
    public ResponseEntity<List<CompanyDto>> GetCompanies() {
        return ResponseEntity.ok(companyService.GetCompanies());
    }
    @PutMapping
    public ResponseEntity<CompanyDto> UpdateCompany(@RequestBody CompanyDto companyDto) {
        return ResponseEntity.ok(companyService.UpdateCompany(companyDto));
    }
    @DeleteMapping({"/{id}"})
    public void DeleteCompany(@PathVariable String isin) {
        companyService.DeleteCompany(isin);
    }
    @GetMapping("/matching")
    public ResponseEntity<List<MatchingCompanyDto>> GetMatchingCompanies() {
        return ResponseEntity.ok(companyService.GetMatchingCompanies());
    }
    @GetMapping("/matching/{id}")
    public ResponseEntity<MatchingCompanyDto> GetMatchingCompanies(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.GetMatchingCompany(id.toString()));
    }
    @PostMapping("/matching/batch")
    public ResponseEntity<List<MatchingCompanyDto>> GetMatchingCompaniesByIds(@RequestBody List<UUID> ids) {
        return ResponseEntity.ok(companyService.GetMatchingCompaniesByIds(ids));
    }
}
