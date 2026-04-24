const SEO_GUIDE = `
# SEO Guide for Admin

This guide explains every SEO field in simple language so you can fill them confidently — no technical background needed.

---

## What is SEO?

SEO stands for **Search Engine Optimization**. It is the process of helping Google and other search engines understand what your page is about, so they show it to people searching for your products.

**Real example:**
When someone types *"cold press canola oil india"* on Google, Google reads the title and description of every page it knows about and picks the most relevant ones to show. If your page has the right title, description, and keywords, it appears higher in those results.

SEO does **not** cost money — it is free traffic from Google. But it takes the right setup.

---

## Field-by-Field Guide

### 1. Meta Title

**What it does:** This is the big blue link people see in Google search results. It is also shown in the browser tab.

**Real example:**
\`Jivo Wellness — India's Largest Cold Press Canola Oil Seller\`

**Best practice:**
- Keep it under **70 characters**
- Put the most important words first
- Include your brand name at the end
- Every page should have a unique title

---

### 2. Meta Description

**What it does:** This is the short paragraph shown below the blue link in Google results. Google may rewrite it, but a good description improves click rates.

**Real example:**
\`Premium cold press canola oil, wheatgrass juice, and superfoods — crafted with truth and devotion. Free shipping on orders above ₹499.\`

**Best practice:**
- Keep it under **180 characters**
- Tell people what the page is about and why they should click
- Include one or two important keywords naturally
- Each page should have a unique description

---

### 3. Keywords

**What it does:** A list of words related to the page topic. Google uses these as hints — they do **not** directly affect ranking anymore, but they help you stay organised.

**Real example:**
\`cold press canola oil, canola oil india, jivo wellness, healthy cooking oil\`

**Best practice:**
- Use 5–10 relevant keywords
- Separate each with a comma
- Use words your customers would actually type into Google
- Do not repeat the same word 10 times

---

### 4. Canonical URL

**What it does:** Tells Google which URL is the "official" address for this page. This prevents duplicate content issues when the same page can be reached from multiple URLs.

**Real example:**
\`https://jivo.in/our-essence/the-story\`

**Best practice:**
- Always use the full URL starting with \`https://jivo.in\`
- Never use \`http://localhost:3000\` — Google cannot access your local computer
- If you are unsure, copy the URL from your browser when viewing the live page

---

### 5. Robots

**What it does:** Tells Google whether to include this page in search results (index) and whether to follow the links on it (follow).

| Setting | Meaning | When to use |
|---------|---------|-------------|
| **index, follow** | Google shows this page and follows its links | Home, Products, About, Blog — all public pages |
| **noindex, follow** | Google does not show this page but follows links | Cart, Checkout, Order confirmation |
| **index, nofollow** | Google shows this page but ignores its links | Rarely used |
| **noindex, nofollow** | Google completely ignores this page | Admin dashboard, Login page, internal tools |

**Real pages:**
- \`/\` (Home) → \`index, follow\`
- \`/products\` → \`index, follow\`
- \`/admin\` → \`noindex, nofollow\` *(already set automatically)*
- \`/cart\` → \`noindex, follow\`

---

### 6. OG Title (Open Graph Title)

**What it does:** The title shown when someone shares this page on WhatsApp, Facebook, LinkedIn, or Twitter. If left empty, it falls back to the Meta Title.

**Real example:**
\`Jivo Wellness — Pure Cold Press Canola Oil\`

**Best practice:**
- Can be slightly shorter or catchier than the Meta Title
- Make it compelling so people want to click the shared link

---

### 7. OG Description (Open Graph Description)

**What it does:** The description shown in the WhatsApp or social media card preview when someone shares the link. Falls back to Meta Description if empty.

**Real example:**
\`Cold press oils and superfoods born from a mission of service. Honest ingredients, honest price.\`

**Best practice:**
- Keep it short and engaging — 1 or 2 sentences
- Focus on the benefit to the reader, not just product features

---

### 8. OG Image

**What it does:** The image shown in the social sharing card when someone sends your link on WhatsApp or posts it on social media. This is the most important visual element of a shared link.

**Real example:** A 1200×630 pixel image showing your product, brand logo, or a lifestyle photo.

**Best practice:**
- Always upload an image — a blank or missing image looks unprofessional
- Use size **1200 × 630 pixels** for best display across all platforms
- Avoid too much text on the image — some platforms limit text to 20% of the image area
- The image should represent the page content

---

### 9. Twitter Card

**What it does:** Controls how your link looks when shared on Twitter/X.

| Setting | Appearance |
|---------|-----------|
| **Summary Large Image** | Big image on top, then title and description below — recommended |
| **Summary** | Small square image on the left, text on the right |

**Best practice:** Use **Summary Large Image** for most pages. It looks more professional and gets more clicks.

---

### 10. JSON-LD (Structured Data)

**What it does:** Special invisible code that tells Google extra details about your page — like whether it is a product, an article, an FAQ, or an organisation. Google uses this for **rich results** like star ratings, FAQ dropdowns, and breadcrumbs in search.

**Real example for a product page:**
\`\`\`json
{
  "@type": "Product",
  "name": "Cold Press Canola Oil 1L",
  "brand": "Jivo Wellness",
  "offers": {
    "@type": "Offer",
    "price": "299",
    "priceCurrency": "INR"
  }
}
\`\`\`

**Best practice:**
- The \`@context\` field is added automatically — do not add it yourself
- Must be valid JSON — use the Copy button and paste it into [jsonlint.com](https://jsonlint.com) to check
- Leave empty if you are not sure — it is optional

---

## Robots Directive — Full Guide

### index, follow *(Default — use for most public pages)*
Google **shows the page** in search results and **follows all links** on it to discover other pages.

**Use when:** Home page, product listing, product detail, about, blog posts, contact.

---

### noindex, follow
Google does **not show the page** in results, but it **still follows links** on it.

**Use when:** Cart page, Checkout page, Order confirmation, Thank-you page.

---

### index, nofollow
Google **shows the page** but **does not follow** links on it. Rarely needed.

**Use when:** Pages with lots of external links you do not want to pass authority to.

---

### noindex, nofollow *(Full block)*
Google **completely ignores** the page — does not show it and does not follow any links.

**Use when:** Admin dashboard, Login page, internal tools, staging pages, test pages.

---

## Common Mistakes to Avoid

### 1. Using localhost in the Canonical URL
**Wrong:** \`http://localhost:3000/about\`

**Right:** \`https://jivo.in/about\`

Google cannot access localhost — it is only your computer. Always use the live domain.

---

### 2. Missing OG Image
If no OG image is set, WhatsApp and Facebook will either show a blank card or pick a random small image from the page. Always upload a proper 1200×630 image.

---

### 3. Wrong Robots Setting
Setting \`noindex\` on a page you want Google to rank means Google will **never show it**. Double-check the robots field for all public pages.

---

### 4. Title or Description Too Long
If your Meta Title is over 70 characters, Google cuts it off with \`…\` in results. The same happens with descriptions over 180 characters. Keep within the character limit shown in the counter.

---

### 5. Duplicate Titles Across Pages
Every page should have a unique title. If all pages share the same title, Google cannot tell them apart and may rank none of them well.

---

## Quick Checklist Before Saving

- Meta Title is under **70 characters**
- Meta Description is under **180 characters**
- Canonical URL starts with \`https://jivo.in\` (not localhost)
- OG Image is uploaded (1200×630 px)
- Robots is set to \`index, follow\` for public pages
- JSON-LD is valid JSON (or left empty)
- OG Title and OG Description are filled in
- Every page has a **unique** title and description
`;

export default SEO_GUIDE;
