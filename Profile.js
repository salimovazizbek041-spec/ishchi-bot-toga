import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaUser, FaPhone, FaMapMarkerAlt, FaBriefcase, 
  FaStar, FaEdit, FaSave, FaTimes, FaCrown 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    experience: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setProfile(response.data.user);
      setFormData({
        name: response.data.user.name,
        description: response.data.user.description || '',
        experience: response.data.user.experience || ''
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Profilni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/auth/profile', formData);
      setProfile(response.data.user);
      updateUser(response.data.user);
      setEditing(false);
      toast.success('Profil yangilandi');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Yangilashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Profil yuklanmoqda..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 h-32" />
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
              <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                <span className="text-5xl font-bold gradient-text">
                  {profile?.name?.charAt(0) || 'U'}
                </span>
              </div>
              
              <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    {editing ? (
                      <input
                        type="text"
                        className="text-3xl font-bold text-gray-800 border-b-2 border-purple-600 focus:outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-gray-800">
                        {profile?.name}
                      </h1>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2">
                      {profile?.role === 'usta' && profile?.profession && (
                        <span className="flex items-center text-gray-600">
                          <FaBriefcase className="mr-2 text-purple-500" />
                          {profile.profession}
                        </span>
                      )}
                      <span className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                        {profile?.region}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {profile?.isPremium && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center">
                        <FaCrown className="mr-2" /> PREMIUM
                      </div>
                    )}
                    
                    {!editing ? (
                      <button
                        onClick={() => setEditing(true)}
                        className="bg-purple-100 text-purple-600 p-3 rounded-full hover:bg-purple-200 transition-all"
                      >
                        <FaEdit className="text-xl" />
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-all"
                        >
                          <FaSave className="text-xl" />
                        </button>
                        <button
                          onClick={() => {
                            setEditing(false);
                            setFormData({
                              name: profile.name,
                              description: profile.description || '',
                              experience: profile.experience || ''
                            });
                          }}
                          className="bg-red-100 text-red-600 p-3 rounded-full hover:bg-red-200 transition-all"
                        >
                          <FaTimes className="text-xl" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {profile?.role === 'usta' ? 'Men haqimda' : 'Ma\'lumot'}
                  </h3>
                  {editing ? (
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="O'zingiz haqingizda yozing..."
                    />
                  ) : (
                    <p className="text-gray-600">
                      {profile?.description || 'Ma\'lumot kiritilmagan'}
                    </p>
                  )}
                </div>

                {profile?.role === 'usta' && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Tajriba
                    </h3>
                    {editing ? (
                      <div className="flex items-center space-x-4">
                        <input
                          type="number"
                          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                          min="0"
                          max="50"
                        />
                        <span className="text-gray-600">yil</span>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-purple-600">
                        {profile?.experience || 0}
                        <span className="text-lg text-gray-500 ml-2">yil tajriba</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Kontakt
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="mr-3 text-purple-500" />
                      <span>{profile?.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-3 text-purple-500" />
                      <span className="capitalize">{profile?.role}</span>
                    </div>
                  </div>
                </div>

                {profile?.role === 'usta' && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Reyting
                    </h3>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-yellow-500 mb-2">
                        <FaStar className="text-4xl mr-2" />
                        <span className="text-4xl font-bold">
                          {profile?.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <p className="text-gray-500">
                        {profile?.totalReviews || 0} ta sharh
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;