import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Award, Calendar, User } from 'lucide-react';
import { challengesApi } from '../services/challengesApi';
import Loader from '../common/Loader';

const CertificateVerification = () => {
    const { id } = useParams();
    const [status, setStatus] = useState('loading'); // loading, valid, invalid
    const [data, setData] = useState(null);

    useEffect(() => {
        const verify = async () => {
             try {
                 const res = await challengesApi.verifyCertificate(id);
                 if (res.valid) {
                     setData(res);
                     setStatus('valid');
                 } else {
                     setStatus('invalid');
                 }
             } catch (e) {
                 setStatus('invalid');
             }
        };
        verify();
    }, [id]);

    if (status === 'loading') return <div className="min-h-screen bg-black flex items-center justify-center"><Loader /></div>;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
             {status === 'invalid' ? (
                 <div className="text-center space-y-4">
                     <XCircle size={64} className="text-red-500 mx-auto" />
                     <h1 className="text-2xl font-bold">Invalid or Expired Certificate</h1>
                     <p className="text-gray-400">The certificate ID provided could not be verified.</p>
                 </div>
             ) : (
                 <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-2xl p-8 space-y-6 text-center animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle size={40} className="text-green-500" />
                      </div>
                      
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                          Verified Certificate
                      </h1>
                      
                      <div className="space-y-4 py-4 border-y border-white/5">
                          <div className="flex items-center justify-between">
                              <span className="text-gray-400 flex items-center gap-2"><User size={16}/> Holder</span>
                              <span className="font-mono font-bold text-lg">{data.user}</span>
                          </div>
                          <div className="flex items-center justify-between">
                              <span className="text-gray-400 flex items-center gap-2"><Award size={16}/> Course</span>
                              <span className="font-bold">Python Mastery</span>
                          </div>
                          <div className="flex items-center justify-between">
                              <span className="text-gray-400 flex items-center gap-2"><Calendar size={16}/> Issued</span>
                              <span className="text-sm">{new Date(data.issued_at).toLocaleDateString()}</span>
                          </div>
                      </div>

                      <div className="pt-4">
                            <img 
                                src={data.certificate.certificate_image} 
                                alt="Certificate" 
                                className="w-full rounded-lg border border-white/10 shadow-2xl"
                            />
                      </div>

                      <p className="text-xs text-gray-500">
                          Verified by Code of Clans Platform
                          <br/>
                          ID: {id}
                      </p>
                 </div>
             )}
        </div>
    );
};

export default CertificateVerification;
