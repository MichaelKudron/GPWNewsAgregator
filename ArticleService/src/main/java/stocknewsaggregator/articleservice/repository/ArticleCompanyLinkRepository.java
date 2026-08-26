package stocknewsaggregator.articleservice.repository;

import stocknewsaggregator.articleservice.entity.ArticleCompanyLink;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ArticleCompanyLinkRepository extends JpaRepository<ArticleCompanyLink, UUID> {
    List<ArticleCompanyLink> findByCompanyId(UUID companyId);
    List<ArticleCompanyLink> findByArticleId(UUID articleId);
    List<ArticleCompanyLink> findByArticleIdIn(Collection<UUID> articleIds);
    List<ArticleCompanyLink> findByCreatedAtAfter(LocalDateTime since);

    @Query("""
        select l.companyId as companyId, count(l) as count
        from ArticleCompanyLink l
        where l.createdAt > :since
        group by l.companyId
        order by count(l) desc
    """)
    List<CompanyCount> findTopCompaniesSince(@Param("since") LocalDateTime since, Pageable pageable);

    // Netto sentymentu per dzień publikacji (POSITIVE +1, NEGATIVE -1, reszta 0) — całość rynku.
    @Query(value = """
        select cast(a.published_at as date) as day,
               sum(case l.sentiment when 'POSITIVE' then 1 when 'NEGATIVE' then -1 else 0 end) as net
        from article_company_link l
        join article a on a.id = l.article_id
        where a.published_at is not null
        group by cast(a.published_at as date)
        order by day
    """, nativeQuery = true)
    List<SentimentDayCount> sentimentTimeline();

    // Jak wyżej, ale dla jednej spółki.
    @Query(value = """
        select cast(a.published_at as date) as day,
               sum(case l.sentiment when 'POSITIVE' then 1 when 'NEGATIVE' then -1 else 0 end) as net
        from article_company_link l
        join article a on a.id = l.article_id
        where a.published_at is not null and l.company_id = :companyId
        group by cast(a.published_at as date)
        order by day
    """, nativeQuery = true)
    List<SentimentDayCount> sentimentTimelineByCompany(@Param("companyId") UUID companyId);
}
