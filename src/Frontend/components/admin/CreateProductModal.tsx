'use client';

import React, { useState } from 'react';
import { X, Search, Image as ImageIcon, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/Frontend/components/ui';
import { useToast } from '@/Frontend/components/ui/Toast';

interface CreateProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: string[];
}

interface ProductImage {
  url: string;
  alt: string;
  source: string;
}

interface VariantInput {
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  stock: string;
  price: string;
  lowStockThreshold: string;
}

export default function CreateProductModal({ onClose, onSuccess, categories }: CreateProductModalProps) {
  const { success, error: showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'variants'>('info');

  // Basic Info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [compareAt, setCompareAt] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [subcategorySlug, setSubcategorySlug] = useState('');
  const [description, setDescription] = useState('');

  // Images
  const [images, setImages] = useState<ProductImage[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [validatingImage, setValidatingImage] = useState(false);
  const [searchingImage, setSearchingImage] = useState(false);

  // Variants
  const [variants, setVariants] = useState<VariantInput[]>([]);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (val: string) => {
    setName(val);
    if (!val) setErrors(e => ({ ...e, name: 'Tên sản phẩm không được để trống' }));
    else setErrors(e => ({ ...e, name: '' }));
    
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleValidateImage = async () => {
    if (!imageUrl) return;
    setValidatingImage(true);
    try {
      const res = await fetch('/api/images/search', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, imageAlt: name })
      });
      const data = await res.json();
      if (data.success) {
        setImages([...images, { url: data.data.imageUrl, alt: data.data.imageAlt, source: data.data.imageSourceUrl }]);
        setImageUrl('');
        success('Đã thêm ảnh');
      } else {
        showError(data.error || 'URL ảnh không hợp lệ');
      }
    } catch {
      showError('Lỗi kết nối');
    } finally {
      setValidatingImage(false);
    }
  };

  const handleSearchImage = async () => {
    if (!name && !brand) return showError('Vui lòng nhập tên sản phẩm hoặc thương hiệu để tìm kiếm');
    setSearchingImage(true);
    try {
      const query = `${brand} ${name}`.trim();
      const res = await fetch('/api/images/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (data.success) {
        setImages([...images, { url: data.data.imageUrl, alt: data.data.imageAlt, source: data.data.imageSourceUrl }]);
        success('Đã thêm ảnh tự động');
      } else {
        showError(data.error || 'Không tìm thấy ảnh');
      }
    } catch {
      showError('Lỗi kết nối');
    } finally {
      setSearchingImage(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    if (mainImageIndex >= newImages.length) setMainImageIndex(0);
  };

  const addVariant = () => {
    const baseSku = slug ? `${slug.toUpperCase()}-${variants.length + 1}` : `SKU-${variants.length + 1}`;
    setVariants([...variants, { colorName: '', colorHex: '#000000', size: '', sku: baseSku, stock: '0', price: '', lowStockThreshold: '5' }]);
  };

  const updateVariant = (index: number, field: keyof VariantInput, value: string) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
    
    // Clear error for this variant if exists
    if (errors[`variant_${index}_${field}`]) {
      setErrors(e => ({ ...e, [`variant_${index}_${field}`]: '' }));
    }
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = 'Tên sản phẩm bắt buộc';
    if (!slug) newErrors.slug = 'Slug bắt buộc';
    if (!brand) newErrors.brand = 'Thương hiệu bắt buộc';
    if (!price || parseFloat(price) <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (!categorySlug) newErrors.categorySlug = 'Danh mục bắt buộc';

    if (variants.length > 0) {
      const skus = variants.map(v => v.sku);
      if (new Set(skus).size !== skus.length) {
        newErrors.variant_global = 'Có SKU bị trùng lặp trong các variant';
      }
      
      const combos = variants.map(v => `${v.colorName}-${v.size}`);
      if (new Set(combos).size !== combos.length) {
        newErrors.variant_global = 'Có tổ hợp Màu + Size bị trùng lặp';
      }

      variants.forEach((v, i) => {
        if (!v.colorName) newErrors[`variant_${i}_colorName`] = 'Màu bắt buộc';
        if (!v.size) newErrors[`variant_${i}_size`] = 'Size bắt buộc';
        if (!v.sku) newErrors[`variant_${i}_sku`] = 'SKU bắt buộc';
        if (parseInt(v.stock) < 0) newErrors[`variant_${i}_stock`] = 'Tồn kho không được âm';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Vui lòng kiểm tra lại các trường bị lỗi');
      return;
    }

    setSaving(true);
    try {
      const apiVariants = variants.map(v => ({
        name: `${v.colorName} - ${v.size}`,
        sku: v.sku,
        stock: parseInt(v.stock) || 0,
        price: v.price ? parseFloat(v.price) : null,
        lowStockThreshold: parseInt(v.lowStockThreshold) || 5,
        attributes: { color: v.colorName, size: v.size }
      }));

      const uniqueColors = Array.from(new Set(variants.map(v => v.colorName))).map(colorName => {
        const v = variants.find(x => x.colorName === colorName);
        return { name: v?.colorName, hex: v?.colorHex };
      });
      const uniqueSizes = Array.from(new Set(variants.map(v => v.size)));

      const mainImage = images.length > 0 ? images[mainImageIndex] : null;

      const payload = {
        name,
        slug,
        brand,
        description,
        price: parseFloat(price),
        compareAt: compareAt ? parseFloat(compareAt) : null,
        categorySlug,
        subcategorySlug: subcategorySlug || null,
        thumbnail: mainImage ? mainImage.url : 'https://placehold.co/800',
        images: images,
        imageUrl: mainImage ? mainImage.url : null,
        imageAlt: mainImage ? mainImage.alt : null,
        imageSourceUrl: mainImage ? mainImage.source : null,
        variants: apiVariants.length > 0 ? apiVariants : undefined,
        colors: uniqueColors.length > 0 ? uniqueColors : undefined,
        sizes: uniqueSizes.length > 0 ? uniqueSizes : undefined,
        stock: apiVariants.length === 0 ? 0 : undefined 
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        success('Tạo sản phẩm thành công');
        onSuccess();
      } else {
        showError(data.error || 'Không thể tạo sản phẩm');
      }
    } catch (e) {
      showError('Lỗi kết nối hoặc hệ thống');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (label: string, value: string, onChange: (val: string) => void, errorKey: string, props: any = {}) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-ink-muted-80)' }}>{label}</label>
      <input 
        value={value} 
        onChange={e => {
          onChange(e.target.value);
          if (errors[errorKey]) setErrors(errs => ({ ...errs, [errorKey]: '' }));
        }} 
        style={{ ...inputStyle, borderColor: errors[errorKey] ? 'var(--color-danger)' : 'var(--color-hairline)' }} 
        {...props} 
      />
      {errors[errorKey] && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors[errorKey]}</div>}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
    }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)',
          width: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: 'var(--space-lg) var(--space-xl)', borderBottom: '1px solid var(--color-divider-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Thêm sản phẩm mới</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="var(--color-ink-muted-80)" />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-divider-soft)' }}>
          {[
            { id: 'info', label: 'Thông tin chung' },
            { id: 'images', label: `Hình ảnh (${images.length})` },
            { id: 'variants', label: `Phân loại (${variants.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: activeTab === t.id ? 600 : 400,
                color: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-ink-muted-80)',
                borderBottom: activeTab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent'
              }}
            >
              {t.label}
              {Object.keys(errors).some(k => k.includes(t.id === 'variants' ? 'variant' : t.id)) && <span style={{ color: 'var(--color-danger)', marginLeft: 6 }}>•</span>}
            </button>
          ))}
        </div>

        <div style={{ padding: 'var(--space-xl)', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: activeTab === 'info' ? 'block' : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {renderInput('Tên sản phẩm *', name, handleNameChange, 'name', { placeholder: 'VD: Áo Thun' })}
              {renderInput('Thương hiệu *', brand, setBrand, 'brand')}
            </div>
            {renderInput('Slug * (Tạo tự động)', slug, setSlug, 'slug')}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {renderInput('Giá bán (VND) *', price, setPrice, 'price', { type: 'number' })}
              {renderInput('Giá so sánh (VND)', compareAt, setCompareAt, 'compareAt', { type: 'number', placeholder: 'Không bắt buộc' })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-ink-muted-80)' }}>Danh mục *</label>
                <select value={categorySlug} onChange={e => { setCategorySlug(e.target.value); setErrors(errs => ({ ...errs, categorySlug: '' })); }} style={{ ...inputStyle, backgroundColor: '#fff', borderColor: errors.categorySlug ? 'var(--color-danger)' : 'var(--color-hairline)' }}>
                  <option value="">Chọn danh mục</option>
                  <option value="men">Nam</option>
                  <option value="women">Nữ</option>
                  {categories.filter(c => c !== 'men' && c !== 'women').map(c => (
                    <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>
                  ))}
                </select>
                {errors.categorySlug && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors.categorySlug}</div>}
              </div>
              {renderInput('Loại sản phẩm (Subcategory)', subcategorySlug, setSubcategorySlug, 'subcategorySlug')}
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-ink-muted-80)' }}>Mô tả</label>
              <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ display: activeTab === 'images' ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-ink-muted-80)' }}>Thêm ảnh qua URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="https://..." />
                <Button variant="outline" onClick={handleValidateImage} loading={validatingImage}>Kiểm tra & Thêm</Button>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>Hoặc</span>
              <Button variant="outline" onClick={handleSearchImage} loading={searchingImage}>
                <Search size={16} style={{ marginRight: 6 }} /> Tìm ảnh tự động
              </Button>
            </div>

            {images.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Danh sách hình ảnh ({images.length})</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ 
                      width: 120, height: 120, position: 'relative', borderRadius: 8, 
                      border: mainImageIndex === i ? '2px solid var(--color-primary)' : '1px solid var(--color-hairline)',
                      overflow: 'hidden', cursor: 'pointer' 
                    }} onClick={() => setMainImageIndex(i)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(i); }} 
                        style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      {mainImageIndex === i && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--color-primary)', color: '#fff', fontSize: 10, textAlign: 'center', padding: '2px 0', fontWeight: 600 }}>
                          ẢNH CHÍNH
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: activeTab === 'variants' ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>Quản lý biến thể (Màu, Size, Giá riêng, Tồn kho).</p>
                {errors.variant_global && <p style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 4 }}>{errors.variant_global}</p>}
              </div>
              <Button size="sm" onClick={addVariant}><Plus size={16} style={{ marginRight: 4 }} /> Thêm Variant</Button>
            </div>

            {variants.length > 0 && (
              <div style={{ border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-lg)', overflow: 'hidden', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
                  <thead style={{ backgroundColor: 'var(--color-surface-pearl)', borderBottom: '1px solid var(--color-divider-soft)' }}>
                    <tr>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>Màu sắc *</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', width: 60 }}>Hex</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>Size *</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>SKU *</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>Giá riêng (Opt)</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', width: 80 }}>Tồn kho *</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', width: 80 }}>Low Stock</th>
                      <th style={{ padding: '10px 12px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-divider-soft)' }}>
                        <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                          <input value={v.colorName} onChange={e => updateVariant(i, 'colorName', e.target.value)} style={{ ...tdInputStyle, borderColor: errors[`variant_${i}_colorName`] ? 'var(--color-danger)' : 'var(--color-hairline)' }} placeholder="Đen" />
                        </td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                          <input type="color" value={v.colorHex} onChange={e => updateVariant(i, 'colorHex', e.target.value)} style={{ width: 30, height: 30, padding: 0, border: 'none', cursor: 'pointer' }} />
                        </td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                          <input value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} style={{ ...tdInputStyle, borderColor: errors[`variant_${i}_size`] ? 'var(--color-danger)' : 'var(--color-hairline)' }} placeholder="XL" />
                        </td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                          <input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} style={{ ...tdInputStyle, borderColor: errors[`variant_${i}_sku`] ? 'var(--color-danger)' : 'var(--color-hairline)' }} />
                        </td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                          <input type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} style={tdInputStyle} placeholder="Chung" />
                        </td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                          <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} style={{ ...tdInputStyle, borderColor: errors[`variant_${i}_stock`] ? 'var(--color-danger)' : 'var(--color-hairline)' }} min="0" />
                        </td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                          <input type="number" value={v.lowStockThreshold} onChange={e => updateVariant(i, 'lowStockThreshold', e.target.value)} style={tdInputStyle} min="0" />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', verticalAlign: 'top' }}>
                          <button onClick={() => removeVariant(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', marginTop: 6 }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {variants.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-xxl)', border: '1px dashed var(--color-hairline)', borderRadius: 'var(--rounded-lg)', color: 'var(--color-ink-muted-80)' }}>
                Sản phẩm chưa có variant nào.
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: 'var(--space-lg) var(--space-xl)', borderTop: '1px solid var(--color-divider-soft)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={handleSave} loading={saving}>Lưu sản phẩm</Button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--rounded-sm)',
  border: '1px solid var(--color-hairline)',
  outline: 'none',
  fontSize: 14,
  transition: 'border-color 0.15s'
};

const tdInputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '4px',
  border: '1px solid var(--color-hairline)',
  outline: 'none',
  fontSize: 13,
  transition: 'border-color 0.15s'
};
