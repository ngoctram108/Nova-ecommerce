import { Product } from '@/lib/types';
import { slugify } from '@/lib/utils';

export const CATEGORY_STRUCTURE = {
  nu: {
    name: 'Nữ',
    groups: {
      ao: ['Áo', 'T-shirt', 'Sơ mi', 'Blouse', 'Polo', 'Áo len', 'Cardigan', 'Hoodie', 'Áo khoác', 'Blazer'],
      quan_vay: ['Quần jeans', 'Quần tây', 'Quần short', 'Chân váy', 'Đầm/Váy', 'Jumpsuit'],
      do_khac: ['Đồ thể thao', 'Đồ ngủ', 'Đồ bộ', 'Đồ bơi'],
      phu_kien: ['Túi xách', 'Giày', 'Sandal', 'Dép', 'Phụ kiện']
    },
    subcategories: [
      { name: 'T-shirt', keywords: ['t-shirt', 'áo thun', 'tee'] },
      { name: 'Sơ mi', keywords: ['sơ mi', 'shirt'] },
      { name: 'Blouse', keywords: ['blouse', 'áo kiểu'] },
      { name: 'Polo', keywords: ['polo'] },
      { name: 'Áo len', keywords: ['áo len', 'sweater', 'knit', 'merino'] },
      { name: 'Cardigan', keywords: ['cardigan'] },
      { name: 'Hoodie', keywords: ['hoodie'] },
      { name: 'Áo khoác', keywords: ['áo khoác', 'jacket', 'coat', 'parka'] },
      { name: 'Blazer', keywords: ['blazer'] },
      { name: 'Áo', keywords: ['áo top', 'áo croptop', 'áo dây', 'áo ống', 'tank top', 'áo'] }, // Fallback for general tops
      
      { name: 'Quần jeans', keywords: ['jeans', 'quần jean', 'denim'] },
      { name: 'Quần tây', keywords: ['quần tây', 'trousers', 'quần âu'] },
      { name: 'Quần short', keywords: ['quần short', 'quần đùi', 'short'] },
      { name: 'Chân váy', keywords: ['chân váy', 'skirt'] },
      { name: 'Đầm/Váy', keywords: ['đầm', 'váy', 'dress', 'maxi', 'bodycon'] },
      { name: 'Jumpsuit', keywords: ['jumpsuit', 'đồ bay'] },
      
      { name: 'Đồ thể thao', keywords: ['thể thao', 'activewear', 'gym', 'sports bra', 'chạy bộ'] },
      { name: 'Đồ ngủ', keywords: ['đồ ngủ', 'sleepwear', 'nightwear', 'pijama'] },
      { name: 'Đồ bộ', keywords: ['đồ bộ', 'set'] },
      { name: 'Đồ bơi', keywords: ['đồ bơi', 'swimwear', 'bikini'] },
      
      { name: 'Túi xách', keywords: ['túi xách', 'túi', 'bag', 'tote', 'clutch'] },
      { name: 'Giày', keywords: ['giày', 'shoe', 'sneaker', 'boot', 'loafer', 'cao gót'] },
      { name: 'Sandal', keywords: ['sandal'] },
      { name: 'Dép', keywords: ['dép', 'slipper'] },
      { name: 'Phụ kiện', keywords: ['kính', 'mũ', 'nón', 'trang sức', 'khăn', 'phụ kiện'] },
    ]
  },
  nam: {
    name: 'Nam',
    groups: {
      ao: ['T-shirt', 'Sơ mi', 'Polo', 'Áo len', 'Hoodie', 'Sweater', 'Áo khoác', 'Blazer', 'Vest'],
      quan: ['Quần jeans', 'Quần tây', 'Quần short', 'Jogger', 'Cargo'],
      do_khac: ['Đồ thể thao', 'Đồ ngủ', 'Đồ bộ', 'Đồ bơi'],
      phu_kien: ['Sneaker', 'Giày', 'Sandal', 'Dép', 'Balo/Túi', 'Ví', 'Thắt lưng', 'Mũ', 'Phụ kiện']
    },
    subcategories: [
      { name: 'T-shirt', keywords: ['t-shirt', 'áo thun', 'tee'] },
      { name: 'Sơ mi', keywords: ['sơ mi', 'shirt'] },
      { name: 'Polo', keywords: ['polo'] },
      { name: 'Áo len', keywords: ['áo len', 'knit', 'merino'] },
      { name: 'Hoodie', keywords: ['hoodie'] },
      { name: 'Sweater', keywords: ['sweater'] },
      { name: 'Áo khoác', keywords: ['áo khoác', 'jacket', 'coat', 'parka'] },
      { name: 'Blazer', keywords: ['blazer'] },
      { name: 'Vest', keywords: ['vest', 'suit'] },
      
      { name: 'Quần jeans', keywords: ['jeans', 'quần jean', 'denim'] },
      { name: 'Quần tây', keywords: ['quần tây', 'trousers', 'quần âu', 'chinos'] },
      { name: 'Quần short', keywords: ['quần short', 'quần đùi', 'short'] },
      { name: 'Jogger', keywords: ['jogger'] },
      { name: 'Cargo', keywords: ['cargo'] },
      
      { name: 'Đồ thể thao', keywords: ['thể thao', 'activewear', 'gym', 'chạy bộ'] },
      { name: 'Đồ ngủ', keywords: ['đồ ngủ', 'sleepwear', 'pijama'] },
      { name: 'Đồ bộ', keywords: ['đồ bộ', 'set'] },
      { name: 'Đồ bơi', keywords: ['đồ bơi', 'swimwear'] },
      
      { name: 'Sneaker', keywords: ['sneaker'] },
      { name: 'Giày', keywords: ['giày', 'shoe', 'boot', 'loafer', 'oxford'] },
      { name: 'Sandal', keywords: ['sandal'] },
      { name: 'Dép', keywords: ['dép', 'slipper'] },
      { name: 'Balo/Túi', bag: true, keywords: ['balo', 'backpack', 'túi xách', 'túi', 'bag', 'duffle', 'weekender'] },
      { name: 'Ví', keywords: ['ví', 'wallet'] },
      { name: 'Thắt lưng', keywords: ['thắt lưng', 'belt'] },
      { name: 'Mũ', keywords: ['mũ', 'nón', 'hat', 'cap', 'beanie'] },
      { name: 'Phụ kiện', keywords: ['kính', 'trang sức', 'khăn', 'phụ kiện', 'keychain', 'đồng hồ', 'watch'] },
    ]
  }
};

export function autoCategorizeProduct(product: Partial<Product>): Partial<Product> {
  const textToSearch = `${product.name} ${product.description} ${product.category}`.toLowerCase();
  
  // 1. Detect Gender (Category)
  let gender: 'nam' | 'nu' = 'nu'; // Default to female based on user request focus
  
  if (textToSearch.includes('nam ') || textToSearch.includes('men') || textToSearch.includes('boy')) {
    gender = 'nam';
  } else if (textToSearch.includes('nữ ') || textToSearch.includes('women') || textToSearch.includes('girl')) {
    gender = 'nu';
  } else if (
    textToSearch.includes('chinos') || 
    textToSearch.includes('oxford') ||
    textToSearch.includes('briefcase')
  ) {
    // some hints towards men's wear
    gender = 'nam';
  }

  // 2. Detect Subcategory based on chosen gender
  const ruleSet = CATEGORY_STRUCTURE[gender].subcategories;
  let foundSubcategory = 'Phụ kiện'; // Fallback
  
  for (const sub of ruleSet) {
    if (sub.keywords.some(kw => textToSearch.includes(kw))) {
      foundSubcategory = sub.name;
      break;
    }
  }

  // 3. Generate automatic tags
  const tags: string[] = [];
  const materials = ['cotton', 'linen', 'wool', 'cashmere', 'silk', 'leather', 'denim', 'nylon', 'lụa', 'vải', 'len'];
  materials.forEach(mat => {
    if (textToSearch.includes(mat)) tags.push(mat);
  });
  
  const categoryName = gender === 'nam' ? 'Nam' : 'Nữ';
  tags.push(slugify(categoryName));
  tags.push(slugify(foundSubcategory));

  return {
    ...product,
    category: categoryName,
    categorySlug: slugify(categoryName),
    subcategory: foundSubcategory,
    subcategorySlug: slugify(foundSubcategory),
    tags: Array.from(new Set(tags)), // Unique tags
  };
}
