import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  FaUsers, FaUserTie, FaUser, FaCrown, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaClock, FaSearch,
  FaSignOutAlt, FaChartBar, FaMapMarkerAlt, FaPhone,
  FaBan, FaTrash, FaEye, FaStar
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=100')
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Admin data fetch error:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (userId) => {
    try {
      await api.put(`/admin/payment/approve/${userId}`);
      toast.success('To\'lov tasdiqlandi');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik');
    }
  };

  const rejectPayment = async (userId) => {
    const note = prompt('Rad etish sababi:');
    if (!note) return;
    
    try {
      await api.put(`/admin/payment/reject/${userId}`, { note });
      toast.success('To\'lov rad etildi');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik');
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await api.put(`/admin/user/toggle-status/${userId}`);
      toast.success('Foydalanuvchi statusi o\'zgartirildi');
      fetchAdminData();
    } catch (error) {
      toast.error('Status o\'zgartirishda xatolik');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Haqiqatan ham o\'chirmoqchimisiz?')) return;
    
    try {
      await api.delete(`/admin/user/${userId}`);
      toast.success('Foydalanuvchi o\'chirildi');
      fetchAdminData();
    } catch (error) {
      toast.error('O\'chirishda xatolik');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchQuery || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery) ||
      u.profession?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <LoadingSpinner text="Admin panel yuklanmoqda..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-gray-400 text-sm">UstaTop boshqaruv paneli</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all flex items-center space-x-2"
            >
              <FaSignOutAlt />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Jami</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats?.stats?.totalUsers || 0}
                </p>
              </div>
              <FaUsers className="text-3xl text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ustalar</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.stats?.ustalar || 0}
                </p>
              </div>
              <FaUserTie className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Premium</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.stats?.activePremiumUsers || 0}
                </p>
              </div>
              <FaCrown className="text-3xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Kutilayotgan to'lovlar</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.stats?.pendingPayments || 0}
                </p>
              </div>
              <FaClock className="text-3xl text-orange-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'overview', label: 'Umumiy', icon: FaChartBar },
                { id: 'users', label: 'Foydalanuvchilar', icon: FaUsers },
                { id: 'payments', label: 'To\'lovlar', icon: FaMoneyBillWave }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 font-semibold text-sm flex items-center justify-center space-x-2 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Viloyatlar bo'yicha */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">Viloyatlar kesimida</h3>
                    <div className="space-y-2">
                      {stats?.regionStats?.map(region => (
                        <div key={region._id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                          <span className="text-gray-700">{region._id}</span>
                          <span className="font-bold text-purple-600">{region.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kasblar bo'yicha */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">Kasblar kesimida</h3>
                    <div className="space-y-2">
                      {stats?.professionStats?.map(prof => (
                        <div key={prof._id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                          <span className="text-gray-700">{prof._id}</span>
                          <span className="font-bold text-blue-600">{prof.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Oxirgi foydalanuvchilar */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">Oxirgi ro'yxatdan o'tganlar</h3>
                  <div className="space-y-2">
                    {stats?.recentUsers?.slice(0, 5).map(user => (
                      <div key={user._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.phone}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'usta' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ism, telefon yoki kasb bo'yicha qidirish..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">Barcha rollar</option>
                    <option value="usta">Ustalar</option>
                    <option value="client">Mijozlar</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600">Foydalanuvchi</th>
                        <th className="text-left py-3 px-4 text-gray-600">Telefon</th>
                        <th className="text-left py-3 px-4 text-gray-600">Rol</th>
                        <th className="text-left py-3 px-4 text-gray-600">Viloyat</th>
                        <th className="text-left py-3 px-4 text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 text-gray-600">Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-gray-800">{user.name}</p>
                              {user.profession && (
                                <p className="text-sm text-purple-600">{user.profession}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{user.phone}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'usta' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{user.region}</td>
                          <td className="py-3 px-4">
                            {user.isPremium ? (
                              <FaCrown className="text-yellow-500" title="Premium" />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleUserStatus(user._id)}
                                className={`p-2 rounded-lg ${
                                  user.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                } hover:opacity-80`}
                                title={user.isActive ? 'Bloklash' : 'Aktivlashtirish'}
                              >
                                <FaBan className="text-sm" />
                              </button>
                              <button
                                onClick={() => deleteUser(user._id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:opacity-80"
                                title="O'chirish"
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <FaUsers className="text-4xl text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Foydalanuvchilar topilmadi</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Kutilayotgan to'lovlar</h3>
                
                {stats?.recentPayments?.filter(p => p.status === 'pending').length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentPayments
                      .filter(p => p.status === 'pending')
                      .map((payment, index) => (
                        <div key={index} className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                              <p className="font-bold text-gray-800">{payment.userName}</p>
                              <p className="text-sm text-gray-600">{payment.userPhone}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Sana: {new Date(payment.date).toLocaleDateString('uz-UZ')}
                              </p>
                              <p className="text-lg font-bold text-purple-600 mt-2">
                                {payment.amount?.toLocaleString()} so'm
                              </p>
                            </div>
                            <div className="flex space-x-3 mt-4 md:mt-0">
                              <button
                                onClick={() => approvePayment(payment.userId)}
                                className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all flex items-center space-x-2"
                              >
                                <FaCheckCircle />
                                <span>Tasdiqlash</span>
                              </button>
                              <button
                                onClick={() => rejectPayment(payment.userId)}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center space-x-2"
                              >
                                <FaTimesCircle />
                                <span>Rad etish</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaCheckCircle className="text-4xl text-green-300 mx-auto mb-2" />
                    <p className="text-gray-500">Kutilayotgan to'lovlar yo'q</p>
                  </div>
                )}

                {/* To'lovlar tarixi */}
                <h3 className="font-bold text-gray-800 mt-8 mb-4">To'lovlar tarixi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600">Foydalanuvchi</th>
                        <th className="text-left py-3 px-4 text-gray-600">Summa</th>
                        <th className="text-left py-3 px-4 text-gray-600">Sana</th>
                        <th className="text-left py-3 px-4 text-gray-600">Holati</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentPayments?.map((payment, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <p className="font-semibold">{payment.userName}</p>
                            <p className="text-sm text-gray-500">{payment.userPhone}</p>
                          </td>
                          <td className="py-3 px-4 font-bold text-purple-600">
                            {payment.amount?.toLocaleString()} so'm
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(payment.date).toLocaleDateString('uz-UZ')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              payment.status === 'approved' ? 'bg-green-100 text-green-600' :
                              payment.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {payment.status === 'approved' ? 'Tasdiqlangan' :
                               payment.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;