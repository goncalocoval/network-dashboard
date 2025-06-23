'use client';
import { useEffect, useState } from 'react';
import axios from '../axiosInstance';
import { useRouter } from 'next/navigation';
import './dashboard.css';

export default function Dashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<'network' | 'vpn' | 'ssh' | null>(null); // 'network', 'vpn', 'ssh'
  const [logData, setLogData] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetText, setResetText] = useState('');
  const [sshQRModalOpen, setSshQRMModalOpen] = useState(false);
  const [isBlockedIPsModalOpen, setIsBlockedIPsModalOpen] = useState(false);
  const [blockedData, setBlockedData] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [sshMessage, setSshMessage] = useState('');
  const [vpnMessage, setVpnMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  type Device = {
    name?: string;
    ip: string;
    mac?: string;
  };
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResettingVpn, setIsResettingVpn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }

    setUserEmail(localStorage.getItem('email'));

    axios.get('/api/network/devices', {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then((response) => {
        setConnectedDevices(response.data.devices || []);
      })
      .catch((error) => {
        const tableMessage = document.getElementById('tableMessage');
        if (tableMessage) {
          tableMessage.textContent = 'Error loading network devices. Please try again later.';
        }
      });
  }, []);

  useEffect(() => {
    const checkServer = async () => {
      try {
        
        const response = await axios.get('/',{
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },  
        });

      } catch (error) {
        alert('Connection to server lost. Redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        window.location.href = '/login';
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);
  
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const clearInputs = () => {
    setNewUserEmail('');
    setNewUserPassword('');
    setNewPassword('');
    setOldPassword('');
  };

  const handleAddUser = async () => {
    setIsAddingUser(true);

    const message = document.getElementById('addUserMessage');
    if (message) {
      message.classList.add('hidden');
      message.classList.remove('text-red-800', 'text-green-800');
    }

    if (!newUserEmail || !newUserPassword || newUserPassword.length < 10) {
      if (message) {
        message.classList.remove('hidden');
        message.classList.add('text-red-800');
        message.textContent = 'Please fill in all fields with valid data.';
        setTimeout(() => {
          message.classList.add('hidden');
        }, 2000);
      }
      setIsAddingUser(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        email: newUserEmail,
        password: newUserPassword,
      });

      if (message) {
        message.classList.remove('hidden');
        message.classList.add('text-green-800');
        message.textContent = 'User created successfully!';
        setTimeout(() => {
          message.classList.add('hidden');
        }, 2000);
      }

      setNewUserEmail('');
      setNewUserPassword('');
    } catch (error: any) {
      if (message) {
        message.classList.remove('hidden');
        message.classList.add('text-red-800');
        message.textContent = 'Error creating user (possibly already exists)!';
        setTimeout(() => {
          message.classList.add('hidden');
        }, 2000);
      }
    }
    setIsAddingUser(false);
  };

  const handleChangePassword = async () => {
    setIsChangingPassword(true);

    const message = document.getElementById('changePasswordMessage');
    if (message) {
      message.classList.add('hidden');
      message.classList.remove('text-red-800', 'text-green-800');
    }

    if (!newPassword || newPassword.length < 10) {
      if (message) {
        message.classList.remove('hidden');
        message.classList.add('text-red-800');
        message.textContent = 'Please fill in all fields with valid data.';
        setTimeout(() => {
          message.classList.add('hidden');
        }, 2000);
      }
      setIsChangingPassword(false);
      return;
    }

    try {
      const email = localStorage.getItem('email');
      await axios.patch('/api/auth/update-password', {
        email: email,
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

      if (message) {
        message.classList.remove('hidden');
        message.classList.add('text-green-800');
        message.textContent = 'Password changed successfully!';
        setTimeout(() => {
          message.classList.add('hidden');
        }, 2000);
      }

      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      if (message) {
        message.classList.remove('hidden');
        message.classList.add('text-red-800');
        message.textContent = 'Error changing password!';
        setTimeout(() => {
          message.classList.add('hidden');
        }, 2000);
      }
    }
    setIsChangingPassword(false);
  };

  const handleGenerateVpnClient = async () => {
    setIsQRModalOpen(true);
    setQrCode(null);
    setFilename(null);
    setVpnMessage('Loading...');
    try {
      const response = await axios.post('/api/vpn/generate');
      const base64Image = response.data.qr;
      const filename = response.data.filename;

      if (base64Image && filename) {
        setVpnMessage('Scan this QR code with the Wireguard app:');
        setQrCode(base64Image);
        setFilename(filename);
      } else {
        setVpnMessage('Error generating QR code. Please try again.');
      }
    } catch (error) {
      setVpnMessage('Error generating QR code. Please try again.');
    }
  };

  const handleDownloadVpnConfig = async () => {
    
    try {
      const response = await axios.get('/api/vpn/download/' + filename, {
        responseType: 'blob',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },  
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'vpn_config.conf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
    catch (error) {
      console.error('Erro ao baixar configuração VPN:', error);
      alert('Erro ao baixar configuração VPN.');
    }
  };

  const resetVpn = async () => {
    setIsResettingVpn(true);
    setResetText('VPN reseting...');
    const resetTextElement = document.getElementById('resetVpnText');
    if (resetTextElement) {
      resetTextElement.classList.remove('text-green-800', 'text-red-800');
    }
    try {
      const response = await axios.post('/api/vpn/reset');
      if (response.status === 200) {
        if (resetTextElement) {
          resetTextElement.classList.add('text-green-800');
        }
        setResetText('VPN reseted successfully.');
      } else {
        if (resetTextElement) {
          resetTextElement.classList.add('text-red-800');
        }
        setResetText('Failed to reset VPN.');
      }
    } catch (error) {
      setResetText('Error resetting VPN.');
    }
    setIsResettingVpn(false);
  };

  const fetchLog = async (type: 'network' | 'vpn' | 'ssh') => {
    setSelectedLog(type);
    setIsLogModalOpen(true);
    setLoading(true);

    try {
      const response = await axios.get(`/api/logs/${type}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      setLogData(response.data['data'] || 'No log data available.');
      
    } catch (error) {
      setLogData('Erro ao carregar log.');
    }
    setLoading(false);
  };

  const handleShareAuthenticator = async () => {
    setQrCode(null);
    setSshMessage('Loading...');
    setSshQRMModalOpen(true);
    
    try {
      const response = await axios.post('/api/ssh/share');
      if (response.data.qrCode) {
        setSshMessage('Scan this QR code with the Google Authenticator app:');
        setQrCode(response.data.qrCode);
      } else {
        setSshMessage('Error generating QR code. Please try again.');
      }
    } catch (error) {
      setSshMessage('Error generating QR code. Please try again.');
    }

  };

  const handleViewBlockedIPs = async () => {
    setIsBlockedIPsModalOpen(true);
    setBlockedData('Loading...');
    try {
      const response = await axios.get('/api/ssh/view', {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      const total = response.data.total || 0;
      const ips = response.data.blockedIps || [];

      const formatted = `Total blocked IPs: ${total}\n\n${ips.map((ip: string, index: number) => `${index + 1}. ${ip}`).join('\n') || 'No blocked IPs found.'}`;
      setBlockedData(formatted);
      
    } catch (error) {
      console.error('Erro ao obter IPs bloqueados:', error);
    }
  };

  return (
    <div className="dashboard p-5 bg-gray-100 min-h-screen">
      <div>
        <div className="section flex flex-wrap p-8 mb-4 sticky rounded bg-white shadow w-full z-10 top-0">
          <div className="left flex items-center">
            <img
              src="https://brandlogos.net/wp-content/uploads/2020/09/raspberry-pi-logo.png"
              className="max-w-10"
              alt=""
            />
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Dashboard
            </h1>
          </div>
          <div className="left flex items-center ms-auto">
            <div className="dropdown relative">
              <button
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="text-sm font-semibold">
                  {userEmail || 'User'}
                </span>
                <svg
                  className="w-4 h-4 ml-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded border-2 border-gray-200 ${
                  dropdownOpen ? 'block' : 'hidden'
                }`}
              >

                <button
                  className="block rounded-t w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                >
                  Change Password
                </button>
                <button
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => setIsAddUserModalOpen(true)}
                >
                  Add User
                </button>

                <button className="block rounded-b w-full bg-red-600 px-4 py-2 text-left hover:bg-red-700 text-white"
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('email');
                    window.location.href = '/login';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="section p-8 flex flex-wrap gap-4">
            <div className="left flex-1 min-w-full md:min-w-[48%] lg:min-w-[30%]">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">📝 Logs</h2>
              <hr className="mb-4" />
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => fetchLog('network')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Network Log
                </button>
                <button 
                  onClick={() => fetchLog('vpn')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  VPN Log
                </button>
                <button 
                  onClick={() => fetchLog('ssh')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  SSH Log
                </button>
              </div>
            </div>

            <div className="left flex-1 min-w-full md:min-w-[48%] lg:min-w-[30%]">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                🔐 VPN Management
              </h2>
              <hr className="mb-4" />
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleGenerateVpnClient}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Generate VPN Client
                </button>
                <button 
                  onClick={() => {
                    setIsResetModalOpen(true);
                    setResetText('Are you sure you want to reset the VPN? This will remove all current VPN configurations and clients.');
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                  Reset VPN
                </button>
              </div>
            </div>

            <div className="left flex-1 min-w-full md:min-w-[48%] lg:min-w-[30%]">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                💻 SSH Management
              </h2>
              <hr className="mb-4" />
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleShareAuthenticator}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Share Authenticator
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleViewBlockedIPs}
                >
                  View Blocked IPs
                </button>
              </div>
            </div>
          </div>

          <div className="section p-8 mb-4 mt-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              🌐 Online Devices on Network
            </h2>
            <hr className="mb-4" />
            <table className="w-full bg-white shadow-md rounded">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">IP Address</th>
                  <th className="py-2 px-4 text-left">MAC Address</th>
                </tr>
              </thead>
              <tbody>
                {connectedDevices.length === 0 ? (
                  <tr>
                    <td colSpan={7} id="tableMessage" className="py-4 px-4 text-center text-gray-500">Loading network devices...</td>
                  </tr>
                ) : (
                  connectedDevices.map((device, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4">{index + 1}</td>
                      <td className="py-2 px-4">{device.name || device.ip}</td>
                      <td className="py-2 px-4">{device.ip}</td>
                      <td className="py-2 px-4">{device.mac || ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

            {/* Log Modal */}
            {isLogModalOpen && (
              <div className="fixed inset-0 bg-gray-200 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-hidden flex flex-col modal-content">
                {/* Header */}
                <div className="pt-3 pb-5 border-b bg-white sticky top-0 z-10">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedLog?.toUpperCase()} Log
                  </h2>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <p className="text-center text-gray-500 p-4">Loading...</p>
                  ) : (
                    <pre className="p-1 rounded overflow-x-auto text-sm text-gray-800">
                    {logData}
                    </pre>
                  )}
                </div>
                {/* Footer */}
                <div className="pt-4 border-t bg-white sticky bottom-0 z-10 flex justify-end">
                <button
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
                </div>
              </div>
              </div>
            )}

          {/* VPN QR Code Modal */}
          {isQRModalOpen && (
            <div className="fixed inset-0 bg-gray-200 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-hidden flex flex-col modal-content">
                <div className="pt-3 pb-5 border-b bg-white sticky top-0 z-10">
                  <h2 className="text-2xl font-bold text-gray-800">QR Code</h2>
                </div>
                <div className="flex-1 overflow-y-auto ps-5 pe-5 bg-gray-100">
                  <p className="text-center text-gray-500 p-4">
                    {vpnMessage}
                  </p>
                  {qrCode && (
                    <img
                      src={`data:image/png;base64,${qrCode}`}
                      alt="QR Code"
                      className="mx-auto my-4"
                    />
                  )}
                </div>
                <div className="pt-4 border-t bg-white sticky bottom-0 z-10 flex justify-end">

                  <button
                    onClick={() => setIsQRModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 me-2"
                  >
                    Close
                  </button>

                  <button 
                    onClick={handleDownloadVpnConfig}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={!qrCode}
                  >
                    Download
                  </button>

                  
                </div>
              </div>
            </div>
          )}

          {/* Reset VPN Modal */}
          {isResetModalOpen && (
            <div className="fixed inset-0 bg-gray-200 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-hidden flex flex-col modal-content">
                <div className="pt-3 pb-5 border-b bg-white sticky top-0 z-10">
                  <h2 className="text-2xl font-bold text-gray-800">Reset VPN</h2>
                </div>
                <div className="flex-1 overflow-y-auto ps-5 pe-5 bg-gray-100 text-center p-3">
                  <p id="resetVpnText" className="text-gray-500 p-4">{resetText}</p>
                </div>
                <div className="pt-4 border-t bg-white sticky bottom-0 z-10 flex justify-end">
                  <button
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 me-2"
                  >
                    Close
                  </button>
                  <button
                    onClick={resetVpn}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={isResettingVpn}
                  >
                    {isResettingVpn ? 'Loading...' : 'Reset'}
                  </button>
                </div>
              </div>
            </div>
          )}

          { /* Share Authenticator QR Code Modal*/}
          {sshQRModalOpen && (
            <div className="fixed inset-0 bg-gray-200 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-hidden flex flex-col modal-content">
                <div className="pt-3 pb-5  border-b bg-white sticky top-0 z-10">
                  <h2 className="text-2xl font-bold text-gray-800">QR Code</h2>
                </div>
                <div className="flex-1 overflow-y-auto ps-5 pe-5 bg-gray-100">
                  <p className="text-center text-gray-500 p-4">
                    {sshMessage}
                  </p>
                  {qrCode && (
                    <img
                      src={qrCode}
                      alt="Error getting QR Code. Please try again."
                      className="mx-auto my-4"
                    />
                  )}
                </div>
                <div className="pt-4 border-t bg-white sticky bottom-0 z-10 flex justify-end">
                  <button
                    onClick={() => setSshQRMModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          { /* View Blocked IPs Modal */}
          {isBlockedIPsModalOpen && (
            <div className="fixed inset-0 bg-gray-200 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-hidden flex flex-col modal-content">
                <div className="pt-3 pb-5 border-b bg-white sticky top-0 z-10">
                  <h2 className="text-2xl font-bold text-gray-800">Blocked IPs</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {blockedData ? (
                    <pre className="p-1 rounded overflow-x-auto text-sm text-gray-800">
                      {blockedData}
                    </pre>
                  ) : (
                    <p className="text-center text-gray-500">No blocked IPs found.</p>
                  )}
                </div>
                <div className="pt-4 border-t bg-white sticky bottom-0 z-10 flex justify-end">
                  <button
                    onClick={() => setIsBlockedIPsModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {isAddUserModalOpen && (
            <div className="fixed inset-0 bg-gray-200 flex items-center justify-center z-50">
              <div className="modal-content">
                <h2 className="text-xl font-bold mb-4">Add New User</h2>
                <p className="hidden text-center mb-4" id="addUserMessage"></p>
                <input
                  type="email"
                  placeholder="Email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-3"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                <p className="text-sm text-gray-500 mb-4">
                  Password must be at least 10 characters long.
                </p>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsAddUserModalOpen(false);
                      clearInputs();
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    disabled={isAddingUser}
                  >
                    {isAddingUser ? 'Loading...' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isChangePasswordModalOpen && (
            <div className="fixed inset-0 bg-gray-200 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 modal-content">
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <p className="hidden text-center mb-4" id="changePasswordMessage"></p>
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                <p className="text-sm text-gray-500 mb-4">
                  Password must be at least 10 characters long.
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsChangePasswordModalOpen(false);
                      clearInputs();
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? 'Loading...' : 'Change'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}

          <div className="section p-8 mb-4">
            <hr className="mb-3" />
            <p className="text-center text-gray-700">Copyright © 2025 Diogo Curralo, Gonçalo Coval and Tiago Dias </p>
          </div>

        </div>
      </div>
    </div>
  );
}
