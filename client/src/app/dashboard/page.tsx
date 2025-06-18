'use client';
import { useEffect, useState } from 'react';
import axios from '../axiosInstance';
import { useRouter } from 'next/navigation';

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

  const handleGenerateVpnClient = async () => {
    try {
      const response = await axios.post('/api/vpn/generate');
      const base64Image = response.data.qr;
      const filename = response.data.filename;

      if (base64Image && filename) {
        setQrCode(base64Image);
        setFilename(filename);
        setIsQRModalOpen(true);
      } else {
        alert('Erro: QR code não recebido.');
      }
    } catch (error) {
      console.error('Erro ao gerar cliente VPN:', error);
      alert('Erro ao gerar cliente VPN.');
    }
  };

  const handleDownloadVpnConfig = async () => {
    try {
      const response = await axios.get('/api/vpn/download/' + filename, {
        responseType: 'blob',
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
    setResetText('VPN reseting...');
    try {
      const response = await axios.post('/api/vpn/reset');
      if (response.status === 200) {
        setResetText('VPN reseted successfully.');
      } else {
        alert('Erro ao resetar VPN.');
      }
    } catch (error) {
      console.error('Erro ao resetar VPN:', error);
      alert('Erro ao resetar VPN.');
    }
  };

  const fetchLog = async (type: 'network' | 'vpn' | 'ssh') => {
    setSelectedLog(type);
    setIsLogModalOpen(true);

    try {
      const response = await axios.get(`/api/logs/${type}`);
      setLogData(response.data['data'] || 'Log vazio.');
      
    } catch (error) {
      setLogData('Erro ao carregar log.');
    }
    setLoading(false);
  };

  const handleShareAuthenticator = async () => {
    try {
      const response = await axios.post('/api/ssh/share');
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
        setSshQRMModalOpen(true);
      } else {
        alert('Erro ao obter QR code.');
      }
    } catch (error) {
      console.error('Erro ao obter QR code:', error);
      alert('Erro ao obter QR code.');
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
              Admin Dashboard
            </h1>
          </div>
          <div className="left flex items-center ms-auto">
            <div className="dropdown relative">
              <button
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                covalgoncalo2003@gmail.com
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
                <button className="block rounded-t w-full px-4 py-2 text-left hover:bg-gray-100">
                  Change Password
                </button>
                <button className="block w-full px-4 py-2 text-left hover:bg-gray-100">
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
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Logs</h2>
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
                VPN Management
              </h2>
              <hr className="mb-4" />
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleGenerateVpnClient}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Generate VPN Client
                </button>
                <button 
                  onClick={() => {
                    setIsResetModalOpen(true);
                    setResetText('Are you sure you want to reset the VPN?');
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                  Reset VPN
                </button>
              </div>
            </div>

            <div className="left flex-1 min-w-full md:min-w-[48%] lg:min-w-[30%]">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                SSH Management
              </h2>
              <hr className="mb-4" />
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleShareAuthenticator}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Share Authenticator
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  View Blocked IPs
                </button>
              </div>
            </div>
          </div>

          <div className="section p-8 mb-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Network Management
            </h2>
            <hr className="mb-4" />
            <table className="w-full bg-white shadow-md rounded">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">IP Address</th>
                  <th className="py-2 px-4 text-left">MAC Address</th>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Created At</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4">1</td>
                  <td className="py-2 px-4">192.168.1.1</td>
                  <td className="py-2 px-4">00:1A:2B:3C:4D:5E</td>
                  <td className="py-2 px-4">Router</td>
                  <td className="py-2 px-4">12 June, 2025</td>
                  <td className="py-2 px-4">Allowed</td>
                  <td className="py-2 px-4">
                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2">
                      Allow
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Block
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

            {/* Log Modal */}
            {isLogModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b bg-white sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedLog?.toUpperCase()} Log
                </h2>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-y-auto ps-5 pe-5 bg-gray-100">
                {loading ? (
                  <p className="text-center text-gray-500">Loading...</p>
                ) : (
                  <pre className="p-1 rounded overflow-x-auto text-sm text-gray-800">
                  {logData}
                  </pre>
                )}
                </div>
                {/* Footer */}
                <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end">
                <button
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Close
                </button>
                </div>
              </div>
              </div>
            )}

          {/* VPN QR Code Modal */}
          {isQRModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b bg-white sticky top-0 z-10">
                  <h2 className="text-2xl font-bold text-gray-800">QR Code</h2>
                </div>
                <div className="flex-1 overflow-y-auto ps-5 pe-5 bg-gray-100">
                  {qrCode && (
                    <img
                      src={`data:image/png;base64,${qrCode}`}
                      alt="QR Code"
                      className="mx-auto my-4"
                    />
                  )}
                </div>
                <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end">

                  <button 
                    onClick={handleDownloadVpnConfig}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 me-2"
                  >
                    Download
                  </button>

                  <button
                    onClick={() => setIsQRModalOpen(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset VPN Modal */}
          {isResetModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b bg-white sticky top-0 z-10">
                  <h2 className="text-2xl font-bold text-gray-800">Reset VPN</h2>
                </div>
                <div className="flex-1 overflow-y-auto ps-5 pe-5 bg-gray-100 text-center p-3">
                  <p>{resetText}</p>
                </div>
                <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end">
                  <button
                    onClick={resetVpn}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 me-2"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          { /* Share Authenticator QR Code Modal*/}
          {sshQRModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b bg-white sticky top-0 z-10">
                  <h2 className="text-2xl font-bold text-gray-800">QR Code</h2>
                </div>
                <div className="flex-1 overflow-y-auto ps-5 pe-5 bg-gray-100">
                  {qrCode && (
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="mx-auto my-4"
                    />
                  )}
                </div>
                <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end">
                  <button
                    onClick={() => setSshQRMModalOpen(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Close
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
