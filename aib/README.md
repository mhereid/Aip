# AIB-C01 Study (offline)

Offline study app for the AWS Certified AI Business Strategist (AIB-C01) exam, served at
https://mhereid.github.io/Aip/aib/. It is independent of the AIF-C01 app at the repository root:
progress is stored under the `aib-study-v1` localStorage key and assets in `aib-study-*` caches.

## Question bank attribution

The 340 questions, answer choices, answers, and explanations come from
[AIB-C01 Practice](https://github.com/zghanw/aws-ai-business-strategist) by zghanw
(Copyright (c) 2026 zghanw), used under the MIT License. The full license text is in
[LICENSE-questions.txt](LICENSE-questions.txt). Imported from source commit
`2e8ccd44cc45dee6f4685a50cb3d6bea8e213056`.

This is an unofficial study aid, not affiliated with or endorsed by Amazon Web Services.

## Updating the questions

```sh
git clone https://github.com/zghanw/aws-ai-business-strategist /tmp/aib-src
node aib/tools/build-questions.js /tmp/aib-src   # regenerates aib/questions.js
node aib/tools/check.js /tmp/aib-src             # 340 unique, 85 per domain, fields match source
```

After changing any file in `aib/`, bump `CACHE` in `aib/sw.js` so installed copies pick it up.
