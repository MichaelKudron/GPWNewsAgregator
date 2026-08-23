package stocknewsaggregator.articleservice.service.article;

import stocknewsaggregator.articleservice.dto.ArticleListItemDto;
import stocknewsaggregator.articleservice.dto.EntityDto.ArticleDto;
import stocknewsaggregator.articleservice.dto.CompanyArticleDto;
import stocknewsaggregator.articleservice.dto.SummaryDto;
import stocknewsaggregator.articleservice.dto.TrendingCompanyDto;

import java.util.List;
import java.util.UUID;

public interface ArticleService {
    List<CompanyArticleDto> GetArticlesByCompanyId(UUID companyId);
    SummaryDto GetSummary();
    List<ArticleListItemDto> GetLatest();
    List<ArticleListItemDto> GetLatestClassified();
    List<TrendingCompanyDto> GetTrendingCompanies();

    ArticleDto GetArticleById(UUID id);
}
