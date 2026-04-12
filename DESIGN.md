# Design System: TNF Kids x Beomjeop - Secret Diary

This design system is inspired by high-end boutique brand collaborations, specifically targeting a "Modern Nostalgic" and "Premium Handcrafted" aesthetic for a family-oriented dance event.

## 🎨 Color Palette
- **Primary Page (Warm Cream)**: `#FDFBF7` (The base paper color)
- **Secondary Page (Aged Parchment)**: `#F5F0E4` (For the RSVP side)
- **Deep Espresso**: `#1A1008` (Primary text, high contrast but warm)
- **Golden Oak**: `#9A8060` (Accent text, separators, secondary info)
- **Muted Earth**: `#3A2C18` (Body text, slightly less contrast for readability)
- **Notification Red**: `#B03020` (Errors/Critical info)

## 🖋️ Typography
- **Serif (Headings/Display)**: `var(--font-serif)` (Should be elegant, airy, high-contrast like 'Bodoni' or 'Playfair Display')
  - Title: `tracking-[8px]` for a premium, spacious feel.
- **Sans (Labels/UI)**: `var(--font-sans)` (Clean, modern like 'Inter' or 'Montserrat')
  - Labels: `uppercase tracking-[1.5px] text-[0.65rem]`
- **Handwriting (Inputs)**: `var(--font-handwriting)` (Authentic, slightly messy but elegant pen script like 'Kalam' or 'Caveat')

## 📐 Layout & Spacing
- **Aspect Ratio**: The diary spread should aim for an A-series paper ratio (approximately `1.414:1`) when open on desktop.
- **Micro-Animations**: 
  - Overlays should fade in with a slight scale-up (`scale(1.02) -> scale(1)`).
  - Hovering over buttons should create a subtle "pressed paper" or "soft glow" effect.
- **Paper Texture**: Use a subtle SVG turbulence noise filter overlay (`opacity-3`) to give the entire UI a tactile feel.

## ✨ Components
- **Inputs**: Transparent background, 1px dashed bottom border (`rgba(80,50,20,0.3)`). No focus outlines, just a subtle color darken on the border.
- **Buttons**: Outlined with `1px solid rgba(40,25,5,0.35)`. No rounded corners (sharp 2px max). Text should be all-caps serif with high tracking.
- **Logos**: Always monochromatic (usually monochromatic-dark) and placed at the top of the left page as a "collaboration header".

## 📱 Responsiveness
- **Desktop**: 2-page spread.
- **Mobile**: Vertical single-page stack. The transition should be seamless, with the left page (Intro) flowing into the right page (RSVP).

## 🖼️ Backgrounds
- Inner pages use `내지.png`. It should be scaled to cover the container properly without losing the hand-drawn elements (like the star/feather icons).
