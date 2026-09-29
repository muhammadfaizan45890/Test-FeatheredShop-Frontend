// src/pages/Courses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData } from '@/context/userContext';
import {
  Search, X, Grid3x3, List, Star, Clock,
  ChevronDown, Users, GraduationCap, Heart,
  SlidersHorizontal, ArrowUpDown, User
} from 'lucide-react';

// --------------------------- Mock API (replace with real) ---------------------------
const fetchCourses = async ({ page = 1, limit = 8, filters = {}, sort = '' }) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const allCourses = [
    { id: 1, title: 'React 18 Masterclass', instructor: 'Sarah Johnson', category: 'Development', level: 'Intermediate', rating: 4.8, students: 3420, duration: '8 hours', image: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=240&fit=crop', price: 49.99, oldPrice: 99.99, isHot: true, createdDate: '2024-01-15' },
    { id: 2, title: 'Tailwind CSS Advanced', instructor: 'Michael Chen', category: 'CSS', level: 'Intermediate', rating: 4.9, students: 2850, duration: '5 hours', image: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&h=240&fit=crop', price: 39.99, oldPrice: 79.99, isHot: false, createdDate: '2024-02-10' },
    { id: 3, title: 'Node.js Microservices', instructor: 'David Kim', category: 'Backend', level: 'Advanced', rating: 4.7, students: 1890, duration: '12 hours', image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=240&fit=crop', price: 59.99, oldPrice: 119.99, isHot: true, createdDate: '2023-12-05' },
    { id: 4, title: 'UI/UX Design Fundamentals', instructor: 'Emily Rodriguez', category: 'Design', level: 'Beginner', rating: 4.6, students: 4200, duration: '6 hours', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=240&fit=crop', price: 44.99, oldPrice: 89.99, isHot: false, createdDate: '2024-01-20' },
    { id: 5, title: 'Python for Data Science', instructor: 'Alex Morgan', category: 'Data Science', level: 'Beginner', rating: 4.9, students: 5600, duration: '10 hours', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=240&fit=crop', price: 69.99, oldPrice: 149.99, isHot: true, createdDate: '2024-03-01' },
    { id: 6, title: 'Full Stack Web Development', instructor: 'Jessica Lee', category: 'Development', level: 'Advanced', rating: 4.8, students: 3800, duration: '24 hours', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=240&fit=crop', price: 89.99, oldPrice: 199.99, isHot: false, createdDate: '2023-11-10' },
    { id: 7, title: 'GraphQL with Apollo', instructor: 'Ryan Clark', category: 'Development', level: 'Intermediate', rating: 4.5, students: 1250, duration: '7 hours', image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=240&fit=crop', price: 54.99, oldPrice: 109.99, isHot: false, createdDate: '2024-02-18' },
    { id: 8, title: 'Machine Learning A-Z', instructor: 'Andrew Ng', category: 'Data Science', level: 'Advanced', rating: 4.9, students: 8900, duration: '40 hours', image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=240&fit=crop', price: 99.99, oldPrice: 199.99, isHot: true, createdDate: '2024-01-05' },
    { id: 9, title: 'Angular Complete Guide', instructor: 'Maximilian Schwarz', category: 'Development', level: 'Beginner', rating: 4.7, students: 3100, duration: '28 hours', image: 'https://images.unsplash.com/photo-1581276875532-60d8d6f5a15b?w=400&h=240&fit=crop', price: 49.99, oldPrice: 94.99, isHot: false, createdDate: '2024-02-25' },
    { id: 10, title: 'Cloud Computing with AWS', instructor: 'Stephane Maarek', category: 'Cloud', level: 'Intermediate', rating: 4.8, students: 4700, duration: '16 hours', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=240&fit=crop', price: 79.99, oldPrice: 159.99, isHot: true, createdDate: '2023-12-20' },
  ];

  let results = [...allCourses];
  if (filters.category && filters.category !== 'all') results = results.filter(c => c.category === filters.category);
  if (filters.level && filters.level !== 'all') results = results.filter(c => c.level === filters.level);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(c => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q));
  }
  if (filters.priceRange) results = results.filter(c => c.price <= filters.priceRange[1]);
  if (filters.minRating) results = results.filter(c => c.rating >= filters.minRating);
  if (filters.duration) {
    results = results.filter(c => {
      const hours = parseInt(c.duration);
      if (filters.duration === '0-4') return hours <= 4;
      if (filters.duration === '4-8') return hours > 4 && hours <= 8;
      if (filters.duration === '8-16') return hours > 8 && hours <= 16;
      if (filters.duration === '16+') return hours > 16;
      return true;
    });
  }

  switch (sort) {
    case 'popular': results.sort((a, b) => b.students - a.students); break;
    case 'newest': results.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)); break;
    case 'price_asc': results.sort((a, b) => a.price - b.price); break;
    case 'price_desc': results.sort((a, b) => b.price - a.price); break;
    case 'rating': results.sort((a, b) => b.rating - a.rating); break;
    default: break;
  }

  const start = (page - 1) * limit;
  return { courses: results.slice(start, start + limit), total: results.length, hasMore: start + limit < results.length };
};

// --------------------------- Helper Components ---------------------------
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${
          i < fullStars 
            ? 'fill-amber-400 text-amber-400' 
            : i === fullStars && hasHalf 
              ? 'fill-amber-400/50 text-amber-400' 
              : 'text-gray-300 dark:text-gray-600'
        }`} />
      ))}
    </div>
  );
};

const SkeletonCard = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse bg-white dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48 h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            <div className="flex gap-2"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div></div>
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden animate-pulse bg-white dark:bg-gray-900">
      <div className="h-48 bg-gray-200 dark:bg-gray-800"></div>
      <div className="p-4 space-y-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
        <div className="flex justify-between"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></div>
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="flex justify-between"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div><div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></div>
      </div>
    </div>
  );
};

// --------------------------- Main Component ---------------------------
const Courses = () => {
  const navigate = useNavigate();
  const { user } = getData();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('courseWishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [minRating, setMinRating] = useState(0);
  const [durationFilter, setDurationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [categories, setCategories] = useState(['all']);

  const fetchData = useCallback(async (reset = true) => {
    setLoading(true);
    const filters = {
      search: searchQuery,
      category: selectedCategory,
      level: selectedLevel,
      priceRange,
      minRating: minRating === 0 ? null : minRating,
      duration: durationFilter !== 'all' ? durationFilter : null,
    };
    const result = await fetchCourses({ page: reset ? 1 : page, limit: 8, filters, sort: sortBy });
    if (reset) { setCourses(result.courses); setPage(1); } 
    else { setCourses(prev => [...prev, ...result.courses]); }
    setFilteredCount(result.total);
    setHasMore(result.hasMore);
    setLoading(false);
  }, [searchQuery, selectedCategory, selectedLevel, priceRange, minRating, durationFilter, sortBy, page]);

  useEffect(() => { if (courses.length) setCategories(['all', ...new Set(courses.map(c => c.category))]); }, [courses]);
  useEffect(() => { fetchData(true); }, [fetchData]);

  const loadMore = () => { if (!loading && hasMore) { setPage(prev => prev + 1); fetchData(false); } };
  const handleEnroll = (courseId, e) => { e.stopPropagation(); if (!user) navigate('/login', { state: { from: '/courses' } }); else console.log('Enroll', courseId); };
  const toggleWishlist = (courseId, e) => { e.stopPropagation(); const newWishlist = wishlist.includes(courseId) ? wishlist.filter(id => id !== courseId) : [...wishlist, courseId]; setWishlist(newWishlist); localStorage.setItem('courseWishlist', JSON.stringify(newWishlist)); };
  const clearFilters = () => { setSearchQuery(''); setSelectedCategory('all'); setSelectedLevel('all'); setPriceRange([0, 200]); setMinRating(0); setDurationFilter('all'); setSortBy('popular'); };
  
  const renderStarsInput = () => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} onClick={() => setMinRating(star)} className={`focus:outline-none ${minRating >= star ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>
          <Star className="h-5 w-5 fill-current" />
        </button>
      ))}
      {minRating > 0 && <button onClick={() => setMinRating(0)} className="text-xs text-gray-500 dark:text-gray-400 ml-2">Clear</button>}
    </div>
  );

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-200">
          <GraduationCap className="h-4 w-4" /> Category
        </h4>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat} className="flex items-center gap-2 capitalize text-gray-700 dark:text-gray-300">
              <input type="radio" name="category" value={cat} checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} className="text-emerald-500" />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-200">Level</h4>
        <div className="space-y-2">
          {['all','Beginner','Intermediate','Advanced'].map(level => (
            <label key={level} className="flex items-center gap-2 capitalize text-gray-700 dark:text-gray-300">
              <input type="radio" name="level" value={level} checked={selectedLevel === level} onChange={() => setSelectedLevel(level)} className="text-emerald-500" />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-200">Price (up to ${priceRange[1]})</h4>
        <input type="range" min="0" max="200" step="10" value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])} className="w-full accent-emerald-500" />
      </div>
      <div>
        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-200">Rating</h4>
        {renderStarsInput()}
      </div>
      <div>
        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-200">Duration</h4>
        <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200">
          <option value="all">All</option>
          <option value="0-4">0-4 hours</option>
          <option value="4-8">4-8 hours</option>
          <option value="8-16">8-16 hours</option>
          <option value="16+">16+ hours</option>
        </select>
      </div>
    </div>
  );

  const GridCard = ({ course }) => {
    const isWishlisted = wishlist.includes(course.id);
    return (
      <div className="group border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative bg-white dark:bg-gray-900">
        <button onClick={(e) => toggleWishlist(course.id, e)} className="absolute top-3 right-3 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 backdrop-blur-sm hover:scale-110">
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
        </button>
        <div className="relative h-48 overflow-hidden">
          <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          {course.isHot && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">🔥 Hot</span>}
          <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">{course.level}</span>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-gray-900 dark:text-white">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
            <User className="h-4 w-4" /><span>{course.instructor}</span>
          </p>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1"><StarRating rating={course.rating} /><span className="text-xs text-gray-500 dark:text-gray-400">{course.rating}</span></div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs"><Users className="h-3.5 w-3.5" />{course.students.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2"><Clock className="h-3.5 w-3.5" />{course.duration}</div>
          <div className="flex justify-between items-center mt-3">
            <div><span className="text-xl font-bold text-gray-900 dark:text-white">${course.price}</span><span className="text-xs line-through ml-2 text-gray-400 dark:text-gray-500">${course.oldPrice}</span></div>
            <button onClick={(e) => handleEnroll(course.id, e)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm">Enroll</button>
          </div>
        </div>
      </div>
    );
  };

  const ListCard = ({ course }) => {
    const isWishlisted = wishlist.includes(course.id);
    return (
      <div className="group border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition cursor-pointer relative bg-white dark:bg-gray-900 p-4">
        <button onClick={(e) => toggleWishlist(course.id, e)} className="absolute top-3 right-3 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5">
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
        </button>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{course.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" /><span>{course.instructor}</span>
                <span className="border border-gray-300 dark:border-gray-700 px-2 py-0.5 rounded text-xs">{course.level}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <StarRating rating={course.rating} /><span>{course.rating}</span>
                <Users className="h-3.5 w-3.5" />{course.students.toLocaleString()}
                <Clock className="h-3.5 w-3.5" />{course.duration}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right"><div className="text-xl font-bold text-gray-900 dark:text-white">${course.price}</div><div className="text-xs line-through text-gray-400 dark:text-gray-500">${course.oldPrice}</div></div>
              <button onClick={(e) => handleEnroll(course.id, e)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm">Enroll</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/30">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-800 dark:to-emerald-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">Expand Your Knowledge</h1>
          <p className="text-emerald-100 dark:text-emerald-200 max-w-2xl mx-auto mb-8">Discover thousands of courses taught by experts. Learn at your own pace.</p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg border-0 shadow-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top bar: categories + sort + view */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm pr-8 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
              <button onClick={() => setIsFilterOpen(true)} className="lg:hidden bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-gray-700 dark:text-gray-300">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterContent />
            <button onClick={clearFilters} className="mt-6 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
              Clear all filters
            </button>
          </aside>

          {/* Mobile filter drawer */}
          {isFilterOpen && (
            <>
              <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsFilterOpen(false)}></div>
              <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 p-5 overflow-y-auto border-l border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterContent />
                <button onClick={clearFilters} className="mt-6 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  Clear all
                </button>
              </div>
            </>
          )}

          {/* Main content */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{filteredCount} courses found</span>
              {(selectedCategory !== 'all' || selectedLevel !== 'all' || searchQuery || priceRange[1] < 200 || minRating > 0 || durationFilter !== 'all') && (
                <button onClick={clearFilters} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {loading && courses.length === 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} viewMode={viewMode} />)}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-300">No courses found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
                <button onClick={clearFilters} className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Clear filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => <div key={course.id} onClick={() => navigate(`/course/${course.id}`)}><GridCard course={course} /></div>)}
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map(course => <div key={course.id} onClick={() => navigate(`/course/${course.id}`)}><ListCard course={course} /></div>)}
              </div>
            )}

            {hasMore && (
              <div className="text-center mt-12">
                <button onClick={loadMore} disabled={loading} className="px-8 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition">
                  {loading ? 'Loading...' : 'Load More'} <ChevronDown className="inline ml-2 h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;