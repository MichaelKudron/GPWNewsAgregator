package stocknewsaggregator.articleservice.service.article;


import stocknewsaggregator.articleservice.config.ServiceUrls;
import stocknewsaggregator.articleservice.dto.ArticleListItemDto;
import stocknewsaggregator.articleservice.dto.EntityDto.ArticleDto;
import stocknewsaggregator.articleservice.dto.CompanyArticleDto;
import stocknewsaggregator.articleservice.dto.LinkedCompanyDto;
import stocknewsaggregator.articleservice.dto.MatchingCompanyDto;
import stocknewsaggregator.articleservice.dto.SentimentPointDto;
import stocknewsaggregator.articleservice.dto.SummaryDto;
import stocknewsaggregator.articleservice.dto.TrendingCompanyDto;
import stocknewsaggregator.articleservice.repository.SentimentDayCount;
import stocknewsaggregator.articleservice.entity.Article;
import stocknewsaggregator.articleservice.entity.ArticleCompanyLink;
import stocknewsaggregator.articleservice.entity.enums.Sentiment;
import stocknewsaggregator.articleservice.mapper.ArticleMapper;
import stocknewsaggregator.articleservice.repository.ArticleCompanyLinkRepository;
import stocknewsaggregator.articleservice.repository.ArticleRepository;
import lombok.AllArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ArticleServiceImpl implements ArticleService {
    private final ArticleRepository articleRepository;
    private final ArticleCompanyLinkRepository articleCompanyLinkRepository;
    private final WebClient webClient;
    private final ServiceUrls serviceUrls;

    @Override
    public List<CompanyArticleDto> GetArticlesByCompanyId(UUID companyId) {
        List<ArticleCompanyLink> articleCompanyLinks = articleCompanyLinkRepository.findByCompanyId(companyId);
        List<CompanyArticleDto> companyArticleDtos = new ArrayList<>();
        for (ArticleCompanyLink articleCompanyLink : articleCompanyLinks) {
            Article article = articleRepository.findById(articleCompanyLink.getArticleId()).get();
            CompanyArticleDto companyArticleDto = new CompanyArticleDto();
            companyArticleDto.setArticleId(article.getId());
            companyArticleDto.setArticleTitle(article.getTitle());
            companyArticleDto.setSentiment(
                    articleCompanyLink.getSentiment() != null
                            ? articleCompanyLink.getSentiment().name().toLowerCase()
                            : "neutral");
            companyArticleDto.setMatchLevel(articleCompanyLink.getMatchLevel());
            companyArticleDtos.add(companyArticleDto);
        }

    return companyArticleDtos;
    }

    @Override
    public SummaryDto GetSummary() {
        List<ArticleCompanyLink> links =
                articleCompanyLinkRepository.findByCreatedAtAfter(LocalDateTime.now().minusDays(7));
        SummaryDto summary = new SummaryDto();
        summary.setPositive(links.stream().filter(l -> l.getSentiment() == Sentiment.POSITIVE).count());
        summary.setNegative(links.stream().filter(l -> l.getSentiment() == Sentiment.NEGATIVE).count());
        summary.setNeutral(links.stream().filter(l -> l.getSentiment() == Sentiment.NEUTRAL).count());
        return summary;
    }

    @Override
    public List<ArticleListItemDto> GetLatest() {
        return toListItems(articleRepository.findLatest(PageRequest.of(0, 100)));
    }

    @Override
    public List<ArticleListItemDto> GetLatestClassified() {
        // Bierzemy więcej najnowszych PRZEanalizowanych, bo po odfiltrowaniu
        // do jednoznacznie pozytywnych/negatywnych (bez MIXED/NEUTRAL) zostaje mniej.
        return toListItems(articleRepository.findLatestAnalyzed(PageRequest.of(0, 40))).stream()
                .filter(dto -> "positive".equals(dto.getSentiment())
                        || "negative".equals(dto.getSentiment()))
                .limit(12)
                .toList();
    }

    @Override
    public List<LinkedCompanyDto> GetArticleCompanies(UUID articleId) {
        List<ArticleCompanyLink> links = articleCompanyLinkRepository.findByArticleId(articleId);
        Map<UUID, LinkedCompanyDto> companyById = resolveCompanies(
                links.stream().map(ArticleCompanyLink::getCompanyId).collect(Collectors.toSet()));
        return links.stream()
                .map(l -> companyById.get(l.getCompanyId()))
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    @Override
    public List<TrendingCompanyDto> GetTrendingCompanies() {
        return articleCompanyLinkRepository
                .findTopCompaniesSince(LocalDateTime.now().minusDays(2), PageRequest.of(0, 5))
                .stream()
                .map(count -> {
                    MatchingCompanyDto company = webClient.get()
                            .uri(serviceUrls.getCompany() + "/api/v1/company/matching/" + count.getCompanyId())
                            .retrieve()
                            .bodyToMono(MatchingCompanyDto.class)
                            .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                                    .filter(WebClientRequestException.class::isInstance))
                            .block();
                    return new TrendingCompanyDto(
                            company.getName(), company.getTicker(), company.getIsin(), count.getCount());
                })
                .toList();
    }

    @Override
    public List<SentimentPointDto> GetSentimentTimeline(UUID companyId) {
        List<SentimentDayCount> daily = companyId == null
                ? articleCompanyLinkRepository.sentimentTimeline()
                : articleCompanyLinkRepository.sentimentTimelineByCompany(companyId);

        List<SentimentPointDto> points = new ArrayList<>();
        long cumulative = 0;
        for (SentimentDayCount d : daily) {
            cumulative += d.getNet();
            points.add(new SentimentPointDto(d.getDay(), cumulative, d.getNet()));
        }
        return points;
    }

    @Override
    public ArticleDto GetArticleById(UUID id) {
        return ArticleMapper.toDto(articleRepository.findById(id).get());
    }

    // ── Pomocnicze ────────────────────────────────────────────────────────────

    /**
     * Buduje elementy listy dla podanych artykułów: dokleja przeważający sentyment
     * i powiązane spółki. Linki i spółki pobierane hurtowo (bez N+1).
     */
    private List<ArticleListItemDto> toListItems(List<Article> articles) {
        if (articles.isEmpty()) {
            return List.of();
        }
        List<UUID> articleIds = articles.stream().map(Article::getId).toList();
        List<ArticleCompanyLink> links = articleCompanyLinkRepository.findByArticleIdIn(articleIds);

        Map<UUID, List<ArticleCompanyLink>> linksByArticle = links.stream()
                .collect(Collectors.groupingBy(ArticleCompanyLink::getArticleId));
        Map<UUID, LinkedCompanyDto> companyById = resolveCompanies(
                links.stream().map(ArticleCompanyLink::getCompanyId).collect(Collectors.toSet()));

        return articles.stream().map(a -> {
            List<ArticleCompanyLink> aLinks = linksByArticle.getOrDefault(a.getId(), List.of());
            List<LinkedCompanyDto> companies = aLinks.stream()
                    .map(l -> companyById.get(l.getCompanyId()))
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();
            return new ArticleListItemDto(
                    a.getId(),
                    a.getTitle(),
                    a.getSourceCode(),
                    a.getSummary(),
                    a.getPublishedAt(),
                    dominantSentiment(aLinks),
                    companies);
        }).toList();
    }

    /** Hurtowo rozwiązuje id spółek → lekki DTO (jedno zapytanie do CompanyService). */
    private Map<UUID, LinkedCompanyDto> resolveCompanies(Collection<UUID> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        List<MatchingCompanyDto> resolved = webClient.post()
                .uri(serviceUrls.getCompany() + "/api/v1/company/matching/batch")
                .bodyValue(ids)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<MatchingCompanyDto>>() {})
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                        .filter(WebClientRequestException.class::isInstance))
                .block();
        if (resolved == null) {
            return Map.of();
        }
        Map<UUID, LinkedCompanyDto> map = new HashMap<>();
        for (MatchingCompanyDto c : resolved) {
            map.put(c.getId(), new LinkedCompanyDto(c.getIsin(), c.getTicker(), c.getName()));
        }
        return map;
    }

    /** Przeważający sentyment artykułu = z powiązania o najwyższym matchScore. */
    private String dominantSentiment(List<ArticleCompanyLink> links) {
        return links.stream()
                .filter(l -> l.getSentiment() != null)
                .max(Comparator.comparingDouble(ArticleCompanyLink::getMatchScore))
                .map(l -> l.getSentiment().name().toLowerCase())
                .orElse(null);
    }
}
