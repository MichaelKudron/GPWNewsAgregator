package stocknewsaggregator.articleservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Punkt osi czasu sentymentu: data, wynik skumulowany i netto tego dnia. */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SentimentPointDto {
    private LocalDate date;
    private long score; // skumulowany bilans do tego dnia włącznie
    private long net;   // netto sentymentu tego dnia
}
