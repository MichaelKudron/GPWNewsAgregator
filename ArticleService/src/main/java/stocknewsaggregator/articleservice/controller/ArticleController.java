package stocknewsaggregator.articleservice.controller;

import stocknewsaggregator.articleservice.dto.ArticleListItemDto;
import stocknewsaggregator.articleservice.dto.EntityDto.ArticleDto;
import stocknewsaggregator.articleservice.dto.CompanyArticleDto;
import stocknewsaggregator.articleservice.dto.FetchResponseDto;
import stocknewsaggregator.articleservice.dto.LinkedCompanyDto;
import stocknewsaggregator.articleservice.dto.SentimentPointDto;
import stocknewsaggregator.articleservice.dto.SummaryDto;
import stocknewsaggregator.articleservice.dto.TrendingCompanyDto;
import stocknewsaggregator.articleservice.service.Analysis.ArticleAnaliseService;
import stocknewsaggregator.articleservice.service.article.ArticleService;
import stocknewsaggregator.articleservice.service.matching.MatchingArticleCompanyService;
import stocknewsaggregator.articleservice.service.download.ArticleDownloadService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/article")
@AllArgsConstructor
public class ArticleController {
    private ArticleDownloadService articleDownloadService;
    private MatchingArticleCompanyService matchingArticleCompanyService;
    private ArticleService articleService;
    private ArticleAnaliseService articleAnaliseService;
    @GetMapping("/fetch/{hours}")
    public ResponseEntity<FetchResponseDto> fetchArticles(@PathVariable int hours) {
        FetchResponseDto fetchResponseDto = articleDownloadService.fetchArticles(hours);
        return ResponseEntity.ok(fetchResponseDto);
    }
    @GetMapping("/match")
    public ResponseEntity matchArticles() {
        matchingArticleCompanyService.MatchArticleCompany();
        return ResponseEntity.ok().build();
    }
    @GetMapping("/{id}")
    public ResponseEntity<ArticleDto> GetArticleById(@PathVariable UUID id) {
        return ResponseEntity.ok(articleService.GetArticleById(id));
    }
    @GetMapping("/company/{id}")
    public ResponseEntity<List<CompanyArticleDto>> GetArticlesByCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(articleService.GetArticlesByCompanyId(id));
    }
    @GetMapping("/{id}/companies")
    public ResponseEntity<List<LinkedCompanyDto>> GetArticleCompanies(@PathVariable UUID id) {
        return ResponseEntity.ok(articleService.GetArticleCompanies(id));
    }
    @GetMapping("/analyse")
    public ResponseEntity analyseArticles() {
        articleAnaliseService.AnalyzeArticle();
        return ResponseEntity.ok().build();
    }
    @GetMapping("/sentiment-summary")
    public ResponseEntity<SummaryDto> getSummary() {
        return ResponseEntity.ok(articleService.GetSummary());
    }
    @GetMapping("/sentiment-timeline")
    public ResponseEntity<List<SentimentPointDto>> getSentimentTimeline(
            @RequestParam(required = false) UUID companyId) {
        return ResponseEntity.ok(articleService.GetSentimentTimeline(companyId));
    }
    @GetMapping("/latest")
    public ResponseEntity<List<ArticleListItemDto>> getLatest() {
        return ResponseEntity.ok(articleService.GetLatest());
    }
    @GetMapping("/latest-classified")
    public ResponseEntity<List<ArticleListItemDto>> getLatestClassified() {
        return ResponseEntity.ok(articleService.GetLatestClassified());
    }
    @GetMapping("/trending-companies")
    public ResponseEntity<List<TrendingCompanyDto>> getTrendingCompanies() {
        return ResponseEntity.ok(articleService.GetTrendingCompanies());
    }
}
