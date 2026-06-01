import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { FaUser, FaPhone, FaLock, FaMapMarkerAlt, FaBriefcase, FaUserTie, FaUser as FaClient } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    profession: '',
    region: 'Toshkent shahri',
    description: '',
    experience: ''
  });

  const regions = [
    'Toshkent shahri', 'Toshkent viloyati', 'Samarqand', 
    'Buxoro', 'Navoiy', 'Xorazm', 'Qashqadaryo', 
    'Surxondaryo', 'Jizzax', 'Sirdaryo', 
    'Farg\'ona', 'Andijon', 'Namangan'
  ];

  const professions = [
    'Santexnik', 'Elektrik', 'Quruvchi', 'Ta\'mirlash ustasi',
    'Dizayner', 'Marketolog', 'Dasturchi', 'Tarjimon',
    'O\'qituvchi', 'Haydovchi', 'Oshpaz', 'Tikuvchi',
    'Sartarosh', 'Fotograf', 'Videograf', 'Arxitektor',
    'Buxgalter', 'Yurist', 'Shifokor', 'Hamshira'
  ];

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.password) {
        toast.error('Barcha maydonlarni to\'ldiring');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Parollar mos kelmadi');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.role === 'usta' && !formData.profession) {
      toast.error('Kasbni tanlang');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        profession: formData.role === 'usta' ? formData.profession : undefined,
        region: formData.region,
        description: formData.description,
        experience: formData.experience
      });

      if (response.data.success) {
        login(response.data.user, response.data.token);
        toast.success('Ro\'yxatdan o\'tish muvaffaqiyatli!');
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Ro\'yxatdan o\'tishda xatolik';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className={`text-sm font-medium ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
                Hisob ma'lumotlari
              </span>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                Qo'shimcha ma'lumotlar
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ism-familiya
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ismingizni kiriting"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon raqam
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+998901234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parol
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Parol kiriting"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parolni tasdiqlang
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Parolni qayta kiriting"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Davom etish
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Siz kimsiz?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'client'})}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.role === 'client'
                          ? 'border-purple-600 bg-purple-50 shadow-lg'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <FaClient className={`text-4xl mx-auto mb-2 ${
                        formData.role === 'client' ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                      <p className={`font-semibold ${
                        formData.role === 'client' ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        Mijoz
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Usta qidiryapman</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'usta'})}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.role === 'usta'
                          ? 'border-purple-600 bg-purple-50 shadow-lg'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <FaUserTie className={`text-4xl mx-auto mb-2 ${
                        formData.role === 'usta' ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                      <p className={`font-semibold ${
                        formData.role === 'usta' ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        Usta
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Xizmat ko'rsataman</p>
                    </button>
                  </div>
                </div>

                {formData.role === 'usta' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kasbingiz
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBriefcase className="text-gray-400" />
                      </div>
                      <select
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.profession}
                        onChange={(e) => setFormData({...formData, profession: e.target.value})}
                      >
                        <option value="">Kasbni tanlang</option>
                        {professions.map(prof => (
                          <option key={prof} value={prof}>{prof}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viloyat
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <select
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                    >
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.role === 'usta' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tajribangiz (yil)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Tajribangiz necha yil?"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.role === 'usta' ? 'O\'zingiz haqingizda' : 'Qo\'shimcha ma\'lumot'}
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    placeholder={formData.role === 'usta' ? 'Qanday xizmatlar ko\'rsatasiz?' : 'Qanday usta kerak?'}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Orqaga
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Ro\'yxatdan o\'tish'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Allaqachon ro'yxatdan o'tganmisiz?{' '}
              <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700">
                Tizimga kirish
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;