// app/dashboard/setting/admin/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaUserShield, 
  FaUser, 
  FaSearch, 
  FaCheck, 
  FaTimes,
  FaCalendarAlt,
  FaEnvelope,
  FaArrowLeft
} from 'react-icons/fa';
import Link from 'next/link';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalMembers: number;
  recentUsers: number;
}

const AdminManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'member'>('all');
  const [updatingUsers, setUpdatingUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    
    setUpdatingUsers(prev => new Set(prev).add(userId));
    
    try {
      const response = await fetch('/api/admin/users/toggle-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      );

      // Update stats
      if (stats) {
        const adminChange = newRole === 'admin' ? 1 : -1;
        setStats(prev => prev ? {
          ...prev,
          totalAdmins: prev.totalAdmins + adminChange,
          totalMembers: prev.totalMembers - adminChange
        } : null);
      }

    } catch (error) {
      console.error('Error updating user role:', error);
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์ผู้ใช้');
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-100 w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 h-24 rounded"></div>
                ))}
              </div>
              <div className="bg-gray-100 h-96 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-900 text-lg mb-4 font-light">{error}</div>
          <button 
            type="button"
            onClick={fetchUsers}
            className="bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 transition-colors font-light text-sm"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-6 mb-4">
              <Link 
                href="/dashboard"
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaArrowLeft className="w-3 h-3 mr-2" />
                <span className="text-sm font-light">กลับ</span>
              </Link>
              <h1 className="text-2xl font-light text-gray-900 flex items-center gap-3">
                <FaUserShield className="w-6 h-6 text-gray-600" />
                จัดการผู้ดูแลระบบ
              </h1>
            </div>
            <p className="text-gray-500 font-light text-sm">
              จัดการสิทธิ์ผู้ใช้และผู้ดูแลระบบ
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-light text-gray-500 mb-1">ผู้ใช้ทั้งหมด</p>
                    <p className="text-xl font-light text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <FaUsers className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="bg-white border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-light text-gray-500 mb-1">ผู้ดูแลระบบ</p>
                    <p className="text-xl font-light text-gray-900">{stats.totalAdmins}</p>
                  </div>
                  <FaUserShield className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="bg-white border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-light text-gray-500 mb-1">ผู้ใช้ทั่วไป</p>
                    <p className="text-xl font-light text-gray-900">{stats.totalMembers}</p>
                  </div>
                  <FaUser className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="bg-white border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-light text-gray-500 mb-1">ผู้ใช้ใหม่ (7 วัน)</p>
                    <p className="text-xl font-light text-gray-900">{stats.recentUsers}</p>
                  </div>
                  <FaCalendarAlt className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, นามสกุล, อีเมล..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 focus:border-gray-400 focus:outline-none transition-colors font-light text-sm"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="lg:w-48">
                <select
                  title="กรองตามสิทธิ์"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'member')}
                  className="w-full px-3 py-2.5 border border-gray-200 focus:border-gray-400 focus:outline-none font-light text-sm"
                >
                  <option value="all">ทุกสิทธิ์</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                  <option value="member">ผู้ใช้ทั่วไป</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ผู้ใช้
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      อีเมล
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สิทธิ์
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่สมัคร
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.image ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.image}
                                alt={`${user.firstName} ${user.lastName}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaEnvelope className="w-3 h-3 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'admin' ? (
                            <>
                              <FaUserShield className="w-3 h-3 mr-1" />
                              ผู้ดูแลระบบ
                            </>
                          ) : (
                            <>
                              <FaUser className="w-3 h-3 mr-1" />
                              ผู้ใช้ทั่วไป
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-3 h-3 mr-2" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => toggleUserRole(user.id, user.role)}
                          disabled={updatingUsers.has(user.id)}
                          className={`inline-flex items-center px-3 py-1 border text-xs font-medium transition-colors ${
                            user.role === 'admin'
                              ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                              : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                          } ${
                            updatingUsers.has(user.id) 
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`}
                        >
                          {updatingUsers.has(user.id) ? (
                            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : user.role === 'admin' ? (
                            <FaTimes className="w-3 h-3 mr-1" />
                          ) : (
                            <FaCheck className="w-3 h-3 mr-1" />
                          )}
                          {user.role === 'admin' ? 'ยกเลิกสิทธิ์ admin' : 'ตั้งเป็น admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* No Results */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-light text-gray-600 mb-2">ไม่พบผู้ใช้</h3>
                <p className="text-gray-400 font-light text-sm">ลองปรับเปลี่ยนเงื่อนไขการค้นหา</p>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {filteredUsers.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 font-light">
                แสดง {filteredUsers.length} รายการ จากทั้งหมด {users.length} ผู้ใช้
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagementPage;