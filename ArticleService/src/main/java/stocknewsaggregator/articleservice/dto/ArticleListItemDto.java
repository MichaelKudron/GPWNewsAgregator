package stocknewsaggregator.articleservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArticleListItemDto {
    private UUID id;
    private String title;
    private String sourceCode;   // JSON: source_code
    private String summary;
    private LocalDateTime publishedAt; // JSON: published_at
    private String sentiment;    // positive | negative | neutral | null
    private List<LinkedCompanyDto> companies; // powiązane spółki (chipy)
}
