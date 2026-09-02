import { NextRequest, NextResponse } from 'next/server';
import { queryProducts } from '@/Backend/services/catalog';
import { ProductFilters } from '@/Shared/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query string
    const filters: ProductFilters = {};
    
    const q = searchParams.get('q');
    if (q) filters.q = q;
    
    const category = searchParams.get('category');
    if (category) filters.category = category;
    
    const brand = searchParams.get('brand');
    if (brand) filters.brand = brand;
    
    const minPrice = searchParams.get('minPrice');
    if (minPrice) filters.minPrice = Number(minPrice);
    
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    
    const color = searchParams.get('color');
    if (color) filters.color = color;
    
    const size = searchParams.get('size');
    if (size) filters.size = size;
    
    const badge = searchParams.get('badge');
    if (badge) filters.badge = badge as any;
    
    const inStock = searchParams.get('inStock');
    if (inStock === 'true') filters.inStock = true;
    
    // Parse pagination & sorting
    const page = searchParams.get('page');
    if (page) filters.page = Number(page);
    
    const limit = searchParams.get('limit');
    if (limit) filters.limit = Number(limit);
    
    const sort = searchParams.get('sort');
    if (sort) filters.sort = sort as any;
    
    // Query the catalog service
    const result = await queryProducts(filters);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
