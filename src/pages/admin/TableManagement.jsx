import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, Coffee, ExternalLink, Smartphone } from 'lucide-react';
import { useCafe } from '../../context/CafeContext';

export default function TableManagement() {
  const { activeCafe } = useCafe();
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    const origin = window.location.origin;
    const cafeQuery = activeCafe?.slug ? `cafe=${activeCafe.slug}` : '';
    const fullUrl = `${origin}/menu${cafeQuery ? `?${cafeQuery}` : ''}`;
    setTargetUrl(fullUrl);
  }, [activeCafe?.slug]);

  const downloadQrCode = () => {
    const canvas = document.getElementById('main-cafe-qr-canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${activeCafe?.slug || 'trio_bean'}_qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const printQrCard = () => {
    const canvas = document.getElementById('main-cafe-qr-canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const cafeName = activeCafe?.name || 'Trio Bean Café';
    const cafeTagline = activeCafe?.tagline || 'Fresh • Tasty • Made Daily';
    const cafeLogo = activeCafe?.logo_url || activeCafe?.logoUrl;
    const logoImg = cafeLogo
      ? `<img src="${cafeLogo}" style="max-height:60px;margin-bottom:12px;display:inline-block;border-radius:12px;" />`
      : '';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${cafeName} - Digital Menu QR Stand</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; padding: 40px; background: #FAF6F0; color: #2C1A14; }
            .card { border: 4px solid #C8963E; border-radius: 32px; padding: 40px 32px; display: inline-block; background: white; box-shadow: 0 15px 40px rgba(44,26,20,0.12); max-width: 400px; width: 100%; box-sizing: border-box; }
            h1 { margin: 6px 0 0 0; font-size: 26px; color: #2C1A14; letter-spacing: 2px; font-weight: 900; font-family: Georgia, serif; }
            .sub { font-size: 11px; color: #C8963E; margin-top: 6px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
            img.qr { margin: 22px auto 14px; border: 4px solid #FAF6F0; border-radius: 20px; box-shadow: 0 6px 20px rgba(44,26,20,0.08); display: block; }
            p.instructions { font-size: 13px; color: #2C1A14; font-weight: 800; margin-top: 14px; letter-spacing: 1px; text-transform: uppercase; }
            p.helper { font-size: 12px; color: #6D4C41; margin-top: 6px; line-height: 1.4; }
            .footer { font-size: 10px; color: #8D6E63; margin-top: 20px; text-transform: uppercase; letter-spacing: 1.5px; border-top: 1px solid #EFE6D8; padding-top: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            ${logoImg}
            <h1>${cafeName.toUpperCase()}</h1>
            <div class="sub">${cafeTagline}</div>
            <img class="qr" src="${dataUrl}" width="220" height="220" />
            <p class="instructions">Scan to View Menu & Order</p>
            <p class="helper">Point your phone camera at the QR code to browse our full menu and place orders from your seating.</p>
            <div class="footer">TRIO BEAN DIGITAL DINING SYSTEM</div>
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
              TRIO BEAN SEATING QR CODE
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2C1A14]">
              Customer Seating QR Stand
            </h1>
          </div>

          {targetUrl && (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#F5EFE6] text-[#2C1A14] hover:bg-[#EFE6D8] font-bold text-xs flex items-center space-x-2 transition-all shadow-xs"
            >
              <span>Preview Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full flex flex-col items-center space-y-6">

          {/* Centered Luxury Trio Bean QR Stand Card */}
          <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE6D8] shadow-lg flex flex-col items-center text-center space-y-6">
            
            {/* Cafe Identity Header */}
            <div className="flex flex-col items-center space-y-2">
              {(activeCafe?.logo_url || activeCafe?.logoUrl) ? (
                <img
                  src={activeCafe.logo_url || activeCafe.logoUrl}
                  alt={activeCafe.name}
                  className="w-14 h-14 object-contain rounded-2xl mx-auto shadow-md border border-[#EFE6D8] p-1 bg-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#2C1A14] text-[#E5C170] flex items-center justify-center mx-auto shadow-md">
                  <Coffee className="w-6 h-6" />
                </div>
              )}
              
              <div>
                <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#2C1A14] tracking-wide">
                  {(activeCafe?.name || 'TRIO BEAN CAFÉ').toUpperCase()}
                </h2>
                <p className="text-[11px] font-bold text-[#C8963E] uppercase tracking-widest mt-0.5">
                  {activeCafe?.tagline || 'FRESH • TASTY • MADE DAILY'}
                </p>
              </div>
            </div>

            {/* High-Contrast, Geometrically Centered QR Code Box */}
            <div className="w-full flex flex-col items-center justify-center p-6 bg-[#FAF6F0] rounded-3xl border-2 border-[#EFE6D8] shadow-inner">
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center justify-center">
                {targetUrl ? (
                  <QRCodeCanvas
                    id="main-cafe-qr-canvas"
                    value={targetUrl}
                    size={220}
                    bgColor="#FFFFFF"
                    fgColor="#2C1A14"
                    level="H"
                    includeMargin={false}
                    className="block mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center text-xs text-[#6D4C41]">
                    Generating QR Code...
                  </div>
                )}
              </div>

              {/* Scannable Instruction Subtitle */}
              <div className="mt-4 space-y-1 text-center">
                <p className="text-xs font-extrabold text-[#2C1A14] tracking-wider uppercase">
                  SCAN WITH PHONE CAMERA TO ORDER
                </p>
                <div className="text-[11px] font-mono text-[#6D4C41] font-semibold flex items-center justify-center space-x-1.5 max-w-sm truncate">
                  <Smartphone className="w-3.5 h-3.5 text-[#C8963E] shrink-0" />
                  <span className="truncate">{targetUrl}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Prominently displayed under the card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-2">
              <button
                onClick={downloadQrCode}
                className="py-3.5 px-4 rounded-2xl bg-[#F5EFE6] text-[#2C1A14] hover:bg-[#EFE6D8] font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs active:scale-98"
              >
                <Download className="w-4 h-4 text-[#C8963E]" />
                <span>DOWNLOAD PNG</span>
              </button>

              <button
                onClick={printQrCard}
                className="py-3.5 px-4 rounded-2xl bg-[#2C1A14] text-[#E5C170] hover:bg-[#3E2723] font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT SEATING QR STAND</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
