import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaSearch, FaUserTie, FaStar, FaMapMarkerAlt, 
  FaBriefcase, FaArrowRight, FaUsers, FaComments 
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [topUstalar, setTopUstalar] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ustalarRes, messagesRes] = await Promise.all([
        api.get('/search/ustalar?limit=6&isPremium=true'),
        api.get('/messages/unread-count')
      ]);

      setTopUstalar(ustalarRes.data.ustalar);
      setUnreadMessages(messagesRes.data.unreadCount);

      // Simple stats
      setStats({
        totalUstalar: ustalarRes.data.pagination.total,
        premiumUstalar: ustalarRes.data.ustalar.filter(u => u.isPremium).length,
        regionsCount: 13
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Dashboard yuklanmoqda..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Xush kelibsiz, {user?.name}! 👋
                </h1>
                <p className="text-gray-600">
                  {user?.role === 'usta' 
                    ? 'Premium bo\'ling va ko\'proq mijozlar toping'
                    : 'Kerakli ustani toping va sifatli xizmat oling'
                  }
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-4">
                <Link
                  to="/search"
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <FaSearch />
                  <span>Usta qidirish</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Jami ustalar</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats?.totalUstalar || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <FaUserTie className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Premium ustalar</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats?.premiumUstalar || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-full">
                <FaStar className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Viloyatlar</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats?.regionsCount || 13}
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <FaMapMarkerAlt className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {user?.role === 'usta' && !user?.isPremium && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Premium bo'ling!</h2>
                  <p className="text-white/90">
                    Premium ustalar 10x ko'proq mijoz topadi. Oylik to'lov atigi 60,000 so'm
                  </p>
                </div>
                <Link
                  to="/payment"
                  className="mt-4 md:mt-0 bg-white text-orange-600 px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center space-x-2"
                >
                  <FaStar />
                  <span>Premium bo'lish</span>
                  <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Top Ustalar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              ⭐ Premium ustalar
            </h2>
            <Link 
              to="/search" 
              className="text-purple-600 font-semibold hover:text-purple-700 flex items-center"
            >
              Barchasini ko'rish <FaArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topUstalar.map(usta => (
              <div key={usta._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
                <div className="relative">
                  <div className="h-2 bg-gradient-to-r from-purple-600 to-blue-500" />
                  {usta.isPremium && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <FaStar className="mr-1" /> PREMIUM
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{usta.name}</h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <FaBriefcase className="mr-2 text-purple-500" />
                        {usta.profession}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-yellow-500">
                        <FaStar className="mr-1" />
                        <span className="font-bold">{usta.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{usta.totalReviews} sharh</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    {usta.region}
                  </div>

                  {usta.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {usta.description}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <Link
                      to={`/messages?userId=${usta._id}`}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <FaComments />
                      <span>Bog'lanish</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {topUstalar.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <FaUserTie className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Hozircha premium ustalar mavjud emas</p>
            </div>
          )}
        </div>

        {/* Categories Quick Links */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Mashhur kasblar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Santexnik', 'Elektrik', 'Quruvchi', 'Dizayner',
              'Marketolog', 'Dasturchi', 'Tarjimon', 'O\'qituvchi'
            ].map(prof => (
              <Link
                key={prof}
                to={`/search?profession=${prof}`}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all text-center group"
              >
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-all">
                  <FaBriefcase className="text-purple-600" />
                </div>
                <p className="font-semibold text-gray-800">{prof}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;