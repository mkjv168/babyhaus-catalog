/**
 * Simple CSV parser that handles quoted fields with commas and newlines.
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell.trim());
        cell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        if (char === '\r') i++; // skip \n in \r\n
        row.push(cell.trim());
        if (row.some((c) => c.length > 0)) {
          rows.push(row);
        }
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }
  }

  // Push final cell and row
  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) {
    rows.push(row);
  }

  return rows;
}

export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.toLowerCase().trim().replace(/\s+/g, '_'));
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

export const BULK_IMPORT_TEMPLATE = `name,brand,category,description,featured,image_url,image_url_2,image_url_3,image_url_4,variant_name,variant_sku,variant_price,variant_stock_status,variant_stock_quantity
"Baby Bottle 250ml","Dr. Brown's","Feeding","Anti-colic baby bottle",false,https://example.com/bottle1.jpg,,,,Default,,12.99,instock,15
"Organic Cotton Onesie","Carter's","Clothing","Soft organic cotton onesie",true,https://example.com/onesie.jpg,https://example.com/onesie2.jpg,,,Default,,8.50,instock,30
"Pamper NightTime Diaper","Pampers","Diapers","Overnight protection diaper",false,https://example.com/diaper.jpg,,,,Size M - 52 pcs,PMP-M-52,22.00,instock,20
"Pamper NightTime Diaper","Pampers","Diapers","Overnight protection diaper",false,https://example.com/diaper.jpg,,,,Size L - 48 pcs,PMP-L-48,22.00,instock,15
"Pamper NightTime Diaper","Pampers","Diapers","Overnight protection diaper",false,https://example.com/diaper.jpg,,,,Size XL - 42 pcs,PMP-XL-42,22.00,outofstock,0`;

export interface ImportVariant {
  name: string;
  sku?: string;
  price?: number;
  stockStatus: string;
  stockQuantity: number;
}

export interface ImportProduct {
  name: string;
  brand?: string;
  category: string;
  description?: string;
  featured: boolean;
  imageUrls: string[];
  variants: ImportVariant[];
}

/**
 * Group CSV rows into products with variants.
 * Rows with the same name+category are grouped as one product.
 */
export function groupRowsIntoProducts(objects: Record<string, string>[]): ImportProduct[] {
  const productMap = new Map<string, ImportProduct>();

  for (const obj of objects) {
    const name = obj.name?.trim();
    const category = obj.category?.trim();
    if (!name || !category) continue;

    const key = `${name}|${category}`;

    if (!productMap.has(key)) {
      const imageUrls: string[] = [
        obj.image_url,
        obj.image_url_2,
        obj.image_url_3,
        obj.image_url_4,
      ].filter((url) => typeof url === 'string' && url.trim().length > 0);

      productMap.set(key, {
        name,
        brand: obj.brand?.trim() || undefined,
        category,
        description: obj.description?.trim() || undefined,
        featured: obj.featured?.toLowerCase() === 'true',
        imageUrls: imageUrls.length > 0 ? imageUrls : [],
        variants: [],
      });
    }

    const product = productMap.get(key)!;

    // Build variant from row
    const variantName = obj.variant_name?.trim();
    const variantSku = obj.variant_sku?.trim() || obj.sku?.trim();
    const variantPrice = obj.variant_price?.trim() || obj.price?.trim();
    const variantStockStatus = obj.variant_stock_status?.trim() || obj.stock_status?.trim() || 'instock';
    const variantStockQty = obj.variant_stock_quantity?.trim() || obj.stock_quantity?.trim() || '0';

    product.variants.push({
      name: variantName || 'Default',
      sku: variantSku || '',
      price: variantPrice ? parseFloat(variantPrice) : undefined,
      stockStatus: ['instock', 'outofstock', 'preorder'].includes(variantStockStatus) ? variantStockStatus : 'instock',
      stockQuantity: parseInt(variantStockQty, 10) || 0,
    });
  }

  return Array.from(productMap.values());
}
