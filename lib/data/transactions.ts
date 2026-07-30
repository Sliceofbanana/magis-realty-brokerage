import { Transaction } from "@/lib/types";
import { exteriors, interiors } from "@/lib/stockPhotos";

export const transactions: Transaction[] = [
  {
    id: "1",
    property: "The Obsidian Penthouse",
    location: "San Francisco, CA",
    image: exteriors.darkModernHouseDusk,
    salePrice: 4250000,
    commissionPercent: 3.5,
    commissionAmount: 148750,
    status: "Paid",
  },
  {
    id: "2",
    property: "Marble Creek Estate",
    location: "Napa Valley, CA",
    image: exteriors.suburbanHouseDay,
    salePrice: 2800000,
    commissionPercent: 3.0,
    commissionAmount: 84000,
    status: "Pending",
  },
  {
    id: "3",
    property: "Azure Coast Villa",
    location: "Malibu, CA",
    image: exteriors.whiteVillaPoolDay,
    salePrice: 7500000,
    commissionPercent: 2.8,
    commissionAmount: 210000,
    status: "Paid",
  },
  {
    id: "4",
    property: "The Lofts at South Market",
    location: "Los Angeles, CA",
    image: interiors.brightCondoLivingRoom,
    salePrice: 1150000,
    commissionPercent: 3.2,
    commissionAmount: 36800,
    status: "In Review",
  },
];
