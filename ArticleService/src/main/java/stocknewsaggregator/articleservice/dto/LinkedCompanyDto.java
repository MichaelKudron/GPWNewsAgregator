package stocknewsaggregator.articleservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Lekki opis spółki powiązanej z artykułem — do chipów na liście/artykule. */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LinkedCompanyDto {
    private String isin;
    private String ticker;
    private String name;
}
