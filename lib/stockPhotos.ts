function img(id: string, w = 1200) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}

// Exteriors / interiors
export const exteriors = {
  whiteVillaPoolDay: img("1613977257363-707ba9348227"),
  whiteVillaPoolDayAlt: img("1600596542815-ffad4c1539a9"),
  darkModernHouseDusk: img("1600585154340-be6161a56a0c"),
  darkModernHouseDuskAlt: img("1600585154526-990dced4db0d"),
  contemporaryHouseFence: img("1600566753190-17f0baa2a6c3"),
  suburbanHouseDay: img("1600047509358-9dc75507daeb"),
  resortPoolNight: img("1571896349842-33c89424de2d"),
  glassOfficeTowers: img("1554469384-e58fac16e23a"),
  farmlandSunset: img("1500382017468-9049fed747ef"),
};

export const interiors = {
  penthouseLivingRoomView: img("1600210492486-724fe5c67fb0"),
  brightLivingRoom: img("1600607687939-ce8a6c25118c"),
  whiteModernKitchen: img("1600585152220-90363fe7e115"),
  brightCondoLivingRoom: img("1522708323590-d24dbb6b0267"),
  officeLounge: img("1524758631624-e2822e304c36"),
  coffeeJournalFlatlay: img("1518481612222-68bbe828ecd1"),
  officeCorridor: img("1497366216548-37526070297c"),
};

// Cebu, where Magis is based (Mandaue City). Each id was checked against its
// Unsplash page's location tag; all are free under the Unsplash License.
export const cebu = {
  /** Cebu skyline across the water at sunset. Photo: Pao Dayag. */
  skylineSunset: img("1615989387035-f78b2fc7c46d"),
  /** Cebu City from above at dusk, Mindanao Ave. Photo: Fritz Gabriel Carilo. */
  cityAerialDusk: img("1558029573-2de0fd6f62f9"),
  /** Cebu Business Park lit up at night. Photo: Zany Jadraque. */
  businessParkNight: img("1505261476952-32e25cbfc755"),
  /** Cebu Business Park from above at night. Photo: Zany Jadraque. */
  cityAerialNight: img("1505449307143-eb99f132e28f"),
  /** Cebu-Cordova Link Expressway (CCLEX), joining Cebu City/Mandaue to Mactan. Photo: Josephus Bajo. */
  cclexBridge: img("1758149739878-c87e468f31b3"),
};

// No stock photos of people: the site must not pass them off as the Magis team.
// Real team/agent photos belong in /public/images or Cloudinary.

export const galleryPool = [
  interiors.brightLivingRoom,
  interiors.whiteModernKitchen,
  interiors.penthouseLivingRoomView,
  interiors.brightCondoLivingRoom,
  interiors.officeLounge,
  exteriors.glassOfficeTowers,
];
