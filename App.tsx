
import React, { useState, useEffect } from 'react';
import { Category, ClothingItem, TabType } from './types';
import Navbar from './components/Navbar';
import { getFashionAdvice, StylingPrefs } from './services/geminiService';

const CATEGORIES = Object.values(Category);

const STYLES = ['Casual', 'Elegant', 'Streetwear', 'Vintage', 'Minimalist', 'Sporty'];
const LOCATIONS = ['Văn phòng', 'Tiệc tối', 'Dạo phố', 'Bãi biển', 'Quán Cafe', 'Sân bay'];
const WEATHERS = ['Nắng ráo', 'Trời mưa', 'Se lạnh', 'Nắng nóng', 'Có tuyết'];
const SEASONS = ['Mùa Xuân', 'Mùa Hạ', 'Mùa Thu', 'Mùa Đông'];
const TONES = ['Pastel', 'Trung tính', 'Rực rỡ', 'Monochrome', 'Earth Tone'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('stylist'); // Default to stylist for easier testing of new features
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  // Styling Prefs State
  const [prefs, setPrefs] = useState<StylingPrefs>({
    occasion: '',
    style: STYLES[0],
    location: LOCATIONS[0],
    weather: WEATHERS[0],
    season: SEASONS[0],
    colorTone: TONES[0]
  });

  useEffect(() => {
    const savedItems = localStorage.getItem('smart_closet_items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      const mockItems: ClothingItem[] = [
        { id: '1', name: 'Áo sơ mi trắng', category: Category.TOPS, color: 'Trắng', imageUrl: 'https://picsum.photos/seed/shirt/400/600', tags: ['formal'], createdAt: Date.now() },
        { id: '2', name: 'Quần Khaki', category: Category.BOTTOMS, color: 'Beige', imageUrl: 'https://picsum.photos/seed/khaki/400/600', tags: ['casual'], createdAt: Date.now() },
        { id: '3', name: 'Áo khoác Blazer', category: Category.OUTERWEAR, color: 'Xanh Navy', imageUrl: 'https://picsum.photos/seed/blazer/400/600', tags: ['office'], createdAt: Date.now() },
        { id: '4', name: 'Giày Tây nâu', category: Category.SHOES, color: 'Nâu', imageUrl: 'https://picsum.photos/seed/oxford/400/600', tags: ['formal'], createdAt: Date.now() },
        { id: '5', name: 'Áo thun đen', category: Category.TOPS, color: 'Đen', imageUrl: 'https://picsum.photos/seed/tblack/400/600', tags: ['casual'], createdAt: Date.now() },
      ];
      setItems(mockItems);
      localStorage.setItem('smart_closet_items', JSON.stringify(mockItems));
    }
  }, []);

  const saveToStorage = (newItems: ClothingItem[]) => {
    setItems(newItems);
    localStorage.setItem('smart_closet_items', JSON.stringify(newItems));
  };

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: ClothingItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      category: formData.get('category') as Category,
      color: formData.get('color') as string,
      imageUrl: `https://picsum.photos/seed/${Math.random()}/400/600`,
      tags: [],
      createdAt: Date.now(),
    };
    saveToStorage([newItem, ...items]);
    setActiveTab('closet');
  };

  const generateOutfits = async () => {
    setLoading(true);
    try {
      const result = await getFashionAdvice(items, prefs);
      setAiSuggestions(result.outfits || []);
    } catch (error) {
      alert("Lỗi khi gọi AI. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const OptionGroup = ({ label, options, field }: { label: string, options: string[], field: keyof StylingPrefs }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => setPrefs(prev => ({ ...prev, [field]: opt }))}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              prefs[field] === opt 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 bg-slate-50 relative overflow-x-hidden">
      <header className="px-6 py-8 bg-white border-b border-slate-50">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">SmartCloset</h1>
        <p className="text-slate-500 text-sm mt-1">Trợ lý thời trang cá nhân của bạn</p>
      </header>

      <main className="px-4 mt-4">
        {activeTab === 'closet' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => setActiveCategory('All')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === 'All' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Tất cả
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/80 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h3>
                    <p className="text-slate-400 text-xs mt-1 capitalize">{item.color}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stylist' && (
          <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sự kiện / Dịp</label>
                <input
                  type="text"
                  placeholder="VD: Hẹn hò cuối tuần, Phỏng vấn..."
                  value={prefs.occasion}
                  onChange={(e) => setPrefs(prev => ({...prev, occasion: e.target.value}))}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                />
              </div>

              <OptionGroup label="Phong cách" options={STYLES} field="style" />
              <OptionGroup label="Địa điểm" options={LOCATIONS} field="location" />
              <OptionGroup label="Thời tiết" options={WEATHERS} field="weather" />
              <OptionGroup label="Mùa" options={SEASONS} field="season" />
              <OptionGroup label="Tông màu" options={TONES} field="colorTone" />

              <button
                onClick={generateOutfits}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:bg-slate-300 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Stylist AI đang làm việc...
                  </>
                ) : 'Tạo 3 bộ đồ phong cách'}
              </button>
            </div>

            <div className="space-y-6">
              {aiSuggestions.map((outfit, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 animate-in slide-in-from-right-4 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">{outfit.title}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phối cùng</h4>
                    <div className="flex flex-wrap gap-2">
                      {outfit.itemsUsed.map((itemName: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 rounded-lg text-xs font-semibold text-indigo-700 border border-indigo-100">
                          {itemName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-indigo-500">
                    <p className="text-slate-600 text-sm leading-relaxed italic">
                      <span className="font-bold text-indigo-600 not-italic uppercase text-[10px] block mb-1">Lời khuyên chuyên gia</span>
                      "{outfit.stylingTip}"
                    </p>
                  </div>
                </div>
              ))}
              
              {!loading && aiSuggestions.length === 0 && (
                <div className="text-center py-12 px-6 opacity-60">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-600 font-semibold mb-1">Bắt đầu nâng tầm phong cách</h3>
                  <p className="text-slate-400 text-xs">Hãy chọn sở thích ở trên để AI tạo ra các bản phối hoàn hảo cho bạn.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-serif text-slate-900 mb-6">Thêm món đồ mới</h2>
            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tên món đồ</label>
                <input required name="name" type="text" placeholder="VD: Áo Blazer đen" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Danh mục</label>
                <select name="category" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none">
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Màu sắc chính</label>
                <input name="color" type="text" placeholder="VD: Đen, Trắng, Navy..." className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  Thêm vào tủ đồ
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Quản lý dữ liệu</h2>
              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <span className="text-slate-600 text-sm">Món đồ đã lưu</span>
                <span className="font-bold text-indigo-600">{items.length}</span>
              </div>
              <button 
                onClick={() => { if(confirm('Bạn có chắc chắn muốn xóa toàn bộ tủ đồ?')) saveToStorage([]); }} 
                className="w-full mt-6 py-3 rounded-xl border border-red-100 text-red-500 text-sm font-semibold hover:bg-red-50 transition-all"
              >
                Xóa tất cả dữ liệu
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Thông tin ứng dụng</h2>
              <p className="text-slate-500 text-xs leading-relaxed">
                SmartCloset AI là người bạn đồng hành thời trang giúp bạn tối ưu hóa tủ đồ của mình thông qua trí tuệ nhân tạo. Ứng dụng phân tích các món đồ bạn sở hữu để đưa ra những gợi ý phối đồ thông minh nhất cho mọi dịp.
              </p>
            </div>
          </div>
        )}
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
