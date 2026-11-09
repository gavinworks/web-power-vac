# Conversion tracking (B76-452)

**Date:** 9 November 2026
**Account:** Tommy's Google Ads 825-071-8113, through the Build 76 Ltd manager account

## In Google Ads

| Conversion action | Goal | Optimisation | Count | Value | Label |
|---|---|---|---|---|---|
| Quote form sent (new) | Submit lead form | Primary | One | £35 | `SeHSCI6C7LQdENHetvBE` |
| Phone number tapped (new) | Contact | Primary | One | £35 | `CblJCJGC7LQdENHetvBE` |
| Submit lead form (Form submission /contact) | Submit lead form | Changed to **secondary** | Every | £1 | automatic, created by Google on 29 October 2026 |
| Calls from ads | Phone call lead | Secondary (unchanged) | Every | | call asset |
| Calls from ads (1) | Phone call lead | Primary (unchanged) | One | | call asset |

- Google tag ID: `AW-18489388881`.
- £35 a conversion is about half of Tommy's £75 average job, because roughly half of enquiries go ahead. Change it once we know his real conversion rate.
- The automatic "Submit lead form" action was made secondary so the quote form isn't counted twice once the tag is live.
- Enhanced conversions was left off: it sends hashed customer details to Google and needs a terms agreement.

## On the site

- `src/config/site.ts` (`googleAds`) holds the tag ID and labels.
- `src/components/site/cookie-banner.tsx` asks first; the tag (`src/lib/google-ads.ts`) only loads after Accept, with ad personalisation off. "Cookie settings" in the footer reopens it; declining after accepting stops the tag and deletes its cookies.
- Quote form: `trackConversion("quote")` when the form sends. Phone: any tap on a `tel:` link, on any page.
- Tested locally on 9 November 2026: no Google requests before consent; after Accept the tag loads and a phone tap sends the conversion with label `CblJCJGC7LQdENHetvBE` and `npa=1`.

## Cookies page update (Directus `legal_pages`, slug `cookies`)

Publish at the same time the site goes live, replacing the "Cookies on this site" section:

> **Cookies on this site**
>
> We only use cookies if you say yes. If you accept, Google Ads sets a cookie that tells us when someone who clicked one of our adverts gets in touch by sending the quote form or tapping our phone number. It helps us see which adverts bring in work so we stop paying for ones that don't. We don't use it to show you adverts elsewhere, and we don't use analytics cookies.
>
> | Cookie | Set by | What it's for | How long it lasts |
> |---|---|---|---|
> | `_gcl_au` | Google Ads | Links an enquiry to the advert that brought you here | 90 days |
>
> We also remember your choice in your browser's storage, so we don't ask again on every page.
>
> **Changing your mind**
>
> Use "Cookie settings" at the bottom of any page to change your choice at any time. You can also block or delete cookies in your browser's settings.
