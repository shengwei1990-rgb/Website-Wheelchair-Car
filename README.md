# LiftEase SG: wheelchair accessible transport website (mock-up)

A one-page static website for a wheelchair accessible van service in Singapore.
It's plain HTML, CSS and JavaScript with no build step, so it runs on GitHub Pages as is.

**All content is placeholder**: the business name, phone number, prices, UEN and photos.

## Files

| File | What it is |
|---|---|
| `index.html` | All page content (services, van, price list, FAQ, forms) |
| `styles.css` | Styling (colours are set at the top as variables) |
| `script.js` | Phone number settings, fare estimator, and form to WhatsApp |
| `assets/` | Favicon (add van photos here later) |

## Changing the placeholders

1. **Phone number**: edit `CONFIG` at the top of `script.js`. It updates every call and WhatsApp button.
   Also search `index.html` for `6591234567` / `9123 4567` (the fallback if JavaScript is off).
2. **Business name**: search and replace `LiftEase SG` in `index.html` and `script.js`.
3. **Prices**: edit the price tables in `index.html` **and** `FARES` in `script.js` (used by the fare estimator).
4. **Mock-up banner**: delete the `<div class="mock-banner">` line in `index.html` when you go live.
5. **Van photo**: replace the `photo-placeholder` block in the "Our van" section with an `<img>`.

## How the forms work

There is no server. When someone submits the **Booking request** or **General enquiry** form,
WhatsApp opens with a pre-filled message to your number. The customer taps send.
The page also shows your mobile number so people can call instead.

## Publishing on GitHub Pages

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick the branch and the `/ (root)` folder, and save.
3. The site appears at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Pricing rationale (mock)

Prices are set slightly under the larger operators in Singapore (2026 market references):
private wheelchair maxicabs charge about $55–75 one-way, SGS ComfortDelGro medical escort $95–113 one-way,
and HWA Dial-A-Ride $49 one-way.
