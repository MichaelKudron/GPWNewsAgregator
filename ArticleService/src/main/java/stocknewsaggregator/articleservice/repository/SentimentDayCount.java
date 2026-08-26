package stocknewsaggregator.articleservice.repository;

import java.time.LocalDate;

/** Projekcja: dzień + netto sentymentu (suma +1/-1) tego dnia. */
public interface SentimentDayCount {
    LocalDate getDay();
    long getNet();
}
