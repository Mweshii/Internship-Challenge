// =============================================================================
// BUSINESS DETAILS - edit this file to rebrand the site.
//
// Everything below marked PLACEHOLDER is made up so the layout has something to
// show. Replace it with the real business information before going live.
// =============================================================================

export const site = {
  // The logo stacks the two halves: "NEXURA" large, "TECHNOLOGIES" small underneath.
  name: 'Nexura Technologies',
  nameStart: 'Nexura',
  nameEnd: 'Technologies',
  tagline: 'Fast. Reliable. Affordable.',

  contact: {
    phone: '+264 81 846 2310',
    // WhatsApp number: digits only, with the country code and no "+" (used in the wa.me link).
    whatsapp: '264818462310',
    email: 'nexuratech@gmail.com',
    addressLines: ['Shop address line 1', 'Suburb'], // PLACEHOLDER
    city: 'Windhoek, Namibia',
  },

  // PLACEHOLDER opening hours.
  hours: [
    { days: 'Monday - Friday', time: '08:00 - 17:00' },
    { days: 'Saturday', time: '09:00 - 13:00' },
    { days: 'Sunday & public holidays', time: 'Closed' },
  ],

  // Shown under the address when a customer chooses to drop off a device.
  dropOffInstructions:
    'Bring your device and charger if you have one. Please back up your data first where possible, and remove any SIM or memory cards you want to keep.',

  // While this is true, shop pages show a banner saying the catalogue is
  // sample data. Set it to false once real products and stock are loaded.
  showSampleDataNotice: true,
};

// The links in the top navigation bar, in order. `end: true` means "only
// highlight on an exact match" (otherwise Home would always be highlighted).
export const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/repairs', label: 'Repairs' },
  { to: '/accessories', label: 'Accessories' },
  { to: '/electronics', label: 'Other' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];
