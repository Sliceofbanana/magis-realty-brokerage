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
  officeCorridor: img("1497366216548-37526070297c"),
  farmlandSunset: img("1500382017468-9049fed747ef"),
};

export const interiors = {
  penthouseLivingRoomView: img("1600210492486-724fe5c67fb0"),
  brightLivingRoom: img("1600607687939-ce8a6c25118c"),
  whiteModernKitchen: img("1600585152220-90363fe7e115"),
  brightCondoLivingRoom: img("1522708323590-d24dbb6b0267"),
  officeLounge: img("1524758631624-e2822e304c36"),
  coffeeJournalFlatlay: img("1518481612222-68bbe828ecd1"),
};

export const business = {
  handshake: img("1521791136064-7986c2920216"),
  highFiveDuo: img("1600880292203-757bb62b4baf"),
  teamMeetingTable: img("1573167243872-43c6433b9d40"),
  laptopOnDesk: img("1487017159836-4e23ece2e4cf"),
  teamCollaboration: img("1622675363311-3e1904dc1885"),
};

// Portraits — kept unique per named person within the same page
export const portraits = {
  womanGrayBlazer: img("1573496359142-b8d87734a5a2", 800),
  manConfidentSuit: img("1519085360753-af0119f7cbe7", 800),
  manGlassesProfessional: img("1560250097-0b93528c311a", 800),
  womanLaughingRed: img("1494790108377-be9c29b29330", 800),
  manGraySweater: img("1500648767791-00dcc994a43e", 800),
  womanStripedBlazer: img("1573497019940-1c28c88b4f3e", 800),
  olderManGlasses: img("1472099645785-5658abf4ff4e", 800),
  womanSmilingCasual: img("1580489944761-15a19d654956", 800),
  manSmilingWhiteShirt: img("1507003211169-0a1dd7228f2d", 800),
  manCleanCutGray: img("1590086782957-93c06ef21604", 800),
  manCasualBeardedGlasses: img("1568602471122-7832951cc4c5", 800),
  womanMoodyPortrait: img("1601412436009-d964bd02edbc", 800),
};

export const galleryPool = [
  interiors.brightLivingRoom,
  interiors.whiteModernKitchen,
  interiors.penthouseLivingRoomView,
  interiors.brightCondoLivingRoom,
  interiors.officeLounge,
  exteriors.glassOfficeTowers,
];
