import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaSearch, FaMapMarkerAlt, FaBriefcase, FaStar,
  FaFilter, FaTimes, FaComments, FaPhone, FaCrown
} from 'react-icons/fa';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [ustalar, setUstalar] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    profession: searchParams.get('profession') || '',
    region: searchParams.get('region') || '',
    query: searchParams.get('query') || '',
    minRating: '',
    isPremium: false
  });

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1
  });

  const regions = [
    'Toshkent shahri', 'Toshkent viloyati', 'Samarqand', 
    'Buxoro', 'Navoiy', 'Xorazm', 'Qashqadaryo', 
    'Surxondaryo', 'Jizzax', 'Sirdaryo', 
    'Farg\'ona', 'Andijon', 'Namangan'
  ];

  useEffect(() => {
    fetchProfessions();
    fetchUstalar();
  }, [filters, pagination.page]);

  const fetchProfessions = async () => {
    try {
      const response = await api.get('/search/professions');
      setProfessions(response.data.professions);
    } catch (error) {
      console.error('Professions fetch error:', error);
    }
  };

  const fetchUstalar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.profession) params.append('profession', filters.profession);
      if (filters.region) params.append('region', filters.region);
      if (filters.query) params.append('query', filters.query);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.isPremium) params.append('isPremium', 'true');
      params.append('page', pagination.page);
      params.append('limit', '12');

      const response = await api.get(`/search/ustalar?${params.toString()}`);
      setUstalar(response.data.ustalar);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchUstalar();
  };

  const clearFilters = () => {
    setFilters({
      profession: '',
      region: '',
      query: '',
      minRating: '',
      isPremium: false
    });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Usta ismi yoki kasbni qidiring..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={filters.query}
                  onChange={(e) => setFilters({...filters, query: e.target.value})}
                />
              </div>
              
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <FaSearch />
                <span>Qidirish</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  showFilters 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaFilter />
                <span>Filter</span>
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kasb
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={filters.profession}
                      onChange={(e) => setFilters({...filters, profession: e.target.value})}
                    >
                      <option value="">Barcha kasblar</option>
                      {professions.map(prof => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Viloyat
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={filters.region}
                      onChange={(e) => setFilters({...filters, region: e.target.value})}
                    >
                      <option value="">Barcha viloyatlar</option>
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimal reyting
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={filters.minRating}
                      onChange={(e) => setFilters({...filters, minRating: e.target.value})}
                    >
                      <option value="">Barchasi</option>
                      <option value="4">4+ yulduz</option>
                      <option value="3">3+ yulduz</option>
                      <option value="2">2+ yulduz</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.isPremium}
                        onChange={(e) => setFilters({...filters, isPremium: e.target.checked})}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <FaCrown className="text-yellow-500 mr-1" />
                        Faqat premium
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-red-500 hover:text-red-700 font-medium flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Filterni tozalash
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner text="Ustalar qidirilmoqda..." />
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                <span className="font-bold text-purple-600">{pagination.total}</span> ta usta topildi
              </p>
            </div>

            {ustalar.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ustalar.map(usta => (
                  <div key={usta._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
                    {usta.isPremium && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-1 text-xs font-bold">
                        ⭐ PREMIUM USTA
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            {usta.name}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <FaBriefcase className="mr-2 text-purple-500" />
                            {usta.profession}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-yellow-500 mb-1">
                            <FaStar className="mr-1" />
                            <span className="font-bold text-lg">
                              {usta.rating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {usta.totalReviews || 0} ta sharh
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                        {usta.region}
                      </div>

                      {usta.experience > 0 && (
                        <p className="text-sm text-gray-600 mb-3">
                          Tajriba: <span className="font-semibold">{usta.experience} yil</span>
                        </p>
                      )}

                      {usta.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {usta.description}
                        </p>
                      )}

                      <Link
                        to={`/messages?userId=${usta._id}`}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                      >
                        <FaComments />
                        <span>Bog'lanish</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl">
                <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Ustalar topilmadi
                </h3>
                <p className="text-gray-500">
                  Qidiruv parametrlarini o'zgartirib ko'ring
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, page })}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      pagination.page === page
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-purple-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;