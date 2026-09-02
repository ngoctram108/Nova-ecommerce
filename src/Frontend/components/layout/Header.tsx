'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X, ChevronRight, ChevronDown } from 'lucide-react';
import { useCart } from '@/Frontend/contexts/CartContext';
import { useAuth } from '@/Frontend/contexts/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Conditionally render mobile subcategories
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  
  // Conditionally render desktop mega menus
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { user } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setExpandedMobileCategory(null); // Reset when closing
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDesktopMenu(null);
    setIsSearchOpen(false);
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get('q') || '');
    }
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileCategory = (cat: string) => {
    setExpandedMobileCategory(prev => prev === cat ? null : cat);
  };

  const handleMouseEnter = (menu: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveDesktopMenu(menu);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDesktopMenu(null);
    }, 150);
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : styles.headerTransparent}`}>
        <div className={styles.container}>
          
          {/* ======================= */}
          {/* MOBILE HEADER (< 1024px) */}
          {/* ======================= */}
          <div className={styles.mobileNav}>
            <button
              className={styles.iconBtn}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
            
            <Link href="/" className={styles.mobileLogo}>
              NORA
            </Link>

            <div className={styles.mobileIconGroup}>
              <button className={styles.iconBtn} onClick={() => setIsMobileMenuOpen(true)} aria-label="Tìm kiếm">
                <Search size={22} strokeWidth={1.5} />
              </button>
              <Link href="/cart" className={styles.iconBtn} aria-label="Giỏ hàng">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className={`${styles.badge} ${styles.mobileBadge}`}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* ======================= */}
          {/* DESKTOP HEADER (>= 1024px) */}
          {/* ======================= */}
          <div className={styles.desktopNav}>
            {/* Logo */}
            <Link href="/" className={styles.logo}>
              NORA
            </Link>

            {/* Desktop Nav - 1 HÀNG DUY NHẤT */}
            <nav className={styles.navLinks}>
              <Link href="/products?sort=newest" className={styles.navItem}>
                Sản phẩm mới
              </Link>
              
              <div 
                className={styles.navItem}
                onMouseEnter={() => handleMouseEnter('nu')}
                onMouseLeave={handleMouseLeave}
              >
                <Link href="/products?category=nu">
                  Nữ
                </Link>
              </div>

              <div 
                className={styles.navItem}
                onMouseEnter={() => handleMouseEnter('nam')}
                onMouseLeave={handleMouseLeave}
              >
                <Link href="/products?category=nam">
                  Nam
                </Link>
              </div>

              <Link href="/products?category=phu-kien" className={styles.navItem}>Phụ kiện</Link>
              <Link href="/products?badge=SALE" className={styles.navItemSale}>Sale</Link>
            </nav>

            {/* Desktop Icons */}
            <div className={styles.icons}>
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    onBlur={() => {
                      if (!searchQuery) setIsSearchOpen(false);
                    }}
                  />
                  <button type="submit" className={styles.iconBtn} aria-label="Tìm kiếm">
                    <Search size={22} strokeWidth={1.5} />
                  </button>
                </form>
              ) : (
                <button className={styles.iconBtn} onClick={() => { setIsSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }} aria-label="Tìm kiếm">
                  <Search size={22} strokeWidth={1.5} />
                </button>
              )}
              <Link href={user?.role === 'ADMIN' ? '/admin' : '/account'} className={styles.iconBtn} aria-label="Tài khoản">
                <User size={22} strokeWidth={1.5} />
              </Link>
              <Link href="/cart" className={styles.iconBtn} aria-label="Giỏ hàng">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className={styles.badge}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* DESKTOP MEGA MENUS (RENDERED CONDITIONALLY) */}
        {/* ========================================= */}
        {activeDesktopMenu === 'nu' && (
          <div 
            className={styles.megaMenu}
            onMouseEnter={() => handleMouseEnter('nu')}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.megaMenuContainer}>
              <div className={styles.megaMenuGrid}>
                <div className={styles.megaMenuCol}>
                  <Link href="/products?category=nu&subcategory=ao" className={styles.megaMenuLink}>Áo</Link>
                  <Link href="/products?category=nu&subcategory=quan" className={styles.megaMenuLink}>Quần</Link>
                  <Link href="/products?category=nu&subcategory=dam-vay" className={styles.megaMenuLink}>Váy / Đầm</Link>
                </div>
                <div className={styles.megaMenuCol}>
                  <Link href="/products?category=nu&subcategory=jumpsuit" className={styles.megaMenuLink}>Jumpsuit</Link>
                  <Link href="/products?category=nu&subcategory=do-the-thao" className={styles.megaMenuLink}>Đồ thể thao</Link>
                  <Link href="/products?category=nu&subcategory=do-ngu" className={styles.megaMenuLink}>Đồ ngủ</Link>
                </div>
                <div className={styles.megaMenuCol}>
                  <Link href="/products?category=nu&subcategory=giay" className={styles.megaMenuLink}>Giày</Link>
                  <Link href="/products?category=nu&subcategory=tui-xach" className={styles.megaMenuLink}>Túi xách</Link>
                  <Link href="/products?category=nu&subcategory=phu-kien" className={styles.megaMenuLink}>Phụ kiện</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDesktopMenu === 'nam' && (
          <div 
            className={styles.megaMenu}
            onMouseEnter={() => handleMouseEnter('nam')}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.megaMenuContainer}>
              <div className={styles.megaMenuGrid}>
                <div className={styles.megaMenuCol}>
                  <Link href="/products?category=nam&subcategory=t-shirt" className={styles.megaMenuLink}>T-shirt</Link>
                  <Link href="/products?category=nam&subcategory=so-mi" className={styles.megaMenuLink}>Sơ mi</Link>
                  <Link href="/products?category=nam&subcategory=polo" className={styles.megaMenuLink}>Polo</Link>
                  <Link href="/products?category=nam&subcategory=ao-khoac" className={styles.megaMenuLink}>Áo khoác</Link>
                </div>
                <div className={styles.megaMenuCol}>
                  <Link href="/products?category=nam&subcategory=quan-jeans" className={styles.megaMenuLink}>Quần jeans</Link>
                  <Link href="/products?category=nam&subcategory=quan-tay" className={styles.megaMenuLink}>Quần tây</Link>
                  <Link href="/products?category=nam&subcategory=quan-short" className={styles.megaMenuLink}>Quần short</Link>
                  <Link href="/products?category=nam&subcategory=jogger" className={styles.megaMenuLink}>Jogger</Link>
                  <Link href="/products?category=nam&subcategory=cargo" className={styles.megaMenuLink}>Cargo</Link>
                </div>
                <div className={styles.megaMenuCol}>
                  <Link href="/products?category=nam&subcategory=sneaker" className={styles.megaMenuLink}>Sneaker</Link>
                  <Link href="/products?category=nam&subcategory=giay" className={styles.megaMenuLink}>Giày</Link>
                  <Link href="/products?category=nam&subcategory=phu-kien" className={styles.megaMenuLink}>Phụ kiện</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ======================= */}
      {/* MOBILE DRAWER MENU      */}
      {/* ======================= */}
      
      {/* Overlay - Renders only when open */}
      {isMobileMenuOpen && (
        <div 
          className={styles.drawerOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className={`${styles.drawer} ${isMobileMenuOpen ? styles.drawerOpen : ''}`}>
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>NORA</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className={styles.iconBtn}
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Drawer Content */}
        <div className={styles.drawerContent}>
          <form onSubmit={handleSearchSubmit} className={styles.searchFormMobile} style={{ marginLeft: 0, marginRight: 0, marginTop: 8 }}>
            <input
              type="text"
              className={styles.searchInputMobile}
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className={styles.iconBtn} aria-label="Tìm kiếm">
              <Search size={20} strokeWidth={1.5} />
            </button>
          </form>

          <Link href="/products?sort=newest" className={styles.drawerItem}>
            Sản phẩm mới
          </Link>

          {/* Nữ Accordion */}
          <div>
            <button 
              onClick={() => toggleMobileCategory('nu')}
              className={styles.drawerAccordionBtn}
            >
              Nữ
              {expandedMobileCategory === 'nu' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            
            {/* RENDER CONDITIONALLY ONLY WHEN EXPANDED */}
            {expandedMobileCategory === 'nu' && (
              <div className={styles.drawerSubMenu}>
                <Link href="/products?category=nu&subcategory=ao" className={styles.drawerSubLink}>Áo</Link>
                <Link href="/products?category=nu&subcategory=quan" className={styles.drawerSubLink}>Quần</Link>
                <Link href="/products?category=nu&subcategory=dam-vay" className={styles.drawerSubLink}>Váy / Đầm</Link>
                <Link href="/products?category=nu&subcategory=jumpsuit" className={styles.drawerSubLink}>Jumpsuit</Link>
                <Link href="/products?category=nu&subcategory=do-the-thao" className={styles.drawerSubLink}>Đồ thể thao</Link>
                <Link href="/products?category=nu&subcategory=do-ngu" className={styles.drawerSubLink}>Đồ ngủ</Link>
                <Link href="/products?category=nu&subcategory=giay" className={styles.drawerSubLink}>Giày</Link>
                <Link href="/products?category=nu&subcategory=tui-xach" className={styles.drawerSubLink}>Túi xách</Link>
                <Link href="/products?category=nu&subcategory=phu-kien" className={styles.drawerSubLink}>Phụ kiện</Link>
              </div>
            )}
          </div>

          {/* Nam Accordion */}
          <div>
            <button 
              onClick={() => toggleMobileCategory('nam')}
              className={styles.drawerAccordionBtn}
            >
              Nam
              {expandedMobileCategory === 'nam' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            
            {/* RENDER CONDITIONALLY ONLY WHEN EXPANDED */}
            {expandedMobileCategory === 'nam' && (
              <div className={styles.drawerSubMenu}>
                <Link href="/products?category=nam&subcategory=t-shirt" className={styles.drawerSubLink}>T-shirt</Link>
                <Link href="/products?category=nam&subcategory=so-mi" className={styles.drawerSubLink}>Sơ mi</Link>
                <Link href="/products?category=nam&subcategory=polo" className={styles.drawerSubLink}>Polo</Link>
                <Link href="/products?category=nam&subcategory=ao-khoac" className={styles.drawerSubLink}>Áo khoác</Link>
                <Link href="/products?category=nam&subcategory=quan-jeans" className={styles.drawerSubLink}>Quần jeans</Link>
                <Link href="/products?category=nam&subcategory=quan-tay" className={styles.drawerSubLink}>Quần tây</Link>
                <Link href="/products?category=nam&subcategory=quan-short" className={styles.drawerSubLink}>Quần short</Link>
                <Link href="/products?category=nam&subcategory=jogger" className={styles.drawerSubLink}>Jogger</Link>
                <Link href="/products?category=nam&subcategory=cargo" className={styles.drawerSubLink}>Cargo</Link>
                <Link href="/products?category=nam&subcategory=sneaker" className={styles.drawerSubLink}>Sneaker</Link>
                <Link href="/products?category=nam&subcategory=giay" className={styles.drawerSubLink}>Giày</Link>
                <Link href="/products?category=nam&subcategory=phu-kien" className={styles.drawerSubLink}>Phụ kiện</Link>
              </div>
            )}
          </div>

          <Link href="/products?category=phu-kien" className={styles.drawerItem}>
            Phụ kiện
          </Link>
          
          <Link href="/products?badge=SALE" className={`${styles.drawerItem} ${styles.navItemSale}`}>
            Sale
          </Link>

          <div className={styles.divider} />
          
          <Link href={user?.role === 'ADMIN' ? '/admin' : '/account'} className={styles.drawerItem} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <User size={22} strokeWidth={1.5} />
            {user ? (user.role === 'ADMIN' ? 'Admin Dashboard' : 'Tài khoản của tôi') : 'Đăng nhập / Đăng ký'}
          </Link>
        </div>
      </div>
    </>
  );
}
