# Graphs

Read before choosing a time grouping or building a graph, including when the first request asks for
a graph or trend and when the user accepts an offered graph in a later turn.

## Time grouping

For a graph over time:

1. choose a supported time grouping such as Month, Quarter, Week, or Day;
2. use a granularity appropriate to the requested range;
3. ask when the user requested a graph but the desired granularity is ambiguous; and
4. avoid a grouping that creates an unreadable number of points.

## Chart

The template draws the graph from a `chart` object on the report's section, so never write chart
markup:

```json
{ "type": "line", "title": "Net income by month, Jan–Jun 2026", "rows": ["Net Income"] }
```

- `type`: `line` for trends over time, `bar` for period or category comparisons, grouped when
  there are several series, and `hbar` for ranked customers, vendors, products, or accounts.
- `rows`: the row labels to plot, exactly as returned, or `"Data"` for every data row.
- `columns`: optional column keys. By default `line` and `bar` plot every period column except the
  total, and `hbar` plots the total column.
- `x`: `"rows"` puts the rows on the x-axis with one series per column, such as this period and
  the prior period by account.
- `limit`: `hbar` only, the top N rows; `"sort": false` keeps the returned order.
- `title`: a descriptive title naming the measure and period. `x_label` and `y_label` are
  optional; the y-axis defaults to "Amount (<currency>)" and the time axis to "Period".

The page draws labeled axes and period labels, a visible zero baseline, a legend when there is
more than one series, and the exact returned value behind each point. It preserves negative values
and leaves missing values out instead of drawing zero. It has no waterfall or pie chart: use bars
for a cash-flow bridge or a breakdown, so negative values stay readable.
