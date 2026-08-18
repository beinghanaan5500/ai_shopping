export interface Requirements {
  category: string;
  maxBudget: number | null;
  useCases: string[];
  priorities: string[];
  mustHaveSpecs: Record<string, string>;
  searchKeywords: string[];
}

export interface ProductSpecs {
  battery?: string;
  performance?: string;
  display?: string;
  storage?: string;
  camera?: string;
  portability?: string;
  durability?: string;
  sound?: string;
  comfort?: string;
  weight?: string;
  design?: string;
  gaming?: string;
  productivity?: string;
  budget?: string;
  price?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: number;
  title: string;
  brand: string;
  price: number;
  rating: number;
  category: string;
  sourceCategory?: string;
  sourcePrice?: number;
  sourceCurrency?: string;
  priceINR?: number;
  thumbnail: string;
  images: string[];
  description: string;
  discountPercentage: number;
  stock: number;
  tags: string[];
  specs: ProductSpecs;
  dataQuality?: "high" | "medium" | "low";
}

export interface ScoreBreakdown {
  budgetFit: number;
  priorityMatch: number;
  useCaseFit: number;
  ratingNorm: number;
  specMatch: number;
  total: number;
}

export interface RankedProduct extends Product {
  score: ScoreBreakdown;
  matchPercentage: number;
  reasons: MatchReason[];
  tradeoff?: string;
}

export interface MatchReason {
  label: string;
  type: "positive" | "neutral" | "warning";
}

export type AppStage =
  | "landing"
  | "analyzing"
  | "requirements"
  | "results";

export interface AnalysisResult {
  requirements: Requirements;
  products: RankedProduct[];
}
