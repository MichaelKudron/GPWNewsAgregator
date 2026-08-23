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
}
