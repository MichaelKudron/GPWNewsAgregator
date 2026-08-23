package stocknewsaggregator.articleservice.repository;

import stocknewsaggregator.articleservice.entity.Article;
import stocknewsaggregator.articleservice.entity.enums.ProcessingStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> {
    boolean existsByUrl(String url);
    List<Article> findByProcessingStatus(ProcessingStatus processingStatus);

    @Query("select a from Article a order by a.publishedAt desc nulls last")
    List<Article> findLatest(Pageable pageable);

    // Najnowsze artykuły, które mają już policzony sentyment (choć jedno powiązanie).
    @Query("select distinct a from Article a " +
            "join ArticleCompanyLink l on l.articleId = a.id " +
            "where l.sentiment is not null " +
            "order by a.publishedAt desc nulls last")
    List<Article> findLatestAnalyzed(Pageable pageable);
}
