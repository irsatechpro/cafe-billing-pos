import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, Sparkles, Coffee, ExternalLink, Smartphone } from 'lucide-react';
import { useCafe } from '../../context/CafeContext';

export default function TableManagement() {
  const { activeCafe } = useCafe();
  const currentWifiIp = '192.168.0.3'; // Detected local Wi-Fi IP

  const cafeQueryParam = activeCafe?.slug ? `?cafe=${activeCafe.slug}` : '';

  const [targetUrl, setTargetUrl] = useState(() => {
    const saved = localStorage.getItem(`cafe_qr_url_${activeCafe?.id || 'default'}`);
    if (saved) return saved;
    return `http://${currentWifiIp}:3002/menu${cafeQueryParam}`;
  });
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(targetUrl);

  useEffect(() => {
    const hostname = window.location.hostname;
    const port = window.location.port || '3002';
    const slugParam = activeCafe?.slug ? `?cafe=${activeCafe.slug}` : '';

    const storageKey = `cafe_qr_url_${activeCafe?.id || 'default'}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      setTargetUrl(saved);
      setCustomUrlInput(saved);
    } else if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const liveUrl = `${window.location.protocol}//${window.location.host}/menu${slugParam}`;
      setTargetUrl(liveUrl);
      setCustomUrlInput(liveUrl);
    } else {
      const wifiUrl = `http://${currentWifiIp}:${port}/menu${slugParam}`;
      setTargetUrl(wifiUrl);
      setCustomUrlInput(wifiUrl);
    }
  }, [activeCafe?.id, activeCafe?.slug]);

  const handleSaveCustomUrl = (newUrl) => {
    const trimmed = (newUrl || '').trim();
    if (trimmed) {
      setTargetUrl(trimmed);
      localStorage.setItem(`cafe_qr_url_${activeCafe?.id || 'default'}`, trimmed);
    }
    setIsEditingUrl(false);
  };

  const handleResetDefault = () => {
    const port = window.location.port || '3002';
    const slugParam = activeCafe?.slug ? `?cafe=${activeCafe.slug}` : '';
    const defaultUrl = `http://${currentWifiIp}:${port}/menu${slugParam}`;
    setTargetUrl(defaultUrl);
    setCustomUrlInput(defaultUrl);
    localStorage.removeItem(`cafe_qr_url_${activeCafe?.id || 'default'}`);
    setIsEditingUrl(false);
  };

  const downloadQrCode = () => {
    const canvas = document.getElementById('main-cafe-qr-canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${activeCafe?.slug || 'cafe'}_digital_menu_qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const printQrCard = () => {
    const canvas = document.getElementById('main-cafe-qr-canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const cafeName = activeCafe?.name || 'Trio Bean Café';
    const cafeLogo = activeCafe?.logo_url || activeCafe?.logoUrl;
    const logoImg = cafeLogo ? `<img src="${cafeLogo}" style="max-height:50px;margin-bottom:12px;display:inline-block;border-radius:8px;" />` : '';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${cafeName} - Digital Menu QR Stand</title>
          <style>
            body { font-family: 'Georgia', serif; text-align: center; padding: 40px; background: #FAF6F0; color: #2C1A14; }
            .card { border: 4px solid #C8963E; border-radius: 32px; padding: 40px; display: inline-block; background: white; box-shadow: 0 15px 40px rgba(0,0,0,0.12); max-width: 420px; }
            h1 { margin: 0; font-size: 30px; color: #2C1A14; letter-spacing: 2px; font-weight: bold; }
            .sub { font-size: 13px; color: #C8963E; margin-top: 8px; font-weight: bold; letter-spacing: 2px; }
            p { font-size: 14px; color: #6D4C41; margin-top: 18px; line-height: 1.5; }
            img.qr { margin: 20px auto; border: 4px solid #FAF6F0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: block; }
            .footer { font-size: 11px; color: #8D6E63; margin-top: 15px; text-transform: uppercase; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          <div class="card">
            ${logoImg}
            <h1>${cafeName.toUpperCase()}</h1>
            <div class="sub">DIGITAL MENU & ORDERING</div>
            <img class="qr" src="${dataUrl}" width="230" height="230" />
            <p>Scan this QR code with your phone camera to view our digital menu & place your order!</p>
            <div class="footer">${tagline}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF6F0] text-[#2C1A14]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-b border-[#EFE6D8] sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-widest font-mono">
              DIGITAL MENU QR CODE
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C1A14]">
              {activeCafe?.name || 'Trio Bean Café'} QR Stand
            </h1>
          </div>

          {targetUrl && (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#F5EFE6] text-[#2C1A14] hover:bg-[#EFE6D8] font-bold text-xs flex items-center space-x-2 transition-all shadow-xs"
            >
              <span>Open Menu in Browser</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Perfectly Centered QR Stand Card (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE6D8] shadow-lg flex flex-col items-center text-center space-y-5">
                
                {/* Cafe Identity Header */}
                <div className="flex flex-col items-center space-y-1.5">
                  {(activeCafe?.logo_url || activeCafe?.logoUrl) ? (
                    <img
                      src={activeCafe.logo_url || activeCafe.logoUrl}
                      alt={activeCafe.name}
                      className="w-12 h-12 object-contain rounded-2xl mx-auto shadow-md border border-[#EFE6D8] p-1 bg-white"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-[#2C1A14] text-[#E5C170] flex items-center justify-center mx-auto shadow-md">
                      <Coffee className="w-5 h-5" />
                    </div>
                  )}
                  <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#2C1A14] tracking-wide">
                    {(activeCafe?.name || 'TRIO BEAN CAFÉ').toUpperCase()}
                  </h2>
                  <p className="text-[11px] font-bold text-[#C8963E] uppercase tracking-widest">
                    {activeCafe?.tagline || 'FRESH • TASTY • MADE DAILY'}
                  </p>
                </div>

                {/* High-Contrast, Geometrically Centered QR Code Box */}
                <div className="w-full flex flex-col items-center justify-center p-5 bg-[#FAF6F0] rounded-2xl border-2 border-[#EFE6D8] shadow-inner">
                  <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center justify-center">
                    {targetUrl ? (
                      <QRCodeCanvas
                        id="main-cafe-qr-canvas"
                        value={targetUrl}
                        size={210}
                        bgColor="#FFFFFF"
                        fgColor="#2C1A14"
                        level="H"
                        includeMargin={false}
                        className="block mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="w-[210px] h-[210px] flex items-center justify-center text-xs text-[#6D4C41]">
                        Generating QR Code...
                      </div>
                    )}
                  </div>

                  {/* Scannable Instruction Subtitle */}
                  <div className="mt-3.5 space-y-1">
                    <p className="text-xs font-bold text-[#2C1A14] tracking-wide">
                      SCAN WITH PHONE CAMERA TO ORDER
                    </p>
                    <div className="text-[11px] font-mono text-[#6D4C41] font-semibold flex items-center justify-center space-x-1.5 truncate max-w-xs">
                      <Smartphone className="w-3.5 h-3.5 text-[#C8963E] shrink-0" />
                      <span className="truncate">{targetUrl}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Prominently displayed right under the card */}
                <div className="grid grid-cols-2 gap-3 w-full pt-1">
                  <button
                    onClick={downloadQrCode}
                    className="py-3 px-3 rounded-2xl bg-[#F5EFE6] text-[#2C1A14] hover:bg-[#EFE6D8] font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4 text-[#C8963E]" />
                    <span>DOWNLOAD PNG</span>
                  </button>

                  <button
                    onClick={printQrCard}
                    className="py-3 px-3 rounded-2xl bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723] font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PRINT QR STAND</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: QR Settings & Wi-Fi Configuration (5 cols on desktop) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Wi-Fi & URL Manager Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EFE6D8] shadow-xs space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-[#EFE6D8]">
                  <Smartphone className="w-4 h-4 text-[#C8963E]" />
                  <h3 className="font-serif font-bold text-base text-[#2C1A14]">
                    QR Code Target URL
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#6D4C41] block">
                    Current Menu URL Encoded in QR:
                  </label>
                  
                  {isEditingUrl ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="http://192.168.0.3:3002/menu"
                        className="w-full bg-[#FAF6F0] border border-[#C8963E] px-3.5 py-2 rounded-xl text-xs font-mono text-[#2C1A14] focus:outline-none"
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSaveCustomUrl(customUrlInput)}
                          className="px-4 py-1.5 rounded-xl bg-[#2C1A14] text-[#E5C170] text-xs font-bold hover:bg-[#3E2723]"
                        >
                          Save New URL
                        </button>
                        <button
                          onClick={handleResetDefault}
                          className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-300"
                        >
                          Reset Default
                        </button>
                        <button
                          onClick={() => setIsEditingUrl(false)}
                          className="text-xs text-stone-500 hover:text-stone-700 underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EFE6D8] font-mono text-xs text-[#2C1A14] break-all select-all font-semibold">
                        {targetUrl}
                      </div>
                      <button
                        onClick={() => setIsEditingUrl(true)}
                        className="text-xs text-[#C8963E] font-bold hover:underline inline-flex items-center space-x-1"
                      >
                        <span>Change / Edit Wi-Fi IP Address</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions Card */}
              <div className="bg-amber-50/80 rounded-3xl p-5 border border-amber-200/80 space-y-2.5 text-xs text-amber-950">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <Sparkles className="w-4 h-4 text-[#C8963E]" />
                  <span>How Customers Scan & Order</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed text-amber-900/90">
                  <li>Place the printed QR stand on your cafe tables or cashier counter.</li>
                  <li>Customer opens their standard phone camera (Android or iPhone).</li>
                  <li>Customer points camera at the QR code and taps the link.</li>
                  <li>The digital menu opens instantly with your cafe's name, logo, and theme!</li>
                </ol>
              </div>

              {/* Print Tip Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#EFE6D8] text-xs space-y-1 text-[#6D4C41]">
                <p className="font-bold text-[#2C1A14]">
                  💡 Tabletop Stand Advice:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Click <strong>PRINT QR STAND</strong> to print an acrylic tent-card insert on standard A4 or cardstock paper.
                </p>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
