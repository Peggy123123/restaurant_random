/**
 * 餐廳資料型別定義
 */
export interface Restaurant {
  place_id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  price_level: number;
  /** 餐廳簡短描述 */
  description?: string;
  /** 官方網站網址 */
  website?: string;
  /** 若存在，代表以新金額篩選；若不存在可回退以 price_level 映射 */
  average_price?: number;
  types: string[];
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  distance_m: number;
  station: {
    name: string;
    line: string;
  };
  photos: RestaurantPhoto[];
}

/**
 * 餐廳照片型別定義
 */
export interface RestaurantPhoto {
  photo_reference: string;
  width: number;
  height: number;
  html_attributions: string[];
}

/**
 * 捷運站資料型別定義
 */
export interface Station {
  id: string;
  name: string;
  line: string;
  location: {
    lat: number;
    lng: number;
  };
}

/**
 * 捷運線別型別定義
 */
export interface MetroLine {
  id: string;
  name: string;
  backgroundColor: string;
  stations: Station[];
}

/**
 * 篩選條件型別定義
 */
export interface FilterOptions {
  /** 金額下限（單位：元） */
  budgetMin: number;
  /** 金額上限（單位：元），可為 Infinity 代表無上限 */
  budgetMax: number;
  distance: number; // 單位：公尺
  types: string[];
  rating: number; // 0-5
  fromFavorites: boolean;
  fromVisited: boolean;
}

/**
 * 使用者動作型別定義
 */
export interface UserAction {
  restaurantId: string;
  action: 'favorite' | 'visited' | 'dislike';
  timestamp: number;
}

/**
 * 按鈕樣式型別定義
 */
export interface ButtonStyle {
  buttonStyle?: {
    position?: string;
    width?: string;
    display?: string;
    layout?: string;
    boxSizing?: string;
    padding?: string;
    color?: string;
    hoverColor?: string;
    fontWeight?: string;
    fontSize?: string;
    borderWidth?: string;
    borderRadius?: string;
    borderColor?: string;
    hoverBorderColor?: string;
    bgColor?: string;
    hoverBgColor?: string;
    gap?: string;
    duration?: string;
    cursor?: string;
    classes?: string;
  };
  iconStyle?: {
    fontSize?: string;
    order?: string;
    classes?: string;
  };
}
