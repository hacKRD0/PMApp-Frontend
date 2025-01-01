// types.ts
export interface Sector {
  id: number;
  name: string;
}

export interface StockMaster {
  id: number;
  name: string;
  code: string;
  SectorId: number;
  Sector: Sector;
}

export type Brokerage = {
  id: number;
  name: string;
};
