import React from 'react';

export default function CategoryTabs({ categories, selectedCategoryId, onSelectCategory }) {
  return (
    <div className="sticky top-[57px] z-20 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EFE6D8] py-2.5 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar shadow-xs">
      <div className="max-w-5xl mx-auto flex items-center space-x-2 min-w-max">
        {/* All Items Tab */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            selectedCategoryId === null
              ? 'bg-[#2C1A14] text-[#E5C170] shadow-md border border-[#C8963E]/40'
              : 'bg-[#F5EFE6] text-[#5D4037] hover:bg-[#EFE6D8] border border-transparent'
          }`}
        >
          All Items
        </button>

        {/* Dynamic Database Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                isSelected
                  ? 'bg-[#2C1A14] text-[#E5C170] shadow-md border border-[#C8963E]/40'
                  : 'bg-[#F5EFE6] text-[#5D4037] hover:bg-[#EFE6D8] border border-transparent'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
