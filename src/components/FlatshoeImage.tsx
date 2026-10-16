import React, { useState } from 'react';

interface FlatshoeImageProps {
  src?: string;
  alt: string;
  category?: string;
  color?: string;
  className?: string;
  shoeName?: string;
}

export const FlatshoeImage: React.FC<FlatshoeImageProps> = ({
  src,
  alt,
  category = 'Flat Shoes Klasik',
  color = 'Soft Blush Pink',
  className = '',
  shoeName = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Normalize name to identify unique cute shoe model
  const name = (shoeName || alt).toLowerCase();

  // Color schemes and features for the 12 cute shoe models
  const getShoeTheme = () => {
    // 1. Mochi Peach Puff Ribbon
    if (name.includes('peach') || name.includes('puff')) {
      return {
        id: 'peach-puff',
        mainGradient: ['#ffb7a5', '#f89a85'],
        accent: '#e66b55',
        sole: '#fae3dd',
        inner: '#fff0ec',
        type: 'ballerina-ribbon',
        detail: 'double-puff-ribbon',
      };
    }
    // 2. Daisy Cloud Butter
    if (name.includes('daisy') || name.includes('butter')) {
      return {
        id: 'daisy-butter',
        mainGradient: ['#fef3c7', '#fde68a'],
        accent: '#d97706',
        sole: '#fffbeb',
        inner: '#fefce8',
        type: 'ballerina-round',
        detail: 'daisy-flower',
      };
    }
    // 3. Strawberry Milk Mary Jane
    if (name.includes('strawberry') || name.includes('mary jane')) {
      return {
        id: 'strawberry-mj',
        mainGradient: ['#fca5a5', '#f87171'],
        accent: '#dc2626',
        sole: '#ffe4e6',
        inner: '#fff1f2',
        type: 'mary-jane',
        detail: 'pearl-strap',
      };
    }
    // 4. Caramel Bear Cloud Ballerina
    if (name.includes('caramel') || name.includes('bear') || name.includes('teddy')) {
      return {
        id: 'caramel-bear',
        mainGradient: ['#d7a77d', '#b98154'],
        accent: '#8c5931',
        sole: '#f5ebe0',
        inner: '#faf5f0',
        type: 'ballerina-round',
        detail: 'bear-bow',
      };
    }
    // 5. Sakura Blossom Pointed
    if (name.includes('sakura') || name.includes('blossom')) {
      return {
        id: 'sakura-pointed',
        mainGradient: ['#fbcfe8', '#f472b6'],
        accent: '#db2777',
        sole: '#fdf2f8',
        inner: '#fdf4ff',
        type: 'pointed',
        detail: 'sakura-blossom',
      };
    }
    // 6. Lilac Fairy Star Pointed
    if (name.includes('lilac') || name.includes('star') || name.includes('fairy')) {
      return {
        id: 'lilac-star',
        mainGradient: ['#e9d5ff', '#c084fc'],
        accent: '#9333ea',
        sole: '#faf5ff',
        inner: '#f5f3ff',
        type: 'pointed',
        detail: 'star-gem',
      };
    }
    // 7. Boba Pearl Milk Tea Pointed
    if (name.includes('boba') || name.includes('milk tea') || name.includes('pearl')) {
      return {
        id: 'pearl-milktea',
        mainGradient: ['#e6ccb2', '#ddb892'],
        accent: '#9c6644',
        sole: '#f7ede2',
        inner: '#faf0ca',
        type: 'pointed',
        detail: 'pearl-row',
      };
    }
    // 8. Matcha Sweet Pistachio Pointed
    if (name.includes('matcha') || name.includes('pistachio')) {
      return {
        id: 'matcha-pointed',
        mainGradient: ['#dcfce7', '#86efac'],
        accent: '#16a34a',
        sole: '#f0fdf4',
        inner: '#f7fee7',
        type: 'pointed',
        detail: 'leaf-charm',
      };
    }
    // 9. Honey Biscuit Mochi Loafer
    if (name.includes('honey') || name.includes('biscuit')) {
      return {
        id: 'honey-biscuit',
        mainGradient: ['#fed7aa', '#fdba74'],
        accent: '#ea580c',
        sole: '#ffedd5',
        inner: '#fff7ed',
        type: 'loafer-quilt',
        detail: 'biscuit-pillows',
      };
    }
    // 10. Berry Mochi Penny Loafer
    if (name.includes('berry') || name.includes('penny')) {
      return {
        id: 'berry-penny',
        mainGradient: ['#fda4af', '#fb7185'],
        accent: '#e11d48',
        sole: '#fff1f2',
        inner: '#ffe4e6',
        type: 'loafer-classic',
        detail: 'heart-slot',
      };
    }
    // 11. Vanilla Marshmallow Weave
    if (name.includes('marshmallow') || name.includes('weave')) {
      return {
        id: 'vanilla-marshmallow',
        mainGradient: ['#ffffff', '#f3f4f6'],
        accent: '#e57391',
        sole: '#ffe4e6',
        inner: '#fff5f7',
        type: 'slip-on-weave',
        detail: 'marshmallow-cushion',
      };
    }
    // 12. Choco Mochi Cozy Loafer
    if (name.includes('choco') || name.includes('espresso') || name.includes('mocha')) {
      return {
        id: 'choco-cozy',
        mainGradient: ['#4a3728', '#2b1e16'],
        accent: '#e26d8d',
        sole: '#fbcfe8',
        inner: '#fed7aa',
        type: 'loafer-classic',
        detail: 'choco-pink-sole',
      };
    }

    // Default Sweet Pastel
    return {
      id: 'default-sweet',
      mainGradient: ['#fbcfe8', '#f472b6'],
      accent: '#be185d',
      sole: '#fdf2f8',
      inner: '#fff1f2',
      type: 'ballerina-ribbon',
      detail: 'double-puff-ribbon',
    };
  };

  const theme = getShoeTheme();

  // Render SVG illustration meticulously customized to the cute name
  const renderCuteIllustration = () => {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#fff7f9] to-[#fdeef2] p-3 select-none ${className}`}>
        <svg
          viewBox="0 0 320 220"
          className="w-full h-full max-h-60 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`grad-${theme.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.mainGradient[0]} />
              <stop offset="100%" stopColor={theme.mainGradient[1]} />
            </linearGradient>
            <radialGradient id={`insoleGrad-${theme.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={theme.inner} />
            </radialGradient>
            <filter id={`shadow-${theme.id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#723b49" floodOpacity="0.14" />
            </filter>
          </defs>

          {/* Soft Ground Shadow */}
          <ellipse cx="160" cy="184" rx="120" ry="14" fill="#dec4cb" opacity="0.45" filter="blur(4px)" />

          {/* Outsole (Sol Karet 1cm Mochi Empuk) */}
          <path
            d="M50 166 C90 171 160 171 220 168 C256 165 284 157 286 150 C286 145 272 147 236 152 C176 160 100 160 50 156 C40 156 38 162 50 166 Z"
            fill={theme.sole}
            stroke="#d4b5bc"
            strokeWidth="0.8"
          />

          {/* Main Shoe Silhouette depending on category/type */}
          {theme.type === 'pointed' ? (
            /* POINTED ELEGANT SILHOUETTE */
            <path
              d="M48 155 C42 134 46 104 60 96 C74 88 88 108 122 118 C168 128 224 116 276 126 C296 130 300 144 286 150 C250 162 136 166 48 155 Z"
              fill={`url(#grad-${theme.id})`}
              filter={`url(#shadow-${theme.id})`}
            />
          ) : theme.type.includes('loafer') || theme.type === 'slip-on-weave' ? (
            /* LOAFER & SLIP-ON SILHOUETTE */
            <path
              d="M48 155 C42 136 46 102 64 100 C84 98 104 110 140 114 C188 118 238 110 274 118 C294 122 294 142 278 150 C242 162 136 164 48 155 Z"
              fill={`url(#grad-${theme.id})`}
              filter={`url(#shadow-${theme.id})`}
            />
          ) : (
            /* BALLERINA & MARY JANE ROUND SILHOUETTE */
            <path
              d="M48 155 C40 134 46 102 62 100 C78 98 94 112 132 120 C180 128 232 118 270 126 C288 130 290 144 276 150 C242 162 136 164 48 155 Z"
              fill={`url(#grad-${theme.id})`}
              filter={`url(#shadow-${theme.id})`}
            />
          )}

          {/* Inner Insole (Busa Mochi 8mm Cushion Bed) */}
          <path
            d="M66 108 C82 104 108 118 144 124 C192 130 234 124 258 128 C246 139 204 146 144 146 C94 146 72 126 66 108 Z"
            fill={`url(#insoleGrad-${theme.id})`}
            stroke={theme.accent}
            strokeWidth="0.8"
          />

          {/* Mochi Steps Gold/Rose Imprint on Insole */}
          <text
            x="144"
            y="139"
            textAnchor="middle"
            fill={theme.accent}
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="sans-serif"
            letterSpacing="1.2"
            opacity="0.85"
          >
            MOCHI STEPS
          </text>

          {/* Stitching Lines (Jahitan Rapih Halus) */}
          <path
            d="M52 148 C100 155 180 155 264 145"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeDasharray="3 2"
            opacity="0.6"
          />

          {/* ================= DISTINCTIVE CUTE ACCESSORIES ================= */}

          {/* 1. Mochi Peach Puff: Double Puffy Soft Ribbon Bow */}
          {theme.detail === 'double-puff-ribbon' && (
            <g transform="translate(254, 126)">
              {/* Left loop */}
              <ellipse cx="-8" cy="-3" rx="10" ry="6" fill={theme.accent} transform="rotate(-20)" />
              <ellipse cx="-8" cy="-3" rx="6" ry="3" fill="#ffccd5" transform="rotate(-20)" />
              {/* Right loop */}
              <ellipse cx="8" cy="-3" rx="10" ry="6" fill={theme.accent} transform="rotate(20)" />
              <ellipse cx="8" cy="-3" rx="6" ry="3" fill="#ffccd5" transform="rotate(20)" />
              {/* Center puffy knot with tiny heart */}
              <circle cx="0" cy="-3" r="5" fill="#ffffff" stroke={theme.accent} strokeWidth="1.5" />
              <path d="M-2 -4 Q0 -6 2 -4 Q0 -1 -2 -4 Z" fill={theme.accent} />
              {/* Ribbon tails */}
              <path d="M-3 2 C-7 9 -10 14 -12 16" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M3 2 C7 9 10 14 12 16" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* 2. Daisy Cloud Butter: Daisy Flower Charm */}
          {theme.detail === 'daisy-flower' && (
            <g transform="translate(252, 124)">
              {/* 8 White Daisy Petals */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                <ellipse
                  key={idx}
                  cx="0"
                  cy="-9"
                  rx="4"
                  ry="7"
                  fill="#ffffff"
                  stroke="#fbbf24"
                  strokeWidth="0.5"
                  transform={`rotate(${angle})`}
                />
              ))}
              {/* Center Sunny Golden Disc */}
              <circle cx="0" cy="0" r="6" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
              <circle cx="-1.5" cy="-1.5" r="1.5" fill="#fef3c7" opacity="0.8" />
            </g>
          )}

          {/* 3. Strawberry Mary Jane: Cross strap with pearl button */}
          {theme.detail === 'pearl-strap' && (
            <g>
              {/* Mary Jane Across Strap */}
              <path
                d="M136 114 C148 108 174 108 184 116"
                stroke={theme.accent}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M136 114 C148 108 174 108 184 116"
                stroke="#ffe4e6"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Shimmering Pearl Button */}
              <circle cx="184" cy="116" r="4.5" fill="#ffffff" stroke="#e11d48" strokeWidth="1" />
              <circle cx="183" cy="114.5" r="1.8" fill="#ffffff" />
              {/* Tiny strawberry icon at vamp */}
              <g transform="translate(252, 128)">
                <path d="M0 0 C-4 -6 -4 -10 0 -11 C4 -10 4 -6 0 0 Z" fill="#ef4444" />
                <path d="M-2 -11 C-1 -13 0 -12 1 -11" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="-1" cy="-6" r="0.6" fill="#ffffff" />
                <circle cx="1" cy="-4" r="0.6" fill="#ffffff" />
              </g>
            </g>
          )}

          {/* 4. Caramel Bear: Cute Teddy Bear Bow */}
          {theme.detail === 'bear-bow' && (
            <g transform="translate(252, 126)">
              {/* Bear Ears */}
              <circle cx="-5" cy="-8" r="3.5" fill="#b98154" stroke="#8c5931" strokeWidth="0.8" />
              <circle cx="5" cy="-8" r="3.5" fill="#b98154" stroke="#8c5931" strokeWidth="0.8" />
              {/* Bear Head Silhouette */}
              <ellipse cx="0" cy="-3" rx="7" ry="6" fill="#d7a77d" stroke="#8c5931" strokeWidth="1" />
              <ellipse cx="0" cy="-1.5" rx="3.5" ry="2.5" fill="#faf5f0" />
              <ellipse cx="0" cy="-2.5" rx="1.2" ry="0.8" fill="#4a2810" />
              <circle cx="-2" cy="-4" r="0.8" fill="#4a2810" />
              <circle cx="2" cy="-4" r="0.8" fill="#4a2810" />
            </g>
          )}

          {/* 5. Sakura Blossom: 5-Petal Flower Gemstone */}
          {theme.detail === 'sakura-blossom' && (
            <g transform="translate(262, 128)">
              {[0, 72, 144, 216, 288].map((angle, idx) => (
                <path
                  key={idx}
                  d="M0 -3 C-3 -9 0 -12 0 -12 C0 -12 3 -9 0 -3 Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                  transform={`rotate(${angle})`}
                />
              ))}
              {/* Crystal Center */}
              <circle cx="0" cy="0" r="3.5" fill="#ffffff" stroke="#db2777" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="#f43f5e" />
            </g>
          )}

          {/* 6. Lilac Fairy Star: Star Gemstone Buckle */}
          {theme.detail === 'star-gem' && (
            <g transform="translate(260, 126)">
              {/* 4-Point Shimmering Star */}
              <path
                d="M0 -10 Q0 0 10 0 Q0 0 0 10 Q0 0 -10 0 Q0 0 0 -10 Z"
                fill="#ffffff"
                stroke="#9333ea"
                strokeWidth="1.2"
              />
              <circle cx="0" cy="0" r="3" fill="#c084fc" />
              <circle cx="-1" cy="-1" r="1" fill="#ffffff" />
            </g>
          )}

          {/* 7. Boba Pearl Milk Tea: Row of 5 Pearls */}
          {theme.detail === 'pearl-row' && (
            <g transform="translate(230, 122)">
              {[-16, -8, 0, 8, 16].map((offset, idx) => (
                <g key={idx} transform={`translate(${offset}, ${Math.abs(offset) * 0.25})`}>
                  <circle cx="0" cy="0" r="3.5" fill="#fffdfa" stroke="#b08968" strokeWidth="0.8" />
                  <circle cx="-1" cy="-1" r="1" fill="#ffffff" />
                </g>
              ))}
            </g>
          )}

          {/* 8. Matcha Sweet Pistachio: Golden Leaf Buckle */}
          {theme.detail === 'leaf-charm' && (
            <g transform="translate(258, 126)">
              <ellipse cx="-4" cy="-2" rx="7" ry="4" fill="#fde047" stroke="#ca8a04" strokeWidth="1" transform="rotate(-30)" />
              <ellipse cx="4" cy="2" rx="7" ry="4" fill="#fde047" stroke="#ca8a04" strokeWidth="1" transform="rotate(30)" />
              <line x1="-8" y1="-4" x2="8" y2="4" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="0" cy="0" r="2.5" fill="#86efac" stroke="#16a34a" strokeWidth="0.8" />
            </g>
          )}

          {/* 9. Honey Biscuit: Puffy Quilted Biscuit Pattern */}
          {theme.detail === 'biscuit-pillows' && (
            <g transform="translate(210, 108)">
              {/* Biscuit Quilt Lines */}
              <path
                d="M-10 6 L35 6 M-5 14 L30 14"
                stroke="#c2410c"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                opacity="0.7"
              />
              {/* Little Honey Drop */}
              <circle cx="16" cy="10" r="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
            </g>
          )}

          {/* 10. Berry Mochi Penny: Heart Slot Penny Strap */}
          {theme.detail === 'berry-penny' && (
            <g transform="translate(200, 104)">
              {/* Classic Penny Saddle Strap */}
              <rect x="0" y="0" width="36" height="12" rx="4" fill={theme.accent} stroke="#ffffff" strokeWidth="0.8" />
              {/* Cut-out Heart Slot instead of coin slit */}
              <path
                d="M18 7 C18 5 16 4 14.5 4 C13 4 12 5 12 6.5 C12 8.5 15 10 18 11.5 C21 10 24 8.5 24 6.5 C24 5 23 4 21.5 4 C20 4 18 5 18 7 Z"
                fill="#ffffff"
              />
            </g>
          )}

          {/* 11. Vanilla Marshmallow Weave: Fluffy Cloud Texture */}
          {theme.detail === 'marshmallow-cushion' && (
            <g transform="translate(190, 110)">
              {/* Woven stitch lines */}
              <path
                d="M0 4 C10 1 20 7 30 4 C40 1 50 7 60 4"
                stroke="#e5e7eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0 10 C10 7 20 13 30 10 C40 7 50 13 60 10"
                stroke="#e5e7eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Fluffy Marshmallow Puff on Collar */}
              <circle cx="50" cy="2" r="4" fill="#fdf2f4" stroke="#f472b6" strokeWidth="1" />
            </g>
          )}

          {/* 12. Choco Mochi Cozy: Contrast Pink Sole & Bow */}
          {theme.detail === 'choco-pink-sole' && (
            <g transform="translate(248, 120)">
              {/* Playful Pink Bow contrasting with dark chocolate */}
              <ellipse cx="-6" cy="-2" rx="7" ry="4" fill="#f472b6" stroke="#db2777" strokeWidth="0.8" transform="rotate(-15)" />
              <ellipse cx="6" cy="-2" rx="7" ry="4" fill="#f472b6" stroke="#db2777" strokeWidth="0.8" transform="rotate(15)" />
              <circle cx="0" cy="-2" r="3" fill="#ffffff" stroke="#db2777" strokeWidth="1" />
            </g>
          )}

          {/* Soft Leather Sheen / Highlight */}
          <path
            d="M62 98 C72 104 88 108 114 112"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </div>
    );
  };

  // If image failed or no src, render clean illustration
  if (imageError || !src) {
    return renderCuteIllustration();
  }

  return (
    <div className={`relative overflow-hidden bg-[#fff2f5] group ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setImageError(true)}
        className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
      />
    </div>
  );
};
