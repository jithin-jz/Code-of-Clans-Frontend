import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { challengesApi } from "../services/challengesApi";
import CertificateTemplate from "../components/CertificateTemplate";

const CertificateVerification = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const data = await challengesApi.verifyCertificate(certificateId);
        setCertificate(data);
      } catch (err) {
        setError("Certificate not found or invalid");
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400 font-mono text-sm">Verifying...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-8 text-center">
          <div className="text-red-500 mb-4 flex justify-center">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 font-cinzel">
            Invalid Certificate
          </h2>
          <p className="text-zinc-400 mb-6 text-sm">
            {error || "This certificate could not be verified."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-yellow-600/10 text-yellow-500 border border-yellow-500/50 rounded hover:bg-yellow-600/20 transition text-sm font-medium"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Extract data from API response
  // Handle potential wrapper { valid: true, certificate: { ... } } or direct serializer return
  const certData = certificate.certificate || certificate;
  const studentName = certData.username || "Student Name"; // Serializer has 'username'
  const dateObj = new Date(
    certData.created_at || certData.issued_date || Date.now(),
  );
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const verifyUrl =
    certData.verification_url ||
    `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/verify/${certificateId}`;

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 flex flex-col items-center">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-500/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-yellow-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full relative z-10 flex flex-col items-center">
        {/* Verification Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium mb-4 uppercase tracking-wider">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Verified Certificate
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 font-cinzel">
            Certificate Authentication
          </h1>
          <p className="text-zinc-500 text-sm max-w-lg mx-auto">
            issued by the Clash of Code platform.
          </p>
        </div>

        {/* Certificate Display */}
        <div className="w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-4 sm:p-12 rounded-2xl shadow-2xl mb-10 overflow-x-auto flex justify-center">
          <div className="inline-block">
            <CertificateTemplate
              studentName={studentName}
              completionDate={formattedDate}
              verificationUrl={verifyUrl}
            />
          </div>
        </div>

        {/* Details & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Metadata Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">
              Certificate Metadata
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 text-sm">Issued To</span>
                <span className="text-zinc-200 text-sm font-medium">
                  {studentName}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 text-sm">Course</span>
                <span className="text-zinc-200 text-sm font-medium">
                  Python Mastery Course
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 text-sm">Issue Date</span>
                <span className="text-zinc-200 text-sm font-medium">
                  {formattedDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-sm">Verification ID</span>
                <span className="text-zinc-200 text-xs font-mono">
                  {certificateId}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6 flex flex-col justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2H7a2 2 0 00-2 2v4m14 0h-2"
                />
              </svg>
              Print Certificate
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-zinc-800/50 text-white font-medium rounded-lg hover:bg-zinc-800 transition-all border border-zinc-700/50"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <p className="mt-12 text-zinc-600 text-[11px] text-center max-w-md">
          Clash of Code certificates are issued upon completion of the full
          Python curriculum. This digital record serves as proof of achievement.
          For inquiries, contact support.
        </p>
      </div>
    </div>
  );
};

export default CertificateVerification;
