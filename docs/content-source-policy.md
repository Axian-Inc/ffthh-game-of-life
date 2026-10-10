# Content Source Policy

## Purpose

News-driven game events may use only reviewed, age-appropriate sources. Source URLs are server-owned constants: clients and model output cannot select or supply a URL.

## Approved sources

| Source | Exact feed URL | Review notes |
| --- | --- | --- |
| NOAA National Ocean Service | `https://oceanservice.noaa.gov/rss/nosnews.xml` | NOAA publishes this as the National Ocean Service news feed. Its `robots.txt` disallows only `/cgi-bin/` and `/aaweekly/`. NOAA generally permits educational use with attribution and without implied endorsement, subject to third-party notices. The feed returned HTTP 200 on 2026-10-09. |

The game retains only the publisher, headline, publication time, and a sanitized description. It selects deterministically from the source's rolling one-year article pool, falling back to all available entries only if that pool is empty. It does not republish images, logos, full articles, or source links.

## Adding or changing a source

Before changing the allowlist:

1. Confirm the exact HTTPS feed or API URL is intentionally published for automated consumption.
2. Review the source's current terms, copyright/usage guidance, `robots.txt`, attribution requirements, and suitability for ages 6–18.
3. Record the review and date in this document.
4. Add parser, redirect, size-limit, sanitization, and failure-mode tests.
5. Require code review; never make source URLs configurable from an API request or model response.

## References reviewed on 2026-10-09

- [NOAA National Ocean Service RSS library](https://oceanservice.noaa.gov/rss.html)
- [NOAA National Ocean Service robots.txt](https://oceanservice.noaa.gov/robots.txt)
- [NOAA National Ocean Service usage FAQ](https://oceanservice.noaa.gov/about/faq.html)
