import React, { useState } from 'react';
import { X, Share2, Copy, Check, Facebook, Twitter, MessageCircle, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
}

export default function ShareModal({ isOpen, onClose, url, title, description }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const shareText = `¡Mira este tour increíble: ${title}! ${description ? '\n' + description.substring(0, 100) + '...' : ''}`;
  
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="text-xl font-bold text-stone-900 flex items-center">
            <Share2 className="mr-2 text-emerald-600" size={20} />
            Compartir Tour
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {showQR ? (
            <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-stone-100">
                <QRCodeSVG value={url} size={200} includeMargin={true} />
              </div>
              <p className="text-sm text-stone-500 text-center">Escanea este código para ver el tour en tu celular</p>
              <button 
                onClick={() => setShowQR(false)}
                className="text-emerald-600 font-bold text-sm hover:underline"
              >
                Volver a opciones de compartir
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                <a 
                  href={shareLinks.whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center space-y-2 group"
                >
                  <div className="w-14 h-14 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300">
                    <MessageCircle size={28} />
                  </div>
                  <span className="text-xs font-bold text-stone-600">WhatsApp</span>
                </a>

                <a 
                  href={shareLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center space-y-2 group"
                >
                  <div className="w-14 h-14 bg-[#1877F2]/10 text-[#1877F2] rounded-2xl flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all duration-300">
                    <Facebook size={28} />
                  </div>
                  <span className="text-xs font-bold text-stone-600">Facebook</span>
                </a>

                <button 
                  onClick={() => setShowQR(true)}
                  className="flex flex-col items-center space-y-2 group"
                >
                  <div className="w-14 h-14 bg-stone-100 text-stone-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <QrCode size={28} />
                  </div>
                  <span className="text-xs font-bold text-stone-600">Código QR</span>
                </button>

                <button 
                  onClick={copyToClipboard}
                  className="flex flex-col items-center space-y-2 group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${copied ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'}`}>
                    {copied ? <Check size={28} /> : <Copy size={28} />}
                  </div>
                  <span className="text-xs font-bold text-stone-600">{copied ? 'Copiado' : 'Copiar Link'}</span>
                </button>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <p className="text-xs font-bold text-stone-400 uppercase mb-2">Link del Tour</p>
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-sm text-stone-600 truncate grow font-mono">{url}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}