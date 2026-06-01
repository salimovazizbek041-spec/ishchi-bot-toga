import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaMoneyBillWave, FaCreditCard, FaCheckCircle, 
  FaTimesCircle, FaClock, FaPhone, FaCopy, FaCrown 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Payment = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const CARD_NUMBER = '9860036601075512';
  const ADMIN_PHONE = '934556998';
  const MONTHLY_PRICE = 60000;

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const [historyRes, statusRes] = await Promise.all([
        api.get('/payment/history'),
        api.get('/payment/premium-status')
      ]);
      
      setPaymentHistory(historyRes.data.paymentHistory);
      setPremiumStatus(statusRes.data);
    } catch (error) {
      console.error('Payment data fetch error:', error);
      toast.error('To\'lov ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const response = await api.post('/payment/pay', {
        note: 'Premium oylik to\'lov'
      });
      
      toast.success(response.data.message);
      setShowPaymentModal(false);
      fetchPaymentData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'To\'lov so\'rovida xatolik');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Nusxalandi');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500 text-2xl" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500 text-2xl" />;
      default:
        return <FaClock className="text-yellow-500 text-2xl" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Tasdiqlangan';
      case 'rejected':
        return 'Rad etilgan';
      default:
        return 'Kutilmoqda';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <LoadingSpinner text="To'lov ma'lumotlari yuklanmoqda..." />;
  }

  if (user?.role !== 'usta') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              To'lov faqat ustalar uchun
            </h2>
            <p className="text-gray-600">
              Premium to'lov faqat usta sifatida ro'yxatdan o'tgan foydalanuvchilar uchun mavjud
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Premium Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                premiumStatus?.isActive 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                  : 'bg-gray-200'
              }`}>
                <FaCrown className={`text-3xl ${
                  premiumStatus?.isActive ? 'text-white' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {premiumStatus?.isActive ? 'Premium Aktiv' : 'Premium Emas'}
                </h2>
                {premiumStatus?.isActive ? (
                  <p className="text-gray-600">
                    Tugash muddati: {new Date(premiumStatus.premiumExpiry).toLocaleDateString('uz-UZ')}
                    <span className="ml-2 text-purple-600 font-semibold">
                      ({premiumStatus.daysLeft} kun qoldi)
                    </span>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Premium bo'ling va ko'proq mijozlar toping
                  </p>
                )}
              </div>
            </div>

            {!premiumStatus?.isActive && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center space-x-2"
              >
                <FaCrown />
                <span>Premium bo'lish</span>
              </button>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Premium To'lov
              </h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <p className="text-gray-600 mb-2">Oylik to'lov</p>
                    <p className="text-4xl font-bold text-purple-600">
                      {MONTHLY_PRICE.toLocaleString()} so'm
                    </p>
                    <p className="text-sm text-gray-500 mt-1">30 kunlik premium</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-4">To'lov kartasi</h4>
                  
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <FaCreditCard className="text-2xl text-purple-600" />
                      <div>
                        <p className="font-mono text-lg font-bold text-gray-800">
                          {CARD_NUMBER.match(/.{1,4}/g).join(' ')}
                        </p>
                        <p className="text-sm text-gray-500">UZCARD/HUMO</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(CARD_NUMBER)}
                      className="text-purple-600 hover:text-purple-700 p-2"
                      title="Karta raqamini nusxalash"
                    >
                      <FaCopy className="text-xl" />
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-3">To'lov tartibi:</h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="font-bold mr-2">1.</span>
                      Yuqoridagi kartaga {MONTHLY_PRICE.toLocaleString()} so'm o'tkazing
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">2.</span>
                      "To'lov qildim" tugmasini bosing
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">3.</span>
                      24 soat ichida admin tomonidan tasdiqlanadi
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">4.</span>
                      Muammo bo'lsa: 
                      <a href={`tel:${ADMIN_PHONE}`} className="text-purple-600 font-semibold ml-1">
                        {ADMIN_PHONE}
                      </a>
                    </li>
                  </ol>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handlePayment}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    To'lov qildim
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            To'lovlar tarixi
          </h2>

          {paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-gray-600 font-semibold">Sana</th>
                    <th className="text-left py-4 px-4 text-gray-600 font-semibold">Summa</th>
                    <th className="text-left py-4 px-4 text-gray-600 font-semibold">Holati</th>
                    <th className="text-left py-4 px-4 text-gray-600 font-semibold">Izoh</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-800">
                        {new Date(payment.date).toLocaleDateString('uz-UZ')}
                        <br />
                        <span className="text-sm text-gray-500">
                          {new Date(payment.date).toLocaleTimeString('uz-UZ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-purple-600">
                          {payment.amount?.toLocaleString()} so'm
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(payment.status)}`}>
                            {getStatusText(payment.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">
                          {payment.adminNote || payment.transactionNote || '-'}
                        </p>
                        {payment.status === 'rejected' && (
                          <a
                            href={`tel:${ADMIN_PHONE}`}
                            className="text-purple-600 text-sm font-semibold flex items-center mt-1"
                          >
                            <FaPhone className="mr-1" />
                            Admin bilan bog'lanish
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Hozircha to'lovlar tarixi bo'sh</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;