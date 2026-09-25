import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import {
  getCategories,
  getMenuItems,
  updateMenuItem,
  createMenuItem,
  deleteMenuItem,
  uploadMenuImage,
  createCategory,
  deleteCategory
} from '../../services/menuService';
import { useCafe } from '../../context/CafeContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Upload,
  Check,
  X,
  Image as ImageIcon,
  Loader2,
  FolderPlus,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function MenuManagement() {
  const { activeCafe } = useCafe();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatFilter, setSelectedCatFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Modals
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Category creation state in form
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
    display_order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, items] = await Promise.all([
        getCategories(activeCafe?.id),
        getMenuItems(true, activeCafe?.id)
      ]);

      // Deduplicate categories by clean name
      const uniqueCats = Array.from(
        new Map(
          (cats || [])
            .filter(c => c && c.name && c.name.trim())
            .map(c => [c.name.trim().toLowerCase(), c])
        ).values()
      );

      setCategories(uniqueCats);
      setMenuItems(items || []);

      if (uniqueCats.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: uniqueCats[0].id }));
      }
    } catch (err) {
      console.error('Error loading menu management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCafe?.id]);

  const handleToggleAvailability = async (item) => {
    try {
      const updated = await updateMenuItem(item.id, { is_available: !item.is_available });
      setMenuItems(prev => prev.map(i => (i.id === item.id ? { ...i, is_available: updated.is_available } : i)));
    } catch (err) {
      alert('Failed to update availability.');
    }
  };

  const handleQuickPriceChange = async (item, newPrice) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    try {
      const updated = await updateMenuItem(item.id, { price: Number(newPrice) });
      setMenuItems(prev => prev.map(i => (i.id === item.id ? { ...i, price: updated.price } : i)));
    } catch (err) {
      alert('Failed to update price.');
    }
  };

  const handleCreateQuickCategory = async (name) => {
    if (!name || !name.trim()) return;
    try {
      const created = await createCategory({
        name: name.trim(),
        cafe_id: activeCafe?.id || '00000000-0000-0000-0000-000000000001'
      });
      setCategories(prev => [...prev.filter(c => c.id !== created.id), created]);
      setSelectedCatFilter(created.id);
      setSuccessBanner(`Category "${created.name}" created and saved to database!`);
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (err) {
      alert('Failed to create category: ' + err.message);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (
      !window.confirm(
        `⚠️ Are you sure you want to delete category "${catName}"?\n\nThis will permanently delete this category and all its menu items from the database!`
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await deleteCategory(catId);
      setCategories(prev => prev.filter(c => String(c.id) !== String(catId)));
      setMenuItems(prev => prev.filter(i => String(i.category_id) !== String(catId)));
      if (selectedCatFilter === catId) {
        setSelectedCatFilter('ALL');
      }
      setSuccessBanner(`Category "${catName}" deleted from database.`);
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Failed to delete category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsCreatingCategory(false);
    setCustomCategoryName('');
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id,
      image_url: item.image_url || '',
      is_available: item.is_available,
      display_order: item.display_order || 0
    });
    setImagePreview(item.image_url || '');
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddModal = () => {
    setIsAddingNew(true);
    const needNewCat = categories.length === 0;
    setIsCreatingCategory(needNewCat);
    setCustomCategoryName('');
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: needNewCat ? 'NEW' : (categories[0]?.id || ''),
      image_url: '',
      is_available: true,
      display_order: menuItems.length + 1
    });
    setImagePreview('');
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Reset text URL to avoid collision
      setFormData(prev => ({ ...prev, image_url: '' }));
    }
  };

  // Remove / Delete image from this item
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImageUrl = formData.image_url.trim();

      // If a file was selected, compress and convert to lightweight data URL for DB
      if (imageFile) {
        finalImageUrl = await uploadMenuImage(imageFile);
      }

      let assignedCategoryId = formData.category_id;

      // Handle dynamic category creation
      if (categories.length === 0 || isCreatingCategory || formData.category_id === 'NEW') {
        const catName = customCategoryName.trim();
        if (!catName) {
          alert('Please enter a category name.');
          setSaving(false);
          return;
        }

        const existingCat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (existingCat) {
          assignedCategoryId = existingCat.id;
        } else {
          const newCat = await createCategory({
            name: catName,
            cafe_id: activeCafe?.id || '00000000-0000-0000-0000-000000000001'
          });
          assignedCategoryId = newCat.id;
        }
      }

      const payload = {
        ...formData,
        category_id: assignedCategoryId,
        price: Number(formData.price) || 0,
        image_url: finalImageUrl,
        cafe_id: activeCafe?.id || '00000000-0000-0000-0000-000000000001'
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
        setSuccessBanner(`Item "${payload.name}" updated successfully in database!`);
      } else {
        await createMenuItem(payload);
        setSuccessBanner(`New item "${payload.name}" saved successfully to database!`);
      }

      await loadData();
      setEditingItem(null);
      setIsAddingNew(false);
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (err) {
      console.error('Failed to save menu item:', err);
      alert(err.message || 'Failed to save menu item to database.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the database?`)) return;
    try {
      await deleteMenuItem(id);
      setMenuItems(prev => prev.filter(i => i.id !== id));
      setSuccessBanner(`"${name}" deleted from database.`);
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (err) {
      alert('Failed to delete menu item.');
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCat = selectedCatFilter === 'ALL' || item.category_id === selectedCatFilter;
      const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [menuItems, selectedCatFilter, searchTerm]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF6F0] text-[#2C1A14]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
        {/* Header */}
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 border-b border-[#EFE6D8] sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-widest font-mono">
              DATABASE SOURCE OF TRUTH (SUPABASE POSTGRES)
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C1A14]">
              Menu & Price Management
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={openAddModal}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723] font-bold text-xs flex items-center space-x-2 shadow-md transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW MENU ITEM</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 sm:p-2.5 rounded-xl bg-[#FAF6F0] text-[#2C1A14] hover:bg-[#EFE6D8] border border-[#EFE6D8] shadow-xs"
              title="Refresh from Database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Success Banner */}
        {successBanner && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 font-bold flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successBanner}</span>
            </div>
            <button onClick={() => setSuccessBanner('')} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters & Search */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 bg-[#FDFBF7] border-b border-[#EFE6D8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Category Pills (with shrink-0 to prevent squishing) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 no-scrollbar flex-1 flex-nowrap">
            <button
              onClick={() => setSelectedCatFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedCatFilter === 'ALL'
                  ? 'bg-[#2C1A14] text-[#E5C170] shadow-xs'
                  : 'bg-white text-[#6D4C41] border border-[#EFE6D8] hover:bg-[#FAF6F0]'
              }`}
            >
              All Categories ({menuItems.length})
            </button>

            {categories.map((c) => (
              <div
                key={c.id}
                className={`inline-flex items-center rounded-full text-xs font-bold transition-all whitespace-nowrap overflow-hidden border shadow-xs shrink-0 ${
                  selectedCatFilter === c.id
                    ? 'bg-[#2C1A14] text-[#E5C170] border-[#2C1A14]'
                    : 'bg-white text-[#6D4C41] border-[#EFE6D8] hover:bg-[#FAF6F0]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCatFilter(c.id)}
                  className="px-3.5 py-1.5 transition-opacity"
                >
                  {c.name}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(c.id, c.name);
                  }}
                  title={`Delete category "${c.name}"`}
                  className={`pr-2.5 pl-1 py-1.5 transition-colors hover:text-rose-500 cursor-pointer ${
                    selectedCatFilter === c.id ? 'text-[#E5C170]/60' : 'text-stone-400'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const name = prompt('Enter new category name (e.g. Hot Coffee, Cold Beverages, Pizza, Desserts):');
                if (name && name.trim()) {
                  handleCreateQuickCategory(name.trim());
                }
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 bg-[#F5EFE6] text-[#C8963E] border border-dashed border-[#C8963E]/60 hover:bg-[#C8963E] hover:text-white flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Category</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-xs px-3.5 py-2 pl-9 rounded-xl border border-[#EFE6D8] focus:outline-none focus:ring-1 focus:ring-[#C8963E]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Menu Items Table Grid */}
        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="py-20 text-center">
              <LoadingSpinner message="Syncing Menu Items from Database..." />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#EFE6D8] p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#F5EFE6] border border-[#EFE6D8] flex items-center justify-center mx-auto mb-4 text-[#C8963E]">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2C1A14]">
                {searchTerm ? 'No matching products found' : 'Your Menu is Empty'}
              </h3>
              <p className="text-xs text-[#6D4C41] mt-1.5 max-w-md mx-auto">
                {searchTerm
                  ? `No menu item matches "${searchTerm}". Try searching for another product.`
                  : 'Click "+ ADD NEW MENU ITEM" below to create your item with photo and price!'}
              </p>
              {!searchTerm && (
                <button
                  onClick={openAddModal}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#2C1A14] text-[#E5C170] text-xs font-bold hover:bg-[#3E2723] transition-colors inline-flex items-center space-x-2 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD FIRST MENU ITEM</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#EFE6D8] shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#FAF6F0] border-b border-[#EFE6D8] text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">
                    <th className="p-4 pl-6">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price (₹)</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE6D8] text-xs">
                  {filteredItems.map((item) => {
                    const catObj = categories.find(c => c.id === item.category_id);
                    return (
                      <tr key={item.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                        {/* Image & Name */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F5EFE6] shrink-0 border border-[#EFE6D8] flex items-center justify-center">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-stone-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#2C1A14] text-sm">{item.name}</h4>
                              <p className="text-[11px] text-[#6D4C41]/80 max-w-xs truncate">
                                {item.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4 font-semibold text-[#6D4C41]">
                          <span className="bg-[#F5EFE6] px-2.5 py-1 rounded-lg border border-[#EFE6D8]">
                            {catObj?.name || 'Unassigned'}
                          </span>
                        </td>

                        {/* Quick Price Editor */}
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <span className="font-serif font-bold text-sm text-[#2C1A14]">₹</span>
                            <input
                              type="number"
                              defaultValue={item.price}
                              onBlur={(e) => handleQuickPriceChange(item, e.target.value)}
                              className="w-20 font-serif font-bold text-sm bg-white px-2 py-1 rounded-lg border border-[#EFE6D8] focus:border-[#C8963E] focus:outline-none"
                            />
                          </div>
                        </td>

                        {/* Availability Toggle */}
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full font-extrabold text-[11px] transition-all ${
                              item.is_available
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300'
                            }`}
                          >
                            {item.is_available ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-700" />
                                <span>AVAILABLE (ON)</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-rose-700" />
                                <span>UNAVAILABLE (OFF)</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 pr-6 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-xl bg-[#F5EFE6] text-[#2C1A14] hover:bg-[#C8963E] hover:text-white transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* ADD / EDIT MODAL                                          */}
        {/* ========================================================= */}
        {(editingItem || isAddingNew) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-lg bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl border border-[#EFE6D8]">
              <div className="p-4 bg-[#2C1A14] text-white flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-[#E5C170]">
                  {editingItem ? `Edit: ${editingItem.name}` : 'Add New Menu Item'}
                </h3>
                <button
                  onClick={() => { setEditingItem(null); setIsAddingNew(false); }}
                  className="p-1 rounded-full text-stone-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Item Name */}
                <div>
                  <label className="block text-xs font-bold text-[#6D4C41] mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cappuccino, Brownie, Club Sandwich"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6D8] focus:outline-none focus:ring-1 focus:ring-[#C8963E]"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#6D4C41]">Category *</label>
                      {categories.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !isCreatingCategory;
                            setIsCreatingCategory(nextState);
                            if (nextState) {
                              setFormData(prev => ({ ...prev, category_id: 'NEW' }));
                            } else {
                              setFormData(prev => ({ ...prev, category_id: categories[0]?.id || '' }));
                            }
                          }}
                          className="text-[10px] font-bold text-[#C8963E] hover:underline"
                        >
                          {isCreatingCategory ? 'Select Existing' : '+ New Category'}
                        </button>
                      )}
                    </div>

                    {categories.length === 0 || isCreatingCategory || formData.category_id === 'NEW' ? (
                      <input
                        type="text"
                        required
                        placeholder="Enter category (e.g. Hot Coffee)"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-[#C8963E] focus:outline-none focus:ring-1 focus:ring-[#C8963E]"
                      />
                    ) : (
                      <select
                        value={formData.category_id}
                        onChange={(e) => {
                          if (e.target.value === 'NEW') {
                            setIsCreatingCategory(true);
                            setFormData({ ...formData, category_id: 'NEW' });
                          } else {
                            setFormData({ ...formData, category_id: e.target.value });
                          }
                        }}
                        className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6D8] focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        <option value="NEW">+ Create New Category...</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6D4C41] mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="e.g. 150"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6D8] focus:outline-none focus:ring-1 focus:ring-[#C8963E]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-[#6D4C41] mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Rich freshly brewed South Indian specialty roast"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white text-xs px-3.5 py-2 rounded-xl border border-[#EFE6D8] focus:outline-none"
                  />
                </div>

                {/* Product Image Section (Upload, Paste URL, Live Preview, and Remove Image) */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#EFE6D8] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#6D4C41]">Product Image</label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Image</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Live Preview Box */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#FAF6F0] border-2 border-dashed border-[#EFE6D8] shrink-0 flex items-center justify-center relative group">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => {
                              setImagePreview('');
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Click to remove image"
                          >
                            <Trash2 className="w-5 h-5 text-rose-400" />
                            <span className="text-[9px] font-bold mt-1">Delete</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-1">
                          <ImageIcon className="w-6 h-6 text-stone-400 mx-auto" />
                          <span className="text-[9px] text-stone-400 block mt-0.5">No image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      {/* Upload from file */}
                      <div>
                        <span className="text-[10px] text-stone-500 font-bold block mb-1">
                          1. Upload from Device:
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="text-xs text-[#6D4C41] file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#2C1A14] file:text-[#E5C170] file:font-bold file:text-xs hover:file:bg-[#3E2723] cursor-pointer"
                        />
                      </div>

                      {/* Or paste URL */}
                      <div>
                        <span className="text-[10px] text-stone-500 font-bold block mb-1">
                          2. Or Paste Image URL:
                        </span>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={formData.image_url}
                          onChange={(e) => {
                            const url = e.target.value;
                            setFormData({ ...formData, image_url: url });
                            setImagePreview(url);
                            setImageFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="w-full bg-[#FAF6F0] text-[11px] px-3 py-1.5 rounded-xl border border-[#EFE6D8] focus:outline-none focus:ring-1 focus:ring-[#C8963E]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-[#6D4C41]">Availability Status</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                    className={`px-4 py-1.5 rounded-full font-bold text-xs transition-colors ${
                      formData.is_available ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
                    }`}
                  >
                    {formData.is_available ? 'Available (ON)' : 'Unavailable (OFF)'}
                  </button>
                </div>

                <div className="pt-3 border-t border-[#EFE6D8]">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-xl bg-[#2C1A14] text-[#E5C170] font-bold text-sm shadow-md hover:bg-[#3E2723] transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{saving ? 'Saving to Database...' : 'SAVE MENU ITEM'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
