---
"@zenuml/core": patch
---

The 30 monochrome architecture icons (`@Client`, `@Server`, `@Browser`, `@Service`, `@Controller`, `@API`, `@UI`, `@Mobile`, `@ExternalSystem`, `@Application`, `@LoadBalancer`, `@Network`, `@Cache`, `@WebServer`, `@MessageQueue`, `@Scheduler`, `@Gateway`, `@AuthenticationService`, `@MailServer`, `@GitHub`, `@Docker`, `@GitLab`, `@Jenkins`, `@PostgreSQL`, `@MongoDB`, `@Kubernetes`, `@ApacheKafka`, `@ElasticSearch`, `@Auth0`, `@Redis`) were painted in fixed black or navy and disappeared on `theme-dark`. They now use `currentColor`, so both renderers draw them in the theme's participant text colour (white on the dark canvas; `#222` instead of pure black in `theme-default`). A unit test now rejects any participant icon painted only in near-black. The SVG renderer's unused rule that outlined `fill="currentColor"` icon shapes is removed so the SVG and DOM renderers keep drawing the same glyphs.
